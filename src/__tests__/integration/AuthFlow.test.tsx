import { NavigationContainer } from '@react-navigation/native';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import React from 'react';
import { AuthProvider } from '../../context/AuthContext';
import { SettingsProvider } from '../../context/SettingsContext';
import LoginScreen from '../../screens/LoginScreen';

// MOCKS
jest.mock('firebase/auth', () => ({
    getAuth: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: { uid: 'new-user-123' } })),
    onAuthStateChanged: jest.fn(() => () => { }),
}));

jest.mock('../../services/firebaseConfig', () => ({
    auth: {},
    db: {},
}));

jest.mock('../../services/database', () => ({
    saveUserProfile: jest.fn(),
    getSetting: jest.fn(() => Promise.resolve('')),
    saveSetting: jest.fn(() => Promise.resolve()),
    DEFAULT_PROFILE: { name: '', bio: '', photo: '' },
}));

// Mock Navigation
const mockedNavigate = jest.fn();
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native');
    return {
        ...actualNav,
        useNavigation: () => ({
            navigate: mockedNavigate,
        }),
    };
});

describe('Auth Integration Flow', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('successfully registers a new user', async () => {
        render(
            <SettingsProvider>
                <AuthProvider>
                    <NavigationContainer>
                        <LoginScreen />
                    </NavigationContainer>
                </AuthProvider>
            </SettingsProvider>
        );

        // 1. Switch to Register mode
        const switchBtn = screen.getByText(/Don't have an account\? Create one/i);
        fireEvent.press(switchBtn);

        // 2. Fill in details
        const emailInput = screen.getByTestId('email-input');
        const passwordInput = screen.getByTestId('password-input');
        const registerBtn = screen.getByTestId('auth-button');

        fireEvent.changeText(emailInput, 'test@example.com');
        fireEvent.changeText(passwordInput, 'password123');
        fireEvent.press(registerBtn);

        // 3. Verify Firebase call
        await waitFor(() => {
            expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
                expect.any(Object),
                'test@example.com',
                'password123'
            );
        });
    });

    it('successfully logs in an existing user', async () => {
        (signInWithEmailAndPassword as jest.Mock).mockResolvedValueOnce({ user: { uid: 'existing-uid' } });

        render(
            <SettingsProvider>
                <AuthProvider>
                    <NavigationContainer>
                        <LoginScreen />
                    </NavigationContainer>
                </AuthProvider>
            </SettingsProvider>
        );

        const emailInput = screen.getByTestId('email-input');
        const passwordInput = screen.getByTestId('password-input');
        const loginBtn = screen.getByTestId('auth-button');

        fireEvent.changeText(emailInput, 'user@test.com');
        fireEvent.changeText(passwordInput, 'secret');
        fireEvent.press(loginBtn);

        await waitFor(() => {
            expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
                expect.any(Object),
                'user@test.com',
                'secret'
            );
        });
    });
});
