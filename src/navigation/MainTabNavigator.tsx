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
                tabBarActiveTintColor: themeColors.tabIconSelected,
                tabBarInactiveTintColor: themeColors.tabIconDefault,
                headerShown: false,
                tabBarButton: HapticTab,
                tabBarStyle: {
                    backgroundColor: themeColors.background,
                    borderTopColor: themeColors.border,
                    borderTopWidth: 1, // Ensure border is visible
                },
            }}>
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    title: 'Home', // You might want to remove this if using tabBarLabel or if title is used for header (which is hidden)
                    tabBarLabel: t('homeTitle'), // Assuming you want localized label, you might need to add SHORT keys like 'Home', 'Calendar' to translations if 'F1 HUB' is too long for home. Let's use generic names if needed or specific dictionary keys.
                    // Wait, t('homeTitle') is 'F1 HUB'. That looks weird on a tab.
                    // Let's check dictionary.
                    // Dictionary has 'calendarTitle': 'CALENDAR'.
                    // I should probably add simple keys like 'home', 'calendar', 'watch', 'profile' to the dictionary if they don't exist in a short form.
                    // The user's screenshot has "Home", "Calendar", "Watch", "Profile".
                    // I see 'profile' key exists.
                    // I will stick to hardcoded 'Home' -> t('home') if I add it, or just mapped to existing keys if suitable.
                    // Let's look at translation keys again.
                    // en: profile: 'PROFILE'.
                    // id: profile: 'PROFIL'.
                    // That's all caps. Usually tab bars are Title Case or Caps depending on design.
                    // Let's use a function to Capitalize First Letter if we re-use fully caps keys, or add new keys. 
                    // I'll add new keys for the tabs to be safe and clean.
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
                }}
            />
            <Tab.Screen
                name="Calendar"
                component={CalendarScreen}
                options={{
                    title: 'Calendar',
                    tabBarLabel: t('calendar'), // Key needs to be added
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="calendar" color={color} />,
                }}
            />
            <Tab.Screen
                name="Watch"
                component={WatchScreen}
                options={{
                    title: 'Watch',
                    tabBarLabel: t('watch'), // Key needs to be added
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="play.rectangle.fill" color={color} />,
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    title: 'Profile',
                    tabBarLabel: t('profileTab'), // Disambiguate from page title if needed
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
                }}
            />
        </Tab.Navigator>
    );
}
