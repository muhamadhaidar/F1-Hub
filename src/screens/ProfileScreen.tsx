
import { HoverScale } from '@/components/ui/HoverScale';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useFavorites } from '@/hooks/useFavorites';
import { getRaceImage } from '@/services/api';
import { getUserProfile, saveUserProfile, UserProfile } from '@/services/database';
import { getDriverImageUrl, getTeamLogoUrl } from '@/services/imageMap';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Dimensions, Image, ImageBackground, Linking, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

type TabType = 'DRIVER' | 'TEAM' | 'RACE';

import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';

export default function ProfileScreen() {
    const navigation = useNavigation<any>();
    const { signOut } = useAuth(); // Get signOut from context
    const { favorites, refresh } = useFavorites();
    const { resolvedTheme, t } = useSettings();
    const themeColors = Colors[resolvedTheme];
    const [activeTab, setActiveTab] = useState<TabType>('DRIVER');

    // Profile State
    const [name, setName] = useState('User Name');
    const [bio, setBio] = useState('F1 Enthusiast');
    const [photo, setPhoto] = useState('https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png');
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    // Load Profile
    useEffect(() => {
        const loadProfile = async () => {
            try {
                const profile = await getUserProfile();
                setName(profile.name);
                setBio(profile.bio);
                setPhoto(profile.photo);
            } catch (error) {
                console.error('Failed to load profile:', error);
            } finally {
                setIsLoadingProfile(false);
            }
        };
        loadProfile();
    }, []);

    // Edit Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [tempName, setTempName] = useState(name);
    const [tempBio, setTempBio] = useState(bio);
    const [tempPhoto, setTempPhoto] = useState(photo);

    const handleSaveProfile = async () => {
        setIsSaving(true);
        setSaveError(null);
        try {
            // Reverted to local save only (no upload) as per user request
            const newProfile: UserProfile = {
                name: tempName,
                bio: tempBio,
                photo: tempPhoto,
            };

            await saveUserProfile(newProfile);
            setName(tempName);
            setBio(tempBio);
            setPhoto(tempPhoto);
            setModalVisible(false);
            Alert.alert('Success', 'Profile updated successfully!');
        } catch (error) {
            console.error('Failed to save profile:', error);
            const errorMessage = (error as any)?.message || 'Unknown error occurred';
            setSaveError(errorMessage);
            Alert.alert('Error', `Failed to save profile: ${errorMessage}`);
        } finally {
            setIsSaving(false);
        }
    };

    const openEditModal = () => {
        setTempName(name);
        setTempBio(bio);
        setTempPhoto(photo);
        setModalVisible(true);
    };

    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.4,
        });

        if (!result.canceled) {
            setTempPhoto(result.assets[0].uri);
        }
    };

    useFocusEffect(
        useCallback(() => {
            refresh();
        }, [refresh])
    );

    const drivers = favorites.filter(f => f.type === 'driver').map(f => f.data);
    const teams = favorites.filter(f => f.type === 'team').map(f => f.data);
    const races = favorites.filter(f => f.type === 'race').map(f => f.data);

    const renderTabs = () => (
        <View style={styles.tabContainer}>
            <Text style={[styles.tabLabel, { color: themeColors.icon }]}>{t('favorite').toUpperCase()}</Text>
            <View style={[styles.tabBar, { backgroundColor: themeColors.card }]}>
                {(['DRIVER', 'TEAM', 'RACE'] as TabType[]).map((tab) => (
                    <HoverScale
                        key={tab}
                        style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Text style={[
                            styles.tabText,
                            activeTab === tab ? styles.tabTextActive : { color: themeColors.text }
                        ]}>
                            {t(tab.toLowerCase() as any)}
                        </Text>
                    </HoverScale>
                ))}
            </View>
        </View>
    );

    const renderContent = () => {
        if (activeTab === 'DRIVER') {
            if (drivers.length === 0) return <Text style={styles.emptyText}>No favorite drivers.</Text>;
            return drivers.map((driver: any) => (
                <HoverScale key={driver.driverId} style={styles.driverLargeCard}>
                    <ImageBackground
                        source={{ uri: getDriverImageUrl(driver.driverId) }}
                        style={styles.driverCardBackground}
                        imageStyle={{ borderRadius: 12, opacity: 0.8 }}
                        resizeMode="cover"
                    >
                        <View style={{ position: 'absolute', top: 12, left: 12 }}>
                            <IconSymbol name="star.fill" size={20} color="#FFD700" />
                        </View>
                        <View style={styles.driverNameContainer}>
                            <Text style={styles.driverNameTitle}>{driver.driver.toUpperCase()}</Text>
                            <Text style={styles.driverTeamSubtitle}>{driver.team}</Text>
                        </View>
                    </ImageBackground>
                </HoverScale>
            ));
        }

        if (activeTab === 'TEAM') {
            if (teams.length === 0) return <Text style={styles.emptyText}>No favorite teams.</Text>;
            return teams.map((team: any) => (
                <HoverScale key={team.teamId} style={styles.teamLargeCard}>
                    <ImageBackground
                        source={typeof getTeamLogoUrl(team.teamId) === 'string' ? { uri: getTeamLogoUrl(team.teamId) } : getTeamLogoUrl(team.teamId)}
                        style={styles.teamCardBackground}
                        imageStyle={{ borderRadius: 16, opacity: 0.9 }} // Visual tweak for readability
                        resizeMode="cover"
                    >
                        <View style={styles.cardOverlay}>
                            <View style={{ position: 'absolute', top: 12, right: 12 }}>
                                <IconSymbol name="star.fill" size={20} color="#FFD700" />
                            </View>

                            <View style={styles.teamContentContainer}>
                                <Text style={styles.teamNameText}>{(typeof team.name === 'string' ? team.name : team.team).toUpperCase()}</Text>
                            </View>
                        </View>
                    </ImageBackground>
                </HoverScale>
            ));
        }

        if (activeTab === 'RACE') {
            if (races.length === 0) return <Text style={styles.emptyText}>No favorite races.</Text>;
            return races.map((race: any) => (
                <HoverScale key={race.id} style={styles.largeCard}>
                    <ImageBackground
                        source={{ uri: getRaceImage(race.circuit?.country || '') }}
                        style={styles.cardInfo}
                        imageStyle={{ borderRadius: 16 }}
                        resizeMode="cover"
                    >
                        <View style={styles.cardOverlay}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.roundBadge}>R{race.round}</Text>
                                <IconSymbol name="star.fill" size={24} color="#FFD700" />
                            </View>
                            <View>
                                <Text style={styles.largeCardTitle}>{race.name}</Text>
                                <Text style={styles.largeCardSubtitle}>{race.circuit?.name}</Text>
                                <Text style={styles.largeCardDate}>{format(new Date(race.date), 'MMM dd, yyyy')}</Text>
                            </View>
                        </View>
                    </ImageBackground>
                </HoverScale>
            ));
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
            <View style={[styles.header, { borderBottomColor: resolvedTheme === 'dark' ? Colors.dark.border : Colors.light.border }]}>
                <Text style={[styles.headerTitle, { color: themeColors.text }]}>{t('profile').toUpperCase()}</Text>
            </View>

            <View style={styles.headerContainer}>
                <LinearGradient
                    colors={['#FF0000', '#8B0000']} // Red to Dark Red
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.redHeaderCard}
                >
                    <View style={styles.profileHeaderContent}>
                        <Image source={{ uri: photo }} style={styles.avatarCircleLarge} />
                        <View style={styles.profileInfoText}>
                            <Text style={styles.profileName}>{name}</Text>
                            <Text style={styles.profileBio}>{bio}</Text>
                        </View>
                    </View>
                </LinearGradient>
            </View>

            <View style={styles.contentContainer}>

                {/* Checkered Flag / Settings Grid */}
                <View style={styles.settingsGrid}>
                    {/* Row 1 */}
                    <View style={styles.settingsRow}>
                        <HoverScale
                            style={[
                                styles.settingsCard,
                                styles.f1Button,
                                { backgroundColor: themeColors.card, borderColor: resolvedTheme === 'dark' ? '#333' : '#ddd' }
                            ]}
                            onPress={() => Linking.openURL('https://www.formula1.com')}
                        >
                            <Image
                                source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/F1.svg/1200px-F1.svg.png' }}
                                style={[styles.f1Logo, resolvedTheme === 'light' && { tintColor: '#000' }]}
                                resizeMode="contain"
                            />
                        </HoverScale>

                        <HoverScale
                            style={[
                                styles.settingsCard,
                                styles.editProfileButton,
                                { backgroundColor: themeColors.card, borderColor: resolvedTheme === 'dark' ? '#333' : '#ddd' }
                            ]}
                            onPress={openEditModal}
                        >
                            <Text style={[styles.settingsLabel, { color: themeColors.text }]}>{t('editProfile')}</Text>
                            <IconSymbol name="pencil" size={16} color={themeColors.text} style={{ marginLeft: 8 }} />
                        </HoverScale>
                    </View>



                    {/* Row 3 - Settings (New) */}
                    <HoverScale
                        style={[
                            styles.settingsCard,
                            styles.settingsButton,
                            { backgroundColor: themeColors.card, borderColor: resolvedTheme === 'dark' ? '#333' : '#ddd' }
                        ]}
                        onPress={() => navigation.navigate('Settings' as any)}
                    >
                        <Text style={[styles.settingsLabel, { color: themeColors.text }]}>{t('settings').toUpperCase()}</Text>
                    </HoverScale>
                </View>

                {/* Removed duplicate "Favorite" header as per user request */}
                {renderTabs()}

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {renderContent()}

                    <HoverScale
                        style={[
                            styles.logoutButton,
                            {
                                backgroundColor: themeColors.card,
                                borderColor: resolvedTheme === 'dark' ? '#333' : '#ddd',
                                marginBottom: 15,
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                paddingHorizontal: 16,
                                alignItems: 'center'
                            }
                        ]}
                        onPress={() => navigation.navigate('RaceJournal' as never)}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="book" size={20} color={themeColors.tint} style={{ marginRight: 12 }} />
                            <Text style={[styles.logoutText, { color: themeColors.text, fontSize: 14, letterSpacing: 0.5 }]}>
                                {t('race_journal')}
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={themeColors.icon} />
                    </HoverScale>

                    <HoverScale
                        style={[
                            styles.logoutButton,
                            { backgroundColor: themeColors.card, borderColor: resolvedTheme === 'dark' ? '#333' : '#ddd' }
                        ]}
                        onPress={signOut}
                    >
                        <Text style={styles.logoutText}>{t('logout')}</Text>
                    </HoverScale>
                </ScrollView>
            </View>


            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: themeColors.card, borderColor: resolvedTheme === 'dark' ? '#333' : '#ddd' }]}>
                        <Text style={[styles.modalTitle, { color: themeColors.text }]}>{t('editProfile')}</Text>

                        <Text style={[styles.inputLabel, { color: themeColors.icon }]}>{t('name')}</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: resolvedTheme === 'dark' ? '#000' : '#f0f0f0', color: themeColors.text, borderColor: resolvedTheme === 'dark' ? '#333' : '#ddd' }]}
                            value={tempName}
                            onChangeText={setTempName}
                            placeholder={t('enterYourName')}
                            placeholderTextColor="#666"
                        />

                        <Text style={[styles.inputLabel, { color: themeColors.icon }]}>{t('bio')}</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: resolvedTheme === 'dark' ? '#000' : '#f0f0f0', color: themeColors.text, borderColor: resolvedTheme === 'dark' ? '#333' : '#ddd' }]}
                            value={tempBio}
                            onChangeText={setTempBio}
                            placeholder={t('enterShortBio')}
                            placeholderTextColor="#666"
                        />

                        <Text style={[styles.inputLabel, { color: themeColors.icon }]}>{t('profilePhoto')}</Text>
                        <TouchableOpacity style={[styles.uploadButton, { backgroundColor: resolvedTheme === 'dark' ? '#333' : '#f0f0f0', borderColor: resolvedTheme === 'dark' ? '#444' : '#ddd' }]} onPress={pickImage}>
                            <IconSymbol name="photo" size={20} color={themeColors.text} style={{ marginRight: 10 }} />
                            <Text style={[styles.uploadButtonText, { color: themeColors.text }]}>{t('chooseFromGallery')}</Text>
                        </TouchableOpacity>
                        <Text style={[styles.hintText, { color: themeColors.icon }]}>{t('selected')}: {tempPhoto ? t('imageSelected') : t('noImage')}</Text>

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={[styles.cancelButton, { backgroundColor: resolvedTheme === 'dark' ? '#333' : '#ccc' }]} onPress={() => setModalVisible(false)}>
                                <Text style={[styles.cancelButtonText, resolvedTheme === 'light' && { color: '#000' }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.saveButton, isSaving && { opacity: 0.7 }]}
                                onPress={handleSaveProfile}
                                disabled={isSaving}
                            >
                                <Text style={styles.saveButtonText}>{isSaving ? 'Saving...' : 'Save'}</Text>
                            </TouchableOpacity>
                        </View>
                        {saveError && (
                            <Text style={{ color: '#FF4444', marginTop: 12, textAlign: 'center', fontSize: 13, fontWeight: 'bold' }}>
                                {saveError}
                            </Text>
                        )}
                    </View>
                </View>
            </Modal>
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.dark.background,
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.dark.border,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '900',
        fontStyle: 'italic',
        color: Colors.dark.text,
    },
    headerContainer: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    redHeaderCard: {
        // backgroundColor: Colors.dark.card, // Removed in favor of gradient
        marginTop: 10,
        height: 100,
        borderRadius: 16,
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    avatarCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FFF',
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 20,
        marginTop: 32, // Increased gap
    },
    settingsGrid: {
        gap: 12,
        marginBottom: 24,
    },
    settingsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    settingsCard: {
        borderRadius: 4,
        overflow: 'hidden',
    },
    f1Button: {
        flex: 1,
        height: 60,
        backgroundColor: '#1C1C1E', // Dark card
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#333',
        borderRadius: 12,
    },
    f1Logo: {
        width: '60%',
        height: '60%',
        tintColor: '#D00000',
    },
    editProfileButton: {
        flex: 1,
        height: 60,
        backgroundColor: '#1C1C1E', // Dark card
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#333',
        borderRadius: 12,
    },
    settingsButton: {
        width: '100%',
        height: 50,
        backgroundColor: '#1C1C1E', // Dark card
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#333',
    },

    settingsLabel: {
        color: '#FFF', // White text
        fontWeight: '900',
        fontStyle: 'italic',
        fontSize: 14, // Slightly larger for readability with italics
        letterSpacing: 1,
    },
    sectionTitle: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 10,
        paddingLeft: 4,
    },
    tabContainer: {
        marginBottom: 20,
    },
    tabLabel: {
        color: '#888',
        fontSize: 12,
        fontWeight: '900',
        fontStyle: 'italic',
        marginBottom: 8,
        letterSpacing: 1,
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: '#222',
        borderRadius: 25,
        padding: 4,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 20,
    },
    tabButtonActive: {
        backgroundColor: '#D00000',
    },
    tabText: {
        color: '#888',
        fontWeight: '900',
        fontStyle: 'italic',
        fontSize: 12,
    },
    tabTextActive: {
        color: '#FFF',
    },
    scrollContent: {
        paddingBottom: 40,
    },
    emptyText: {
        color: '#666',
        fontStyle: 'italic',
        marginTop: 20,
        textAlign: 'center',
    },
    // Driver Large Card
    driverLargeCard: {
        height: 180,
        marginBottom: 16,
        borderRadius: 16,
        backgroundColor: '#000',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#222',
        position: 'relative',
    },
    driverCardBackground: {
        width: '100%',
        height: '100%',
        justifyContent: 'flex-end',
        padding: 16,
    },
    driverNameContainer: {
        marginBottom: 8,
    },
    driverNameTitle: {
        color: '#FFF',
        fontSize: 22,
        fontWeight: '900', // Heavy bold
        fontStyle: 'italic',
        lineHeight: 24,
    },
    driverTeamSubtitle: {
        color: '#CCC',
        fontSize: 14,
        fontWeight: '500',
        marginTop: 4,
    },

    // Team Large Card
    teamLargeCard: {
        height: 180, // Matching Driver Card height
        marginBottom: 16,
        borderRadius: 16,
        backgroundColor: '#001A30',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#333',
    },
    teamCardBackground: {
        width: '100%',
        height: '100%',
    },
    teamContentContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'flex-start', // Align text left like others, or center? User screenshot had center. Let's stick to consistent overlay.
    },
    teamNameText: {
        color: '#FFF',
        fontSize: 24, // Larger
        fontWeight: '900',
        fontStyle: 'italic',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10,
    },

    // Race Large Card (Reusing some logic but kept separate for clarity if needed)
    largeCard: {
        height: 180,
        marginBottom: 16,
        borderRadius: 16,
        overflow: 'hidden',
    },
    cardInfo: {
        width: '100%',
        height: '100%',
        borderRadius: 16,
    },
    cardOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        padding: 20,
        justifyContent: 'space-between',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    largeCardTitle: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: '900',
        fontStyle: 'italic',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10,
    },
    largeCardSubtitle: {
        color: '#DDD',
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 4,
    },
    largeCardDate: {
        color: '#CCC',
        fontSize: 12,
        marginTop: 4,
    },
    roundBadge: {
        backgroundColor: '#D00000',
        color: '#FFF',
        fontWeight: 'bold',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        overflow: 'hidden',
    },
    logoutButton: {
        width: '100%',
        height: 50,
        backgroundColor: '#1C1C1E', // Match settings
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#333',
        marginTop: 0, // Remove top margin since it's in the grid now
    },
    logoutText: {
        color: '#D00000', // Red text for logout
        fontWeight: '900',
        fontStyle: 'italic',
        fontSize: 14,
        letterSpacing: 1,
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#1C1C1E', // Dark modal
        width: '100%',
        borderRadius: 16,
        padding: 24,
        borderWidth: 1,
        borderColor: '#333',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 20,
        textAlign: 'center',
    },
    inputLabel: {
        color: '#CCC',
        fontSize: 12,
        marginBottom: 8,
        fontWeight: 'bold',
    },
    input: {
        backgroundColor: '#000',
        color: '#FFF',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#333',
        marginBottom: 16,
    },
    hintText: {
        color: '#666',
        fontSize: 10,
        marginTop: -10,
        marginBottom: 20,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        padding: 14,
        borderRadius: 8,
        backgroundColor: '#333',
        alignItems: 'center',
    },
    saveButton: {
        flex: 1,
        padding: 14,
        borderRadius: 8,
        backgroundColor: '#D00000',
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    saveButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    // Updated Header Styles
    profileHeaderContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarCircleLarge: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#FFF',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    profileInfoText: {
        marginLeft: 16,
        flex: 1,
    },
    profileName: {
        color: '#FFF',
        fontSize: 22,
        fontWeight: '900',
        fontStyle: 'italic',
    },
    profileBio: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        marginTop: 4,
    },
    uploadButton: {
        backgroundColor: '#333',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#444',
    },
    uploadButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
});
