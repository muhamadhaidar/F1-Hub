import { getSetting, saveSetting } from '@/services/database';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

type ThemeMode = 'light' | 'dark' | 'system';
type Language = 'en' | 'id';

interface SettingsContextType {
    theme: ThemeMode;
    resolvedTheme: 'light' | 'dark';
    language: Language;
    setTheme: (theme: ThemeMode) => Promise<void>;
    setLanguage: (lang: Language) => Promise<void>;
    t: (key: string) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
    en: {
        // Settings
        settings: 'SETTINGS',
        general: 'GENERAL',
        language: 'Language',
        darkMode: 'Dark Mode',
        about: 'ABOUT',
        version: 'Version',
        terms: 'Terms of Service',
        profile: 'PROFILE',
        editProfile: 'EDIT PROFILE',
        notification: 'NOTIFICATION',
        save: 'Save',
        cancel: 'Cancel',
        notificationsEnabled: 'Notifications enabled!',
        featureComingSoon: 'Feature coming soon!',

        // Home
        homeTitle: 'F1 HUB',
        homeSubtitle: 'Track every moment of the season',
        upcomingRaces: 'Upcoming Races',
        recentGP: 'Recent Grand Prix',
        driverStandings: 'Driver Standings',
        constructorStandings: 'Constructor Standings',
        wins: 'Wins',
        points: 'pts',
        next: 'NEXT',

        // Calendar
        calendarTitle: 'CALENDAR',
        raceResults: 'Race Results',
        noResults: 'No results available yet.',
        raceNotHeld: 'Race has not taken place.',
        noRacesFound: 'No races found.',

        // Standings
        driverStandingsTitle: 'Driver Standings',
        constructorStandingsTitle: 'Constructor Standings',
        close: 'Close',

        // Watch
        watchTitle: 'WATCH',
        watchSubtitle: 'Highlights, onboards & analysis',
        recentVideos: 'Recent Videos',
        filterAll: 'All',
        filterHighlights: 'Race Highlights',
        filterTopMoments: 'Top 5 Moments',
        raceHighlightsBadge: 'RACE HIGHLIGHTS',

        // Groups
        driver: 'DRIVER',
        team: 'TEAM',
        race: 'RACE',
        favorite: 'FAVORITE',
        logout: 'Log Out',

        // Login
        signIn: 'SIGN IN',
        signUp: 'CREATE ACCOUNT',
        startingEngine: 'STARTING ENGINE...',
        creatingAccount: 'CREATING...',
        email: 'Email',
        password: 'Password',
        welcomeBack: 'Welcome Back',
        createAccount: 'Create Account',
        signInSubtitle: 'Sign in to access your digital paddock',
        signUpSubtitle: 'Join the grid and start your journey',
        logoSubtitle: 'OFFICIAL APP',
        alreadyHaveAccount: 'Already have an account? Sign In',
        dontHaveAccount: "Don't have an account? Create one",
        authFailed: 'Authentication Failed',

        // Tabs
        home: 'Home',
        calendar: 'Calendar',
        watch: 'Watch',
        profileTab: 'Profile',
    },
    id: {
        // Settings
        settings: 'PENGATURAN',
        general: 'UMUM',
        language: 'Bahasa',
        darkMode: 'Mode Gelap',
        about: 'TENTANG',
        version: 'Versi',
        terms: 'Syarat Layanan',
        profile: 'PROFIL',
        editProfile: 'EDIT PROFIL',
        notification: 'NOTIFIKASI',
        save: 'Simpan',
        cancel: 'Batal',
        notificationsEnabled: 'Notifikasi diaktifkan!',
        featureComingSoon: 'Fitur akan segera hadir!',

        // Home
        homeTitle: 'F1 HUB',
        homeSubtitle: 'Pantau setiap momen musim ini',
        upcomingRaces: 'Balapan Mendatang',
        recentGP: 'Grand Prix Terakhir',
        driverStandings: 'Klasemen Pembalap',
        constructorStandings: 'Klasemen Konstruktor',
        wins: 'Menang',
        points: 'poin',
        next: 'BERIKUTNYA',

        // Calendar
        calendarTitle: 'KALENDER',
        raceResults: 'Hasil Balapan',
        noResults: 'Hasil belum tersedia.',
        raceNotHeld: 'Balapan belum berlangsung.',
        noRacesFound: 'Balapan tidak ditemukan.',

        // Standings
        driverStandingsTitle: 'Klasemen Pembalap',
        constructorStandingsTitle: 'Klasemen Konstruktor',
        close: 'Tutup',

        // Watch
        watchTitle: 'TONTON',
        watchSubtitle: 'Sorotan, onboard & analisis',
        recentVideos: 'Video Terbaru',
        filterAll: 'Semua',
        filterHighlights: 'Sorotan Balapan',
        filterTopMoments: '5 Momen Terbaik',
        raceHighlightsBadge: 'SOROTAN BALAPAN',

        // Groups
        driver: 'PEMBALAP',
        team: 'TIM',
        race: 'BALAPAN',
        favorite: 'FAVORIT',
        logout: 'Keluar',

        // Login
        signIn: 'MASUK',
        signUp: 'BUAT AKUN',
        startingEngine: 'MENYALAKAN MESIN...',
        creatingAccount: 'MEMBUAT AKUN...',
        email: 'Email',
        password: 'Kata Sandi',
        welcomeBack: 'Selamat Datang Kembali',
        createAccount: 'Buat Akun',
        signInSubtitle: 'Masuk untuk mengakses paddock digital Anda',
        signUpSubtitle: 'Bergabunglah di grid dan mulai perjalanan Anda',
        logoSubtitle: 'APLIKASI RESMI',
        alreadyHaveAccount: 'Sudah punya akun? Masuk',
        dontHaveAccount: 'Belum punya akun? Buat satu',
        authFailed: 'Otentikasi Gagal',

        // Tabs
        home: 'Beranda',
        calendar: 'Kalender',
        watch: 'Tonton',
        profileTab: 'Profil',
    }
};

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const systemColorScheme = useColorScheme();
    const [theme, setThemeState] = useState<ThemeMode>('dark');
    const [language, setLanguageState] = useState<Language>('en');

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        const storedTheme = await getSetting('app_theme', 'dark') as ThemeMode;
        const storedLang = await getSetting('app_language', 'en') as Language;
        setThemeState(storedTheme);
        setLanguageState(storedLang);
    };

    const setTheme = async (newTheme: ThemeMode) => {
        setThemeState(newTheme);
        await saveSetting('app_theme', newTheme);
    };

    const setLanguage = async (newLang: Language) => {
        setLanguageState(newLang);
        await saveSetting('app_language', newLang);
    };

    const t = (key: string) => {
        return translations[language][key] || key;
    };

    const resolvedTheme = theme === 'system' ? (systemColorScheme || 'light') : theme;

    return (
        <SettingsContext.Provider value={{ theme, resolvedTheme, language, setTheme, setLanguage, t }}>
            {children}
        </SettingsContext.Provider>
    );
}

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
