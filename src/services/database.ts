import NetInfo from '@react-native-community/netinfo';
import * as SQLite from 'expo-sqlite';
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { Platform } from 'react-native';
import { auth, db } from './firebaseConfig';

export const USER_DB_NAME = 'f1hub_user.db';
const LOCAL_STORAGE_KEY = 'f1hub_favorites';

// Helper for Web LocalStorage
const getWebFavorites = (): FavoriteItem[] => {
  try {
    const json = localStorage.getItem(LOCAL_STORAGE_KEY);
    return json ? JSON.parse(json) : [];
  } catch (e) {
    console.error('Error reading localStorage', e);
    return [];
  }
};

const saveWebFavorites = (favorites: FavoriteItem[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(favorites));
  } catch (e) {
    console.error('Error writing localStorage', e);
  }
};

export const initDatabase = async () => {
  if (Platform.OS === 'web') {
    console.log('Web Database (localStorage) Initialized');
    return {
      execAsync: async () => { },
      runAsync: async () => { },
      getAllAsync: async () => [],
    };
  }
  try {
    const db = await SQLite.openDatabaseAsync(USER_DB_NAME);

    // Create tables if not exist
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      
      CREATE TABLE IF NOT EXISTS favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL, -- 'driver', 'team', 'race'
        itemId TEXT NOT NULL,
        data TEXT, -- JSON string for display details
        addedAt TEXT,
        UNIQUE(type, itemId)
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      );

      CREATE TABLE IF NOT EXISTS race_journal (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        raceId TEXT NOT NULL,
        raceName TEXT NOT NULL,
        note TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        rating INTEGER DEFAULT 0,
        category TEXT DEFAULT 'Note',
        UNIQUE(raceId)
      );
    `);

    console.log('SQLite Database Initialized');
    return db;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
};

export interface FavoriteItem {
  id: number;
  type: 'driver' | 'team' | 'race';
  itemId: string; // id
  data: any;
  addedAt: string;
}

export const toggleFavorite = async (type: 'driver' | 'team' | 'race', itemId: string, data: any = {}) => {
  if (Platform.OS === 'web') {
    // ... (Web logic unchanged)
    const favorites = getWebFavorites();
    const index = favorites.findIndex(f => f.type === type && f.itemId === itemId);

    if (index !== -1) {
      favorites.splice(index, 1);
      saveWebFavorites(favorites);
      return false;
    } else {
      const newItem: FavoriteItem = {
        id: Date.now(),
        type,
        itemId,
        data,
        addedAt: new Date().toISOString()
      };
      favorites.push(newItem);
      saveWebFavorites(favorites);
      return true;
    }
  }

  try {
    const dbSqlite = await SQLite.openDatabaseAsync(USER_DB_NAME);
    const addedAt = new Date().toISOString();

    // 1. Check Local SQLite
    const existing = await dbSqlite.getAllAsync('SELECT * FROM favorites WHERE type = ? AND itemId = ?', [type, itemId]);
    let isFavorite = false;

    if (existing.length > 0) {
      // Remove Local
      await dbSqlite.runAsync('DELETE FROM favorites WHERE type = ? AND itemId = ?', [type, itemId]);
      isFavorite = false;
    } else {
      // Add Local
      await dbSqlite.runAsync(
        'INSERT INTO favorites (type, itemId, data, addedAt) VALUES (?, ?, ?, ?)',
        [type, itemId, JSON.stringify(data), addedAt]
      );
      isFavorite = true;
    }

    // 2. Sync to Firebase if Online
    const netState = await NetInfo.fetch();
    if (netState.isConnected && netState.isInternetReachable && auth.currentUser) {
      const uid = auth.currentUser.uid;
      const docRef = doc(db, 'users', uid, 'favorites', `${type}_${itemId}`);

      if (isFavorite) {
        await setDoc(docRef, {
          type,
          itemId,
          data: JSON.stringify(data),
          addedAt
        });
        console.log('Synced favorite to Firebase');
      } else {
        await deleteDoc(docRef);
        console.log('Removed favorite from Firebase');
      }
    }

    return isFavorite;

  } catch (error) {
    console.error('Error toggling favorite:', error);
    throw error;
  }
};

export const checkFavorite = async (type: string, itemId: string): Promise<boolean> => {
  if (Platform.OS === 'web') {
    const favorites = getWebFavorites();
    return favorites.some(f => f.type === type && f.itemId === itemId);
  }
  try {
    const db = await SQLite.openDatabaseAsync(USER_DB_NAME);
    const result = await db.getAllAsync('SELECT id FROM favorites WHERE type = ? AND itemId = ?', [type, itemId]);
    return result.length > 0;
  } catch (error) {
    console.error('Error checking favorite:', error);
    return false;
  }
};

export const getFavorites = async (type?: string): Promise<FavoriteItem[]> => {
  if (Platform.OS === 'web') {
    // ... (Web logic unchanged)
    let favorites = getWebFavorites();
    if (type) {
      favorites = favorites.filter(f => f.type === type);
    }
    return favorites.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
  }

  try {
    const dbSqlite = await SQLite.openDatabaseAsync(USER_DB_NAME);
    const netState = await NetInfo.fetch();

    // 1. Try Firebase if Online
    if (netState.isConnected && netState.isInternetReachable && auth.currentUser) {
      const uid = auth.currentUser.uid;
      try {
        let q = query(collection(db, 'users', uid, 'favorites'));
        if (type) {
          q = query(collection(db, 'users', uid, 'favorites'), where('type', '==', type));
        }
        const querySnapshot = await getDocs(q);
        const cloudFavorites: FavoriteItem[] = [];

        // Clear local cache for this type (or all) to ensure sync? 
        // For simplicity, we just upsert/overwrite local with cloud data.
        // But to remove deleted items, we might need a full sync strategy.
        // "Offline pake sqlite, Online pake firebase" -> Implies simply returning Firebase data when online.

        for (const docSnap of querySnapshot.docs) {
          const d = docSnap.data();
          const stringifiedData = typeof d.data === 'string' ? d.data : JSON.stringify(d.data || {});

          cloudFavorites.push({
            id: 0, // Placeholder
            type: d.type,
            itemId: d.itemId,
            data: d.data ? (typeof d.data === 'string' ? JSON.parse(d.data) : d.data) : {},
            addedAt: d.addedAt
          });

          // Sync to Local (Upsert)
          await dbSqlite.runAsync(
            `INSERT OR REPLACE INTO favorites (type, itemId, data, addedAt) VALUES (?, ?, ?, ?)`,
            [d.type, d.itemId, stringifiedData, d.addedAt]
          );
        }

        console.log('Fetched favorites from Firebase:', cloudFavorites.length);
        return cloudFavorites.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());

      } catch (e) {
        console.error('Firebase getFavorites failed, falling back to SQLite', e);
      }
    }

    // 2. Fallback to SQLite (Offline or Firebase failed)
    let querySql = 'SELECT * FROM favorites';
    let params: string[] = [];

    if (type) {
      querySql += ' WHERE type = ?';
      params.push(type);
    }

    querySql += ' ORDER BY addedAt DESC';

    const rows = await dbSqlite.getAllAsync(querySql, params);
    return rows.map((row: any) => ({
      ...row,
      data: row.data ? JSON.parse(row.data) : {}
    }));
  } catch (error) {
    console.error('Error getting favorites:', error);
    return [];
  }
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

const getWebProfile = (): UserProfile => {
  try {
    const json = localStorage.getItem('f1hub_user_profile');
    return json ? JSON.parse(json) : DEFAULT_PROFILE;
  } catch (e) {
    console.error('Error reading localStorage for profile', e);
    return DEFAULT_PROFILE;
  }
};

const saveWebProfile = (profile: UserProfile) => {
  try {
    localStorage.setItem('f1hub_user_profile', JSON.stringify(profile));
  } catch (e) {
    console.error('Error writing localStorage for profile', e);
  }
};

export const getUserProfile = async (): Promise<UserProfile> => {
  if (Platform.OS === 'web') {
    return getWebProfile();
  }

  try {
    const dbSqlite = await SQLite.openDatabaseAsync(USER_DB_NAME);
    const uid = auth.currentUser?.uid;

    if (!uid) return DEFAULT_PROFILE; // Should not happen if guarded by Auth

    // 1. Try Firebase if Online
    const netState = await NetInfo.fetch();
    if (netState.isConnected && netState.isInternetReachable && auth.currentUser) {
      try {
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as UserProfile;
          console.log('Fetched profile from Firebase');

          // Sync to Local (User Specific)
          await dbSqlite.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [`user_${uid}_name`, data.name]);
          await dbSqlite.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [`user_${uid}_bio`, data.bio]);
          await dbSqlite.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [`user_${uid}_photo`, data.photo]);

          return data;
        } else {
          // Doc doesn't exist on Firebase (New User) -> Return Default
          return DEFAULT_PROFILE;
        }
      } catch (e) {
        console.error('Firebase getUserProfile failed, falling back to SQLite', e);
      }
    }

    // 2. Fallback to SQLite (User Specific)
    const rows = await dbSqlite.getAllAsync(
      'SELECT key, value FROM settings WHERE key IN (?, ?, ?)',
      [`user_${uid}_name`, `user_${uid}_bio`, `user_${uid}_photo`]
    );

    const profile = { ...DEFAULT_PROFILE };
    rows.forEach((row: any) => {
      if (row.key === `user_${uid}_name`) profile.name = row.value;
      if (row.key === `user_${uid}_bio`) profile.bio = row.value;
      if (row.key === `user_${uid}_photo`) profile.photo = row.value;
    });

    return profile;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return DEFAULT_PROFILE;
  }
};

export const saveUserProfile = async (profile: UserProfile) => {
  if (Platform.OS === 'web') {
    saveWebProfile(profile);
    return;
  }

  try {
    const dbSqlite = await SQLite.openDatabaseAsync(USER_DB_NAME);
    const uid = auth.currentUser?.uid;

    if (!uid) {
      console.warn("Cannot save profile: No authenticated user");
      return;
    }

    // 1. Always Save to Local SQLite (User Specific)
    await dbSqlite.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [`user_${uid}_name`, profile.name]);
    await dbSqlite.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [`user_${uid}_bio`, profile.bio]);
    await dbSqlite.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [`user_${uid}_photo`, profile.photo]);

    // 2. Sync to Firebase if Online
    const netState = await NetInfo.fetch();
    if (netState.isConnected && netState.isInternetReachable && auth.currentUser) {
      const docRef = doc(db, 'users', uid);
      await setDoc(docRef, profile, { merge: true });
      console.log('Saved profile to Firebase');
    }

  } catch (error) {
    console.error('Error saving user profile:', error);
    throw error;
  }
};

// --- STORAGE HELPERS ---
import * as FileSystem from 'expo-file-system';
import { getDownloadURL, ref, uploadString } from 'firebase/storage';
import { storage } from './firebaseConfig';

export const uploadProfileImage = async (userId: string, uri: string): Promise<string> => {
  try {
    // Use FileSystem to read as Base64 (Most reliable on Expo/RN)
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: 'base64',
    });

    const storageRef = ref(storage, `profile_photos/${userId}`);

    // Upload Base64 string
    await uploadString(storageRef, base64, 'base64', {
      contentType: 'image/jpeg',
    });

    return await getDownloadURL(storageRef);
  } catch (e) {
    console.error("Error uploading profile image:", e);
    throw e;
  }
};

// Generic Settings Helpers
export const getSetting = async (key: string, defaultValue: string = ''): Promise<string> => {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key) || defaultValue;
  }
  try {
    const db = await SQLite.openDatabaseAsync(USER_DB_NAME);
    const result = await db.getFirstAsync('SELECT value FROM settings WHERE key = ?', [key]) as { value: string } | null;
    return result ? result.value : defaultValue;
  } catch (error) {
    console.error(`Error getting setting ${key}:`, error);
    return defaultValue;
  }
};

export const saveSetting = async (key: string, value: string) => {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
    return;
  }
  try {
    const db = await SQLite.openDatabaseAsync(USER_DB_NAME);
    await db.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, value]);
  } catch (error) {
    console.error(`Error saving setting ${key}:`, error);
  }
};

// --- F1 RACE JOURNAL CRUD ---

export interface JournalEntry {
  id?: number;
  raceId: string;
  raceName: string;
  note: string;
  rating?: number; // 1-5
  category?: 'Prediction' | 'Note' | 'Memory' | 'Technical';
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

  if (Platform.OS === 'web') {
    const key = `f1hub_journal_${raceId}`;
    localStorage.setItem(key, JSON.stringify({ raceId, raceName, note, rating, category, updatedAt }));

    if (auth.currentUser) {
      try {
        const docRef = doc(db, 'users', auth.currentUser.uid, 'journal', raceId);
        await setDoc(docRef, { raceId, raceName, note, rating, category, updatedAt });
      } catch (e) {
        console.error('Error syncing journal to Firebase', e);
      }
    }
    return;
  }

  try {
    const dbSqlite = await SQLite.openDatabaseAsync(USER_DB_NAME);
    // Check if table needs update (simplified for now: just replace)
    await dbSqlite.runAsync(
      `INSERT OR REPLACE INTO race_journal (raceId, raceName, note, updatedAt, rating, category) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [raceId, raceName, note, updatedAt, rating || 0, category || 'Note']
    );

    const netState = await NetInfo.fetch();
    if (netState.isConnected && netState.isInternetReachable && auth.currentUser) {
      const docRef = doc(db, 'users', auth.currentUser.uid, 'journal', raceId);
      await setDoc(docRef, { raceId, raceName, note, rating, category, updatedAt });
    }
  } catch (error) {
    console.error('Error saving journal note:', error);
    throw error;
  }
};

export const getJournalNotes = async (): Promise<JournalEntry[]> => {
  if (Platform.OS === 'web') {
    // For web, if online, get from Firebase, otherwise localstorage
    if (auth.currentUser) {
      try {
        const q = query(collection(db, 'users', auth.currentUser.uid, 'journal'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => doc.data() as JournalEntry);
      } catch (e) {
        console.error('Error getting journal from Firebase', e);
      }
    }
    // Fallback to searching localStorage keys (not ideal for web, but works for mock)
    const entries: JournalEntry[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('f1hub_journal_')) {
        entries.push(JSON.parse(localStorage.getItem(key)!));
      }
    }
    return entries;
  }

  try {
    const dbSqlite = await SQLite.openDatabaseAsync(USER_DB_NAME);
    const rows = await dbSqlite.getAllAsync('SELECT * FROM race_journal ORDER BY updatedAt DESC');
    return rows as JournalEntry[];
  } catch (error) {
    console.error('Error getting journal notes:', error);
    return [];
  }
};

export const deleteJournalNote = async (raceId: string) => {
  if (Platform.OS === 'web') {
    localStorage.removeItem(`f1hub_journal_${raceId}`);
    if (auth.currentUser) {
      try {
        const docRef = doc(db, 'users', auth.currentUser.uid, 'journal', raceId);
        await deleteDoc(docRef);
      } catch (e) {
        console.error('Error deleting journal from Firebase', e);
      }
    }
    return;
  }

  try {
    const dbSqlite = await SQLite.openDatabaseAsync(USER_DB_NAME);
    await dbSqlite.runAsync('DELETE FROM race_journal WHERE raceId = ?', [raceId]);

    const netState = await NetInfo.fetch();
    if (netState.isConnected && netState.isInternetReachable && auth.currentUser) {
      const docRef = doc(db, 'users', auth.currentUser.uid, 'journal', raceId);
      await deleteDoc(docRef);
    }
  } catch (error) {
    console.error('Error deleting journal note:', error);
    throw error;
  }
};

export const getJournalNoteForRace = async (raceId: string): Promise<JournalEntry | null> => {
  if (Platform.OS === 'web') {
    const json = localStorage.getItem(`f1hub_journal_${raceId}`);
    return json ? JSON.parse(json) : null;
  }
  try {
    const dbSqlite = await SQLite.openDatabaseAsync(USER_DB_NAME);
    const result = await dbSqlite.getFirstAsync('SELECT * FROM race_journal WHERE raceId = ?', [raceId]);
    return result as JournalEntry | null;
  } catch (error) {
    console.error('Error getting race journal note:', error);
    return null;
  }
};
