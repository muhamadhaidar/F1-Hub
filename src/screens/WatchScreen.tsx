import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import React from 'react';
import { Alert, Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// 2025 Season Video Data (Mapped from User provided REVERSE list: Newest=Abu Dhabi to Oldest=Australia)
const SEASON_VIDEOS = [
    { id: '1', title: 'Round 1: Australian GP', youtubeId: 'md9-jG4RzXs', duration: 'Highlight', time: 'Mar 16' }, // Bottom of list
    { id: '2', title: 'Round 2: Chinese GP', youtubeId: 'Hml6MaRRkn8', duration: 'Highlight', time: 'Mar 23' },
    { id: '3', title: 'Round 3: Japanese GP', youtubeId: 'or9ooNWaqKU', duration: 'Highlight', time: 'Apr 06' },
    { id: '4', title: 'Round 4: Bahrain GP', youtubeId: 'bFXLP487kXo', duration: 'Highlight', time: 'Apr 13' },
    { id: '5', title: 'Round 5: Saudi Arabian GP', youtubeId: 'Li93iQDZQeg', duration: 'Highlight', time: 'Apr 20' },
    { id: '6', title: 'Round 6: Miami GP', youtubeId: 'xkRXnrvFCY0', duration: 'Highlight', time: 'May 04' },
    { id: '7', title: 'Round 7: Emilia Romagna GP', youtubeId: 'ajzQj7bjSWE', duration: 'Highlight', time: 'May 18' },
    { id: '8', title: 'Round 8: Monaco GP', youtubeId: 'ATlMK7ln5Dc', duration: 'Highlight', time: 'May 25' },
    { id: '9', title: 'Round 9: Spanish GP', youtubeId: '93ZnZF_zWds', duration: 'Highlight', time: 'Jun 01' },
    { id: '10', title: 'Round 10: Canadian GP', youtubeId: 'Wj6DHG0X66k', duration: 'Highlight', time: 'Jun 15' },
    { id: '11', title: 'Round 11: Austrian GP', youtubeId: 'daWr9xnkKS4', duration: 'Highlight', time: 'Jun 29' },
    { id: '12', title: 'Round 12: British GP', youtubeId: 'yApM21L0GgY', duration: 'Highlight', time: 'Jul 06' },
    { id: '13', title: 'Round 13: Hungarian GP', youtubeId: 'hrPtK5D5yn4', duration: 'Highlight', time: 'Jul 27' },
    { id: '14', title: 'Round 14: Belgian GP', youtubeId: 'JIRqdeNl2cU', duration: 'Highlight', time: 'Aug 03' },
    { id: '15', title: 'Round 15: Dutch GP', youtubeId: 'kGMp1Byuwto', duration: 'Highlight', time: 'Aug 31' },
    { id: '16', title: 'Round 16: Italian GP', youtubeId: 'JntKOmbMI08', duration: 'Highlight', time: 'Sep 07' },
    { id: '17', title: 'Round 17: Azerbaijan GP', youtubeId: 'XZhXFbFCOu4', duration: 'Highlight', time: 'Sep 21' },
    { id: '18', title: 'Round 18: Singapore GP', youtubeId: 'CdKwc1bC44c', duration: 'Highlight', time: 'Oct 05' },
    { id: '19', title: 'Round 19: United States GP', youtubeId: 'hTqxfkWRimk', duration: 'Highlight', time: 'Oct 19' },
    { id: '20', title: 'Round 20: Mexico City GP', youtubeId: 'MK83clSv6-k', duration: 'Highlight', time: 'Oct 26' },
    { id: '21', title: 'Round 21: Sao Paulo GP', youtubeId: 'uQc-pW3QLuI', duration: 'Highlight', time: 'Nov 09' },
    { id: '22', title: 'Round 22: Las Vegas GP', youtubeId: 'BeaVJggQ2dc', duration: 'Highlight', time: 'Nov 22' },
    { id: '23', title: 'Round 23: Qatar GP', youtubeId: 'S-LMSpzlnc0', duration: 'Highlight', time: 'Nov 30' },
    { id: '24', title: 'Round 24: Abu Dhabi GP', youtubeId: 'S-LMSpzlnc0', duration: 'Highlight', time: 'Dec 07' },
];

const HERO_VIDEO = SEASON_VIDEOS[SEASON_VIDEOS.length - 1]; // Abu Dhabi (Last Race) as Hero video now? Or user wants Australia? User asked for S-LMSpzlnc0 to be Hero. S-LMSpzlnc0 is Abu Dhabi.
const RECENT_VIDEOS = SEASON_VIDEOS.slice(0, SEASON_VIDEOS.length - 1).reverse(); // Show others below.

import { useSettings } from '@/context/SettingsContext';

const playVideo = (youtubeId: string) => {
    const url = `https://www.youtube.com/watch?v=${youtubeId}`;
    Linking.canOpenURL(url).then((supported) => {
        if (supported) {
            Linking.openURL(url);
        } else {
            Alert.alert("Error", "Cannot open YouTube link");
        }
    }).catch(err => console.error("An error occurred", err));
};

export default function WatchScreen() {
    const { resolvedTheme, t } = useSettings();
    const themeColors = Colors[resolvedTheme];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>

                <View style={styles.header}>
                    <Text style={[styles.headerTitle, { color: themeColors.text }]}>{t('watchTitle')}</Text>
                    <Text style={[styles.headerSubtitle, { color: themeColors.icon }]}>{t('watchSubtitle')}</Text>
                </View>



                {/* Hero Video Card */}
                <TouchableOpacity
                    style={[styles.heroCard, { backgroundColor: themeColors.card }]}
                    activeOpacity={0.9}
                    onPress={() => playVideo(HERO_VIDEO.youtubeId)}
                >
                    <Image
                        source={{ uri: `https://img.youtube.com/vi/${HERO_VIDEO.youtubeId}/hqdefault.jpg` }}
                        style={StyleSheet.absoluteFillObject}
                        resizeMode="cover"
                    />
                    {/* Gradient Overlay Simulation */}
                    <View style={styles.overlay} />
                    <View style={styles.playButtonLarge}>
                        <IconSymbol name="play.rectangle.fill" size={32} color="#FFF" />
                    </View>
                    <View style={styles.heroInfo}>
                        <View style={styles.badge}><Text style={styles.badgeText}>{t('raceHighlightsBadge')}</Text></View>
                        <Text style={styles.heroTitle}>{HERO_VIDEO.title}</Text>
                        <Text style={styles.heroMeta}>{HERO_VIDEO.duration} • {HERO_VIDEO.time}</Text>
                    </View>
                </TouchableOpacity>

                <Text style={[styles.sectionTitle, { color: themeColors.text }]}>{t('recentVideos')}</Text>

                {/* Recent List */}
                {RECENT_VIDEOS.map((video) => (
                    <TouchableOpacity
                        key={video.id}
                        style={styles.videoRow}
                        onPress={() => playVideo(video.youtubeId)}
                    >
                        <View style={styles.videoThumbSmall}>
                            <Image
                                source={{ uri: `https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg` }}
                                style={StyleSheet.absoluteFillObject}
                                resizeMode="cover"
                            />
                            <Text style={styles.durationBadge}>{video.duration}</Text>
                        </View>
                        <View style={styles.videoInfo}>
                            <Text style={[styles.videoTitle, { color: themeColors.text }]}>{video.title}</Text>
                            <Text style={[styles.videoMeta, { color: themeColors.icon }]}>{video.time}</Text>
                        </View>
                        <IconSymbol name="chevron.right" size={20} color={themeColors.icon} />
                    </TouchableOpacity>
                ))}

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.dark.background,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    header: {
        padding: 20,
        paddingBottom: 10,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '900',
        fontStyle: 'italic',
        color: Colors.dark.text,
    },
    headerSubtitle: {
        color: Colors.dark.icon,
        fontSize: 14,
        marginTop: 4,
    },

    heroCard: {
        marginHorizontal: 20,
        height: 220,
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 24,
        backgroundColor: '#222',
    },
    thumbnailPlaceholder: {
        flex: 1,
        backgroundColor: '#333', // Placeholder color
        justifyContent: 'flex-end',
        position: 'relative',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    playButtonLarge: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -24,
        marginLeft: -24,
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.dark.primary,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: Colors.dark.primary,
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 5,
    },
    heroInfo: {
        padding: 16,
    },
    badge: {
        backgroundColor: Colors.dark.primary,
        alignSelf: 'flex-start',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginBottom: 8,
    },
    badgeText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    heroTitle: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 4,
    },
    heroMeta: {
        color: '#CCC',
        fontSize: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.dark.text,
        marginLeft: 20,
        marginBottom: 12,
    },
    videoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    videoThumbSmall: {
        width: 120,
        height: 68,
        backgroundColor: '#333',
        borderRadius: 8,
        justifyContent: 'flex-end',
        padding: 4,
    },
    durationBadge: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        color: '#FFF',
        fontSize: 10,
        paddingHorizontal: 4,
        borderRadius: 2,
        alignSelf: 'flex-end',
    },
    videoInfo: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
    },
    videoTitle: {
        color: Colors.dark.text,
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
        lineHeight: 20,
    },
    videoMeta: {
        color: Colors.dark.icon,
        fontSize: 12,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        maxWidth: 600,
        borderRadius: 16,
        padding: 20,
        paddingTop: 40,
        position: 'relative',
    },
    closeButton: {
        position: 'absolute',
        top: 0,
        right: 0,
        padding: 10,
        zIndex: 1,
    },
    playerWrapper: {
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#000',
    },
    playingTitle: {
        marginTop: 16,
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});