import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import LoginScreen from '@/screens/LoginScreen';
import ModalScreen from '@/screens/ModalScreen';
import RaceJournalScreen from '@/screens/RaceJournalScreen';
import SettingsScreen from '@/screens/SettingsScreen';
import StandingsScreen from '@/screens/StandingsScreen';
import MainTabNavigator from './MainTabNavigator';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
                <ActivityIndicator size="large" color={Colors.dark.primary} />
            </View>
        );
    }

    return (
        <Stack.Navigator>
            {user ? (
                <>
                    <Stack.Screen name="MainTabs" component={MainTabNavigator} options={{ headerShown: false }} />
                    <Stack.Screen name="Modal" component={ModalScreen} options={{ presentation: 'modal', title: 'Modal' }} />
                    <Stack.Screen name="Standings" component={StandingsScreen} options={{ presentation: 'modal', headerShown: false }} />
                    <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="RaceJournal" component={RaceJournalScreen} options={{ headerShown: false }} />
                </>
            ) : (
                <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            )}
        </Stack.Navigator>
    );
}
