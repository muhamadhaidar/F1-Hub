import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const HERO_VIDEO = {
    id: '1',
    title: 'Bahrain GP: Race Highlights',
    duration: '8:45',
    views: '2.4M views',
    image: require('../../assets/images/react-logo.png'), // Placeholder - ideally use a Thumbnail
};

const RECENT_VIDEOS = [
    { id: '2', title: 'Top 5 Overtakes of the Weekend', duration: '5:32', time: '3 days ago' },
    { id: '3', title: 'Verstappen Onboard Pole Lap', duration: '1:29', time: '4 days ago' },
    { id: '4', title: 'Start Analysis: Who gained the most?', duration: '10:12', time: '5 days ago' },
];

import { useSettings } from '@/context/SettingsContext';

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

                {/* Filter Pills */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
                    <TouchableOpacity style={[styles.filterPill, styles.filterActive, { borderColor: Colors.dark.primary }]}>
                        <Text style={styles.filterTextActive}>{t('filterAll')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.filterPill, { backgroundColor: themeColors.card, borderColor: resolvedTheme === 'dark' ? Colors.dark.border : Colors.light.border }]}>
                        <Text style={[styles.filterText, { color: themeColors.text }]}>{t('filterHighlights')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.filterPill, { backgroundColor: themeColors.card, borderColor: resolvedTheme === 'dark' ? Colors.dark.border : Colors.light.border }]}>
                        <Text style={[styles.filterText, { color: themeColors.text }]}>{t('filterTopMoments')}</Text>
                    </TouchableOpacity>
                </ScrollView>

                {/* Hero Video Card */}
                <TouchableOpacity style={[styles.heroCard, { backgroundColor: themeColors.card }]} activeOpacity={0.9}>
                    <View style={[styles.thumbnailPlaceholder, { backgroundColor: resolvedTheme === 'dark' ? '#333' : '#ccc' }]}>
                        {/* Gradient Overlay Simulation */}
                        <View style={styles.overlay} />
                        <View style={styles.playButtonLarge}>
                            <IconSymbol name="play.rectangle.fill" size={32} color="#FFF" />
                        </View>
                        <View style={styles.heroInfo}>
                            <View style={styles.badge}><Text style={styles.badgeText}>{t('raceHighlightsBadge')}</Text></View>
                            <Text style={styles.heroTitle}>{HERO_VIDEO.title}</Text>
                            <Text style={styles.heroMeta}>{HERO_VIDEO.duration} • {HERO_VIDEO.views}</Text>
                        </View>
                    </View>
                </TouchableOpacity>

                <Text style={[styles.sectionTitle, { color: themeColors.text }]}>{t('recentVideos')}</Text>

                {/* Recent List */}
                {RECENT_VIDEOS.map((video) => (
                    <TouchableOpacity key={video.id} style={styles.videoRow}>
                        <View style={[styles.videoThumbSmall, { backgroundColor: resolvedTheme === 'dark' ? '#333' : '#ccc' }]}>
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
    filterScroll: {
        marginBottom: 20,
    },
    filterContent: {
        paddingHorizontal: 20,
        gap: 10,
    },
    filterPill: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: Colors.dark.card,
        borderWidth: 1,
        borderColor: Colors.dark.border,
    },
    filterActive: {
        backgroundColor: Colors.dark.primary,
        borderColor: Colors.dark.primary,
    },
    filterText: {
        color: Colors.dark.text,
        fontSize: 12,
        fontWeight: '600',
    },
    filterTextActive: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold',
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
        backgroundColor: 'linear-gradient(transparent, rgba(0,0,0,0.8))', // Simplified
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
});