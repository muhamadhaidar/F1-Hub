import { Colors } from '@/constants/theme';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { f1Api } from '@/services/api';
type SessionType = 'Practice' | 'Qualifying' | 'Race';

const ResultRow = React.memo(({ item }: { item: any }) => (
    <View style={styles.row}>
        <View style={styles.posCell}>
            <View style={[styles.posBadge, item.pos === 1 && styles.pos1]}>
                <Text style={[styles.posText, item.pos === 1 && styles.pos1Text]}>{item.pos}</Text>
            </View>
        </View>
        <View style={styles.driverCell}>
            <View style={[styles.teamLine, { backgroundColor: item.team.includes('Red Bull') ? '#061D41' : (item.team.includes('Ferrari') ? '#EF1A2D' : '#00A19B') }]} />
            <View>
                <Text style={styles.driverText}>{item.driver}</Text>
                <Text style={styles.teamText}>{item.team}</Text>
            </View>
        </View>
        <Text style={styles.timeText}>{item.time}</Text>
        <Text style={styles.ptsText}>{item.pts}</Text>
    </View>
));

export default function ResultsScreen() {
    const [selectedSession, setSelectedSession] = useState<SessionType>('Race');
    const [results, setResults] = useState<any[]>([]);
    const [raceName, setRaceName] = useState('Loading...');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadResults();
    }, []);

    const loadResults = async () => {
        // Fetch last race of 2025 as requested
        const data = await f1Api.getLastRaceResults('2025');
        if (data) {
            setResults(data.results);
            setRaceName(data.raceName + ' (2025)');
        } else {
            setRaceName('Results Unavailable');
        }
        setLoading(false);
    };

    const renderRow = React.useCallback(({ item }: { item: any }) => (
        <ResultRow item={item} />
    ), []);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>RESULTS</Text>
                <Text style={styles.subHeader}>{raceName}</Text>
            </View>

            {/* Segmented Control */}
            <View style={styles.segmentContainer}>
                {(['Practice', 'Qualifying', 'Race'] as SessionType[]).map((session) => (
                    <TouchableOpacity
                        key={session}
                        style={[styles.segmentButton, selectedSession === session && styles.segmentActive]}
                        onPress={() => setSelectedSession(session)}
                    >
                        <Text style={[styles.segmentText, selectedSession === session && styles.segmentTextActive]}>
                            {session}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Table Header */}
            <View style={styles.tableHeader}>
                <Text style={[styles.th, { width: 40 }]}>POS</Text>
                <Text style={[styles.th, { flex: 1 }]}>DRIVER</Text>
                <Text style={[styles.th, { width: 80, textAlign: 'right' }]}>TIME/GAP</Text>
                <Text style={[styles.th, { width: 40, textAlign: 'right' }]}>PTS</Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={Colors.dark.primary} style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={results}
                    renderItem={renderRow}
                    keyExtractor={item => item.driver}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={<Text style={{ color: 'white', textAlign: 'center', marginTop: 20 }}>No results found.</Text>}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.dark.background,
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
    subHeader: {
        color: Colors.dark.icon,
        fontSize: 14,
        marginTop: 4,
    },
    segmentContainer: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginBottom: 20,
        backgroundColor: Colors.dark.card,
        borderRadius: 8,
        padding: 4,
        borderWidth: 1,
        borderColor: Colors.dark.border,
    },
    segmentButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 6,
    },
    segmentActive: {
        backgroundColor: Colors.dark.primary,
    },
    segmentText: {
        color: Colors.dark.icon,
        fontWeight: '600',
        fontSize: 12,
        textTransform: 'uppercase',
    },
    segmentTextActive: {
        color: '#FFF',
    },
    tableHeader: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: Colors.dark.border,
        paddingBottom: 8,
    },
    th: {
        color: Colors.dark.icon,
        fontSize: 10,
        fontWeight: 'bold',
    },
    listContent: {
        paddingHorizontal: 20,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#222',
    },
    posCell: {
        width: 40,
        alignItems: 'flex-start',
    },
    posBadge: {
        width: 24,
        height: 24,
        borderRadius: 4,
        backgroundColor: '#333',
        alignItems: 'center',
        justifyContent: 'center',
    },
    pos1: {
        backgroundColor: '#FFD700', // Gold
    },
    posText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    pos1Text: {
        color: '#000',
    },
    driverCell: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    teamLine: {
        width: 3,
        height: 24,
        marginRight: 10,
        borderRadius: 2,
        backgroundColor: 'white', // fallback
    },
    driverText: {
        color: Colors.dark.text,
        fontSize: 14,
        fontWeight: '700',
    },
    teamText: {
        color: Colors.dark.icon,
        fontSize: 10,
    },
    timeText: {
        width: 80,
        textAlign: 'right',
        color: Colors.dark.text,
        fontSize: 12,
        fontVariant: ['tabular-nums'],
    },
    ptsText: {
        width: 40,
        textAlign: 'right',
        color: Colors.dark.primary,
        fontWeight: 'bold',
        fontSize: 14,
    },
});