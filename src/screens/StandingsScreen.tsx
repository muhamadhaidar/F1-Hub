import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useSettings } from '@/context/SettingsContext';
import { useFavorites } from '@/hooks/useFavorites';
import { f1Api } from '@/services/api';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type StandingsType = 'driver' | 'constructor';

const DriverStandingItem = React.memo(({ item, themeColors, isFavorite, onToggle, t }: any) => (
    <View style={[styles.row, { backgroundColor: themeColors.card }]}>
        <Text style={[styles.pos, { color: themeColors.text }]}>#{item.position}</Text>
        <View style={styles.info}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={[styles.name, { color: themeColors.text }]}>{item.driver}</Text>
                <TouchableOpacity onPress={() => onToggle('driver', item.driverId, item)}>
                    <IconSymbol
                        name={isFavorite('driver', item.driverId) ? "heart.fill" : "heart"}
                        size={16}
                        color={isFavorite('driver', item.driverId) ? Colors.dark.primary : (themeColors.icon)}
                    />
                </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={[styles.subtext, { color: themeColors.icon }]}>{item.team}</Text>
            </View>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
            <Text style={[styles.points, { color: themeColors.text }]}>{item.points} pts</Text>
        </View>
    </View>
));

const ConstructorStandingItem = React.memo(({ item, themeColors, isFavorite, onToggle, t }: any) => (
    <View style={[styles.row, { backgroundColor: themeColors.card }]}>
        <Text style={[styles.pos, { color: themeColors.text }]}>#{item.position}</Text>
        <View style={styles.info}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={[styles.name, { color: themeColors.text }]}>{item.team}</Text>
                <TouchableOpacity onPress={() => onToggle('team', item.teamId, item)}>
                    <IconSymbol
                        name={isFavorite('team', item.teamId) ? "heart.fill" : "heart"}
                        size={16}
                        color={isFavorite('team', item.teamId) ? Colors.dark.primary : (themeColors.icon)}
                    />
                </TouchableOpacity>
            </View>
            <Text style={[styles.subtext, { color: themeColors.icon }]}>{t('wins')}: {item.wins}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
            <Text style={[styles.points, { color: themeColors.text }]}>{item.points} {t('points')}</Text>
        </View>
    </View>
));

export default function StandingsScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    const initialType = route.params?.type || 'driver';
    const [year, setYear] = useState('2025');
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { isFavorite, toggle } = useFavorites();
    const { resolvedTheme, t } = useSettings();
    const themeColors = Colors[resolvedTheme];

    useEffect(() => {
        loadStandings();
    }, [year]);

    const loadStandings = async () => {
        setLoading(true);
        try {
            let res;
            if (initialType === 'driver') {
                res = await f1Api.getDriverStandings(year, 0); // 0 for all
            } else {
                res = await f1Api.getConstructorStandings(year, 0);
            }
            setData(res);
        } catch (error) {
            console.error('Error loading standings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = React.useCallback((type: any, id: any, item: any) => {
        toggle(type, id, item);
    }, [toggle]);

    const renderItem = ({ item }: { item: any }) => {
        if (initialType === 'driver') {
            return (
                <DriverStandingItem
                    item={item}
                    themeColors={themeColors}
                    isFavorite={isFavorite}
                    onToggle={handleToggle}
                    t={t}
                />
            );
        } else {
            return (
                <ConstructorStandingItem
                    item={item}
                    themeColors={themeColors}
                    isFavorite={isFavorite}
                    onToggle={handleToggle}
                    t={t}
                />
            );
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={{ color: Colors.dark.primary, fontSize: 16, fontWeight: '600' }}>{t('close')}</Text>
                </TouchableOpacity>
                <Text style={[styles.title, { color: themeColors.text }]}>
                    {initialType === 'driver' ? t('driverStandingsTitle') : t('constructorStandingsTitle')}
                </Text>
            </View>

            <View style={[styles.tabs, { backgroundColor: themeColors.card }]}>
                <TouchableOpacity
                    style={[styles.tab, year === '2025' && styles.activeTab]}
                    onPress={() => setYear('2025')}
                >
                    <Text style={[styles.tabText, year === '2025' && styles.activeTabText]}>2025</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, year === '2026' && styles.activeTab]}
                    onPress={() => setYear('2026')}
                >
                    <Text style={[styles.tabText, year === '2026' && styles.activeTabText]}>2026</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={Colors.dark.primary} style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={data}
                    keyExtractor={(item: any) => item.position}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    style={{ maxWidth: 800, width: '100%', alignSelf: 'center' }}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#050505',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        paddingBottom: 0,
    },
    backButton: {
        marginRight: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFF',
    },
    tabs: {
        flexDirection: 'row',
        margin: 16,
        backgroundColor: '#222',
        borderRadius: 12,
        padding: 4,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 10,
    },
    activeTab: {
        backgroundColor: Colors.dark.primary,
    },
    tabText: {
        color: '#888',
        fontWeight: 'bold',
    },
    activeTabText: {
        color: '#FFF',
    },
    list: {
        padding: 16,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#151515',
        padding: 16,
        marginBottom: 12,
        borderRadius: 12,
    },
    pos: {
        color: '#444',
        fontSize: 18,
        fontWeight: '900',
        width: 40,
    },
    info: {
        flex: 1,
    },
    name: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    subtext: {
        color: '#888',
        fontSize: 14,
    },
    points: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'right',
    },
});
