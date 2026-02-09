import NetInfo from '@react-native-community/netinfo';
import * as SQLite from 'expo-sqlite';

jest.mock('expo-sqlite', () => ({
    openDatabaseAsync: jest.fn(),
}));

jest.mock('@react-native-community/netinfo', () => ({
    fetch: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
    doc: jest.fn(),
    getDoc: jest.fn(),
    setDoc: jest.fn(),
    getDocs: jest.fn(),
    query: jest.fn(),
    collection: jest.fn(),
    where: jest.fn(),
    deleteDoc: jest.fn(),
}));

jest.mock('firebase/storage', () => ({
    ref: jest.fn(),
    uploadString: jest.fn(),
    getDownloadURL: jest.fn(),
}));

jest.mock('expo-file-system', () => ({
    readAsStringAsync: jest.fn(),
}));

jest.mock('../firebaseConfig', () => ({
    auth: { currentUser: { uid: 'test-uid' } },
    db: {},
    storage: {},
}));

const { DEFAULT_PROFILE, getUserProfile, saveUserProfile, toggleFavorite } = require('../database');
const { getDoc, setDoc } = require('firebase/firestore');

describe('Database Service', () => {
    let mockDb: any;

    beforeEach(() => {
        jest.clearAllMocks();
        mockDb = {
            execAsync: jest.fn(),
            runAsync: jest.fn(),
            getAllAsync: jest.fn(),
            getFirstAsync: jest.fn(),
        };
        (SQLite.openDatabaseAsync as jest.Mock).mockResolvedValue(mockDb);
        (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true, isInternetReachable: true });
    });

    describe('toggleFavorite', () => {
        it('adds a favorite to SQLite and syncs to Firebase when online', async () => {
            mockDb.getAllAsync.mockResolvedValue([]); // Not existing

            const result = await toggleFavorite('driver', 'verstappen', { name: 'Max' });

            expect(result).toBe(true);
            expect(mockDb.runAsync).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO favorites'),
                expect.any(Array)
            );
            expect(setDoc).toHaveBeenCalled();
        });

        it('removes a favorite from SQLite when it already exists', async () => {
            mockDb.getAllAsync.mockResolvedValue([{ id: 1 }]); // Existing

            const result = await toggleFavorite('driver', 'verstappen');

            expect(result).toBe(false);
            expect(mockDb.runAsync).toHaveBeenCalledWith(
                expect.stringContaining('DELETE FROM favorites'),
                ['driver', 'verstappen']
            );
        });
    });

    describe('getUserProfile', () => {
        it('returns profile from Firebase and syncs to SQLite when online', async () => {
            const mockFirebaseProfile = { name: 'Firebase User', bio: 'Bio', photo: 'url' };
            (getDoc as jest.Mock).mockResolvedValue({
                exists: () => true,
                data: () => mockFirebaseProfile
            });

            const result = await getUserProfile();

            expect(result.name).toBe('Firebase User');
            expect(mockDb.runAsync).toHaveBeenCalledTimes(3); // Setting name, bio, photo
        });

        it('falls back to SQLite when offline', async () => {
            (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: false });
            mockDb.getAllAsync.mockResolvedValue([
                { key: 'user_test-uid_name', value: 'Local User' },
                { key: 'user_test-uid_bio', value: 'Local Bio' }
            ]);

            const result = await getUserProfile();

            expect(result.name).toBe('Local User');
            expect(result.bio).toBe('Local Bio');
        });

        it('returns DEFAULT_PROFILE if no data is found', async () => {
            (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: false });
            mockDb.getAllAsync.mockResolvedValue([]);

            const result = await getUserProfile();
            expect(result).toEqual(DEFAULT_PROFILE);
        });
    });

    describe('saveUserProfile', () => {
        it('saves to SQLite and Firebase', async () => {
            const newProfile = { name: 'New Name', bio: 'New Bio', photo: 'new-url' };
            await saveUserProfile(newProfile);

            expect(mockDb.runAsync).toHaveBeenCalledTimes(3);
            expect(setDoc).toHaveBeenCalled();
        });
    });
});
