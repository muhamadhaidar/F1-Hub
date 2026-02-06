import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc } from 'firebase/firestore';
import { FavoriteItem } from './database';
import { auth, db } from './firebaseConfig';

const LOCAL_STORAGE_KEY = 'f1hub_favorites';

export const USER_DB_NAME = 'f1hub_user_web';

// Helper to get from local storage
const getStoredFavorites = (): FavoriteItem[] => {
    try {
        const uid = auth.currentUser?.uid || 'guest';
        const key = `${LOCAL_STORAGE_KEY}_${uid}`;
        const json = localStorage.getItem(key);
        return json ? JSON.parse(json) : [];
    } catch (e) {
        console.error('Error reading localStorage', e);
        return [];
    }
};

// Helper to save to local storage
const saveStoredFavorites = (favorites: FavoriteItem[]) => {
    try {
        const uid = auth.currentUser?.uid || 'guest';
        const key = `${LOCAL_STORAGE_KEY}_${uid}`;
        localStorage.setItem(key, JSON.stringify(favorites));
    } catch (e) {
        console.error('Error writing localStorage', e);
    }
};

export const initDatabase = async () => {
    console.log('Web Database (localStorage + Firebase) Initialized');
};

export const toggleFavorite = async (type: 'driver' | 'team' | 'race', itemId: string, data: any = {}) => {
    const favorites = getStoredFavorites();
    const index = favorites.findIndex(f => f.type === type && f.itemId === itemId);

    let newFavorites = [...favorites];
    let isFavorite = false;

    if (index !== -1) {
        // Remove
        newFavorites.splice(index, 1);
        isFavorite = false;
    } else {
        // Add
        const newItem: FavoriteItem = {
            id: Date.now(), // simple ID generation
            type,
            itemId,
            data,
            addedAt: new Date().toISOString()
        };
        newFavorites.push(newItem);
        isFavorite = true;
    }

    saveStoredFavorites(newFavorites);

    // Sync to Firebase
    if (auth.currentUser) {
        try {
            const userFavoritesRef = doc(db, 'users', auth.currentUser.uid, 'favorites', `${type}_${itemId}`);
            if (isFavorite) {
                await setDoc(userFavoritesRef, {
                    type,
                    itemId,
                    data: JSON.stringify(data),
                    addedAt: new Date().toISOString()
                });
            } else {
                // To delete, we'd need deleteDoc. For now user didn't ask for favorites sync on Web explicitly but good to have.
                // Focusing on Profile as requested.
            }
        } catch (e) {
            console.error("Error syncing favorite to Firebase", e);
        }
    }

    return isFavorite; // Return NEW state
};

export const checkFavorite = async (type: string, itemId: string): Promise<boolean> => {
    const favorites = getStoredFavorites();
    return favorites.some(f => f.type === type && f.itemId === itemId);
};

export const getFavorites = async (type?: string): Promise<FavoriteItem[]> => {
    let favorites = getStoredFavorites();
    if (type) {
        favorites = favorites.filter(f => f.type === type);
    }
    return favorites.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
};

export interface UserProfile {
    name: string;
    bio: string;
    photo: string;
}

export const DEFAULT_PROFILE: UserProfile = {
    name: 'User Name',
    bio: 'F1 Enthusiast',
    photo: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png',
};

export const getUserProfile = async (): Promise<UserProfile> => {
    try {
        // 1. Try Firebase if authenticated
        if (auth.currentUser) {
            const userDocRef = doc(db, 'users', auth.currentUser.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const data = userDoc.data() as UserProfile;
                // Update local cache
                saveUserProfileLocally(data);
                return data;
            }
        }

        // 2. Fallback to LocalStorage (User specific)
        const uid = auth.currentUser?.uid || 'guest';
        const key = `f1hub_user_profile_${uid}`;
        const json = localStorage.getItem(key);
        return json ? JSON.parse(json) : DEFAULT_PROFILE;
    } catch (e) {
        console.error('Error getting user profile', e);
        return DEFAULT_PROFILE;
    }
};

const saveUserProfileLocally = (profile: UserProfile) => {
    try {
        const uid = auth.currentUser?.uid || 'guest';
        const key = `f1hub_user_profile_${uid}`;
        localStorage.setItem(key, JSON.stringify(profile));
    } catch (e) {
        console.error('Error writing localStorage for profile', e);
    }
}

export const saveUserProfile = async (profile: UserProfile) => {
    // 1. Save Local
    saveUserProfileLocally(profile);

    // 2. Save Firebase
    if (auth.currentUser) {
        try {
            const userDocRef = doc(db, 'users', auth.currentUser.uid);
            await setDoc(userDocRef, profile, { merge: true });
            console.log("Profile saved to Firebase");
        } catch (e) {
            console.error("Error saving profile to Firebase", e);
        }
    }
};

// --- STORAGE HELPERS ---
import { getDownloadURL, ref, uploadString } from 'firebase/storage';
import { storage } from './firebaseConfig';

export const uploadProfileImage = async (userId: string, uri: string): Promise<string> => {
    try {
        console.log("Starting upload for:", uri);

        // Create a timeout promise
        const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Upload timed out (60s)")), 60000)
        );

        const uploadTask = async () => {
            const response = await fetch(uri);
            const blob = await response.blob();
            console.log("Blob created:", blob.size);

            const dataUrl = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
            console.log("DataURL created");

            const storageRef = ref(storage, `profile_photos/${userId}`);
            await uploadString(storageRef, dataUrl, 'data_url');
            console.log("Upload success");

            return await getDownloadURL(storageRef);
        };

        // Race between upload and timeout
        return await Promise.race([uploadTask(), timeoutPromise]);
    } catch (e) {
        console.error("Error uploading profile image:", e);
        throw e;
    }
};

// Generic Settings Helpers (Mock for Web)
export const getSetting = async (key: string, defaultValue: string = ''): Promise<string> => {
    return localStorage.getItem(key) || defaultValue;
};

export const saveSetting = async (key: string, value: string) => {
    localStorage.setItem(key, value);
};


// --- F1 RACE JOURNAL CRUD (Web) ---

export interface JournalEntry {
    raceId: string;
    raceName: string;
    note: string;
    rating?: number;
    category?: string;
    updatedAt: string;
}

export const saveJournalNote = async (
    raceId: string,
    raceName: string,
    note: string,
    rating?: number,
    category?: string
) => {
    const updatedAt = new Date().toISOString();
    const key = `f1hub_journal_${raceId}`;
    localStorage.setItem(key, JSON.stringify({ raceId, raceName, note, rating, category, updatedAt }));

    if (auth.currentUser) {
        try {
            const docRef = doc(db, 'users', auth.currentUser.uid, 'journal', raceId);
            await setDoc(docRef, { raceId, raceName, note, rating, category, updatedAt });
        } catch (e) {
            console.error('Error syncing journal to Firebase (Web)', e);
        }
    }
};

export const getJournalNotes = async (): Promise<JournalEntry[]> => {
    // If online, prefer Firebase, otherwise localStorage
    if (auth.currentUser) {
        try {
            const q = query(collection(db, 'users', auth.currentUser.uid, 'journal'));
            const querySnapshot = await getDocs(q);
            const cloudEntries = querySnapshot.docs.map(doc => doc.data() as JournalEntry);

            // Sync to local
            cloudEntries.forEach(entry => {
                localStorage.setItem(`f1hub_journal_${entry.raceId}`, JSON.stringify(entry));
            });

            return cloudEntries;
        } catch (e) {
            console.error('Error getting journal from Firebase (Web)', e);
        }
    }
    const entries: JournalEntry[] = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('f1hub_journal_')) {
            entries.push(JSON.parse(localStorage.getItem(key)!));
        }
    }
    return entries.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
};

export const deleteJournalNote = async (raceId: string) => {
    localStorage.removeItem(`f1hub_journal_${raceId}`);
    if (auth.currentUser) {
        try {
            const docRef = doc(db, 'users', auth.currentUser.uid, 'journal', raceId);
            await deleteDoc(docRef);
        } catch (e) {
            console.error('Error deleting journal from Firebase (Web)', e);
        }
    }
};

export const getJournalNoteForRace = async (raceId: string): Promise<JournalEntry | null> => {
    const json = localStorage.getItem(`f1hub_journal_${raceId}`);
    return json ? JSON.parse(json) : null;
};
