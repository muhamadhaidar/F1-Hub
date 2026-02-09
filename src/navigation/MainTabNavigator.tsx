import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useSettings } from '@/context/SettingsContext';

import CalendarScreen from '@/screens/CalendarScreen';
import HomeScreen from '@/screens/HomeScreen';
import ProfileScreen from '@/screens/ProfileScreen';
import WatchScreen from '@/screens/WatchScreen';

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
    const { resolvedTheme, t } = useSettings();
    const themeColors = Colors[resolvedTheme];

    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: Colors.dark.primary,
                tabBarInactiveTintColor: Colors.dark.icon,
                headerShown: false,
                tabBarShowLabel: false, // Hide labels as requested
                tabBarButton: HapticTab,
                tabBarStyle: {
                    backgroundColor: Colors.dark.background,
                    borderTopColor: themeColors.border,
                    borderTopWidth: 1, // Ensure border is visible
                },
            }}>
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }: { color: string }) => <IconSymbol size={28} name="house.fill" color={color} />,
                }}
            />
            <Tab.Screen
                name="Calendar"
                component={CalendarScreen}
                options={{
                    title: 'Calendar',
                    tabBarLabel: t('calendar'), // Key needs to be added
                    tabBarIcon: ({ color }: { color: string }) => <IconSymbol size={28} name="calendar" color={color} />,
                }}
            />
            <Tab.Screen
                name="Watch"
                component={WatchScreen}
                options={{
                    title: 'Watch',
                    tabBarLabel: t('watch'), // Key needs to be added
                    tabBarIcon: ({ color }: { color: string }) => <IconSymbol size={28} name="play.rectangle.fill" color={color} />,
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    title: 'Profile',
                    tabBarLabel: t('profileTab'), // Disambiguate from page title if needed
                    tabBarIcon: ({ color }: { color: string }) => <IconSymbol size={28} name="person.fill" color={color} />,
                }}
            />
        </Tab.Navigator>
    );
}
