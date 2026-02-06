import { DEFAULT_PROFILE, saveUserProfile } from '@/services/database';
import { auth } from '@/services/firebaseConfig';
import { User, createUserWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    signIn: (email: string, pass: string) => Promise<void>;
    signUp: (email: string, pass: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: true,
    signIn: async () => { },
    signUp: async () => { },
    signOut: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    // Listen for auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            console.log('[AuthContext] Auth State Changed:', currentUser ? 'User Logged In' : 'User Logged Out', currentUser?.uid);
            setUser(currentUser);
            setIsLoading(false);
        });
        return unsubscribe;
    }, []);

    // Helper to timeout promises
    const withTimeout = (promise: Promise<any>, ms: number = 15000) => {
        return Promise.race([
            promise,
            new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out. Check your network or Firebase config.')), ms))
        ]);
    };

    const signIn = async (email: string, pass: string) => {
        try {
            console.log('[AuthContext] Attempting Sign In for:', email);
            await withTimeout(signInWithEmailAndPassword(auth, email, pass));
            console.log('[AuthContext] Sign In Successful');
        } catch (error: any) {
            console.error('[AuthContext] Sign In Error:', error.code, error.message);
            throw error;
        }
    };



    const signUp = async (email: string, pass: string) => {
        try {
            console.log('[AuthContext] Attempting Sign Up for:', email);
            const result = await withTimeout(createUserWithEmailAndPassword(auth, email, pass));
            console.log('[AuthContext] User created:', result.user.uid);

            // Create default profile in Firestore/SQLite
            await saveUserProfile({
                ...DEFAULT_PROFILE,
                name: email.split('@')[0] // Use email prefix as default name
            });
            console.log('[AuthContext] Default profile created');
        } catch (error: any) {
            console.error('[AuthContext] Sign Up Error:', error.code, error.message);
            throw error;
        }
    };


    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
        } catch (error) {
            console.error('Sign Out Error:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};
