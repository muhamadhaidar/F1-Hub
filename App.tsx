import { DarkTheme, DefaultTheme, NavigationContainer, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/context/AuthContext';
import { SettingsProvider, useSettings } from '@/context/SettingsContext';
import AppNavigator from '@/navigation/AppNavigator';
import { initDatabase } from '@/services/database';

// Separate component to consume the theme context
const AppContent = () => {
    const { resolvedTheme } = useSettings();

    return (
        <NavigationThemeProvider value={resolvedTheme === 'dark' ? DarkTheme : DefaultTheme}>
            <NavigationContainer theme={resolvedTheme === 'dark' ? DarkTheme : DefaultTheme}>
                <AppNavigator />
                <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
            </NavigationContainer>
        </NavigationThemeProvider>
    );
};

export default function App() {
    useEffect(() => {
        initDatabase().catch((err) => console.error('Database init failed:', err));
    }, []);

    return (
        <AuthProvider>
            <SettingsProvider>
                <SafeAreaProvider>
                    <AppContent />
                </SafeAreaProvider>
            </SettingsProvider>
        </AuthProvider>
    );
}
