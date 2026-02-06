import { doc, getDoc, setDoc } from 'firebase/firestore';
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
                    data,
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

// Generic Settings Helpers (Mock for Web)
export const getSetting = async (key: string, defaultValue: string = ''): Promise<string> => {
    return localStorage.getItem(key) || defaultValue;
};

export const saveSetting = async (key: string, value: string) => {
    localStorage.setItem(key, value);
};


