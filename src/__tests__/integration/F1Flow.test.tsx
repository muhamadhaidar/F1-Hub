// MOCKS FIRST - MUST BE BEFORE ANY OTHER IMPORTS
jest.mock('react-native-reanimated', () => {
    const Reanimated = require('react-native-reanimated/mock');
    Reanimated.default.call = () => { };
    return Reanimated;
});

jest.mock('@react-native-community/netinfo', () => ({
    fetch: jest.fn(() => Promise.resolve({ isConnected: true, isInternetReachable: true })),
    addEventListener: jest.fn(),
}));

jest.mock('expo-sqlite', () => ({
    openDatabaseAsync: jest.fn(() => Promise.resolve({
        execAsync: jest.fn(),
        runAsync: jest.fn(),
        getAllAsync: jest.fn(() => Promise.resolve([])),
        getFirstAsync: jest.fn(),
    })),
}));

jest.mock('../../services/database', () => ({
    initDatabase: jest.fn(() => Promise.resolve({})),
    getSetting: jest.fn((key, def) => Promise.resolve(def)),
    saveSetting: jest.fn(),
    getFavorites: jest.fn(() => Promise.resolve([])),
    checkFavorite: jest.fn(() => Promise.resolve(false)),
    toggleFavorite: jest.fn(() => Promise.resolve(true)),
    getUserProfile: jest.fn(() => Promise.resolve({ name: 'Test User', bio: 'Bio', photo: '' })),
    saveUserProfile: jest.fn(),
}));

jest.mock('../../services/firebaseConfig', () => ({
    auth: { currentUser: { uid: 'test-user' } },
    db: {},
    storage: {},
}));

jest.mock('firebase/auth', () => ({
    getAuth: jest.fn(),
    onAuthStateChanged: jest.fn((auth, cb) => {
        cb({ uid: 'test-user' });
        return () => { };
    }),
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
    getFirestore: jest.fn(),
    doc: jest.fn(),
    setDoc: jest.fn(),
    getDoc: jest.fn(() => Promise.resolve({ exists: () => false })),
    getDocs: jest.fn(() => Promise.resolve({ docs: [] })),
    query: jest.fn(),
    collection: jest.fn(),
    where: jest.fn(),
    deleteDoc: jest.fn(),
}));

jest.mock('../../services/api', () => ({
    f1Api: {
        getNextRace: jest.fn(() => Promise.resolve({
            id: '1',
            name: 'Test Grand Prix',
            date: '2026-03-05',
            time: '12:00:00',
            circuit: { country: 'Australia', name: 'Albert Park' }
        })),
        getSeasonSchedule: jest.fn(() => Promise.resolve([])),
        getLastRaceResults: jest.fn(() => Promise.resolve({
            raceName: 'Previous Race',
            date: '2025-11-20',
            results: []
        })),
        getDriverStandings: jest.fn(() => Promise.resolve([
            { position: '1', driver: 'Max Verstappen', team: 'Red Bull', points: '450', driverId: 'max_v' }
        ])),
        getConstructorStandings: jest.fn(() => Promise.resolve([
            { position: '1', team: 'McLaren', points: '500', teamId: 'mclaren', wins: '5' }
        ])),
    },
    getRaceImage: jest.fn(() => 'https://example.com/image.png')
}));

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { SettingsProvider } from '../../context/SettingsContext';
import HomeScreen from '../../screens/HomeScreen';
import StandingsScreen from '../../screens/StandingsScreen';

const Stack = createNativeStackNavigator();

const MockApp = () => (
    <SettingsProvider>
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="Standings" component={StandingsScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    </SettingsProvider>
);

describe('F1 Hub - Integration Flow', () => {
    it('navigates from Home to Driver Standings and displays data', async () => {
        render(<MockApp />);

        // Check if Home header is visible
        expect(await screen.findByText(/F1 HUB/i)).toBeTruthy();

        // 1. Find and click the driver standings chevron
        const navigateBtn = await screen.findByTestId('go-to-standings-driver');
        fireEvent.press(navigateBtn);

        // 2. Verify we are on the Standings screen
        expect(await screen.findByText(/Driver Standings/i)).toBeTruthy();

        // 3. Verify the mocked data is displayed
        expect(await screen.findByText(/Max Verstappen/i)).toBeTruthy();
        expect(await screen.findByText(/#1/i)).toBeTruthy();
    });

    it('navigates from Home to Constructor Standings', async () => {
        render(<MockApp />);

        const navigateBtn = await screen.findByTestId('go-to-standings-team');
        fireEvent.press(navigateBtn);

        expect(await screen.findByText(/Constructor Standings/i)).toBeTruthy();
    });
});
