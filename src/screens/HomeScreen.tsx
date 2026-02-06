import { Countdown } from '@/components/Countdown';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useFavorites } from '@/hooks/useFavorites';
import { f1Api, getRaceImage } from '@/services/api';
import { F1Race } from '@/types/f1';
import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSettings } from '@/context/SettingsContext';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();
  const isDesktop = width > 768; // Desktop breakpoint
  const { isFavorite, toggle } = useFavorites();
  const { resolvedTheme, t } = useSettings();
  const themeColors = Colors[resolvedTheme];

  const [nextRace, setNextRace] = useState<F1Race | null>(null);
  const [schedule, setSchedule] = useState<F1Race[]>([]);
  const [lastResults, setLastResults] = useState<any>(null);
  const [standings, setStandings] = useState<any[]>([]);
  const [constructorStandings, setConstructorStandings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [race, seasonSchedule, results, driverStandings, teamStandings] = await Promise.all([
        f1Api.getNextRace(),
        f1Api.getSeasonSchedule(),
        f1Api.getLastRaceResults('2025'), // Fetching 2025 results for now as 2026 is fresh
        f1Api.getDriverStandings('2025'),
        f1Api.getConstructorStandings('2025')
      ]);

      setNextRace(race);
      setSchedule(seasonSchedule);
      setLastResults(results);
      setStandings(driverStandings);
      setConstructorStandings(teamStandings);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const upcomingRaces = schedule.filter(r => new Date(r.date) > new Date()).slice(0, 5); // Next 5 races

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Header Section */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: themeColors.text }]}>{t('homeTitle')}</Text>
          <Text style={[styles.headerSubtitle, { color: themeColors.icon }]}>{t('homeSubtitle')}</Text>
        </View>


        {loading ? (
          <ActivityIndicator size="large" color={Colors.dark.primary} style={{ marginTop: 50 }} />
        ) : (
          <>
            {/* NEXT RACE CARD */}
            {nextRace ? (
              <View style={[styles.heroCard, { backgroundColor: themeColors.card, borderColor: Colors.dark.primary }]}>
                <ImageBackground
                  source={{ uri: getRaceImage(nextRace.circuit.country) }}
                  style={styles.heroImage}
                  imageStyle={{ borderRadius: 20, opacity: 0.4 }}
                >
                  <View style={[styles.heroContent, !isDesktop && { alignItems: 'center' }]}>
                    <View style={styles.badgeContainer}>
                      <Text style={styles.nextRaceBadge}>NEXT RACE</Text>
                    </View>



                    <Text style={styles.heroRaceName}>{nextRace.name}</Text>

                    <View style={styles.heroLocationRow}>
                      <IconSymbol name="location.fill" size={14} color={themeColors.icon} />
                      <Text style={[styles.heroLocation, { color: themeColors.icon }]}>{nextRace.circuit.country} • {nextRace.circuit.name}</Text>
                    </View>

                    <Countdown targetDate={nextRace.date + 'T' + nextRace.time} />

                    <View style={styles.dateRow}>
                      <IconSymbol name="clock" size={14} color={themeColors.icon} />
                      <Text style={[styles.dateText, { color: themeColors.icon }]}>
                        {format(new Date(nextRace.date), 'MMM dd-')}{format(new Date(new Date(nextRace.date).getTime() + 2 * 86400000), 'dd, yyyy')}
                      </Text>
                    </View>
                  </View>
                </ImageBackground>
              </View>
            ) : null}

            {/* UPCOMING RACES */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: themeColors.text }]}>{t('upcomingRaces')}</Text>
              {isDesktop && (
                <View style={styles.desktopControls}>
                  {/* Future filter/sort logic */}
                </View>
              )}
            </View>
            <FlatList
              data={upcomingRaces}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingHorizontal: 20 }}
              renderItem={({ item }) => {
                const isFav = isFavorite('race', item.id);
                return (
                  <View
                    style={[
                      styles.upcomingCardContainer,
                      isDesktop && { width: 250, marginRight: 16 },
                      {
                        backgroundColor: themeColors.card,
                        borderWidth: 1, // Add border for visibility in light mode
                        borderColor: resolvedTheme === 'dark' ? 'transparent' : '#eee'
                      }
                    ]}
                  >
                    <ImageBackground
                      source={{ uri: getRaceImage(item.circuit.country) }}
                      style={styles.upcomingCardImage}
                      imageStyle={{ borderRadius: 12 }}
                      resizeMode="cover"
                    >
                      <View style={styles.upcomingOverlay}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Text style={styles.upcomingRound}>R{item.round}</Text>
                          <TouchableOpacity onPress={() => toggle('race', item.id, item)}>
                            <IconSymbol
                              name={isFav ? "star.fill" : "star"}
                              size={20}
                              color={isFav ? "#FFD700" : "#FFF"}
                            />
                          </TouchableOpacity>
                        </View>
                        <View>
                          <Text style={styles.upcomingCountryCode}>{item.circuit.country.substring(0, 3).toUpperCase()}</Text>
                          <Text style={styles.upcomingRaceName} numberOfLines={1}>{item.name}</Text>
                        </View>
                        <Text style={styles.upcomingDate}>{format(new Date(item.date), 'MMM dd')}</Text>
                      </View>
                    </ImageBackground>
                  </View>
                );
              }}
            />

            {/* RECENT GRAND PRIX */}
            {lastResults ? (
              <>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: themeColors.text }]}>{t('recentGP')}</Text>
                  <TouchableOpacity>
                    <IconSymbol name="chevron.right" size={20} color={Colors.dark.icon} />
                  </TouchableOpacity>
                </View>
                <View style={[styles.statsCard, { backgroundColor: themeColors.card }]}>
                  <View style={styles.statsHeader}>
                    <IconSymbol name="flag.fill" size={16} color={Colors.dark.primary} />
                    <Text style={[styles.statsTitle, { color: themeColors.text }]}>{lastResults.raceName}</Text>
                  </View>
                  <Text style={[styles.statsDate, { color: themeColors.icon }]}>{format(new Date(lastResults.date), 'MMM dd, yyyy')}</Text>

                  <View style={styles.resultsList}>
                    {lastResults.results.slice(0, 3).map((result: any) => (
                      <View key={result.pos} style={styles.resultRow}>
                        <View style={[styles.posBadge, result.pos === 1 ? styles.pos1 : result.pos === 2 ? styles.pos2 : styles.pos3]}>
                          <Text style={[styles.posText, result.pos === 1 && { color: 'black' }]}>P{result.pos}</Text>
                        </View>
                        <View style={styles.driverInfo}>
                          <Text style={[styles.driverName, { color: themeColors.text }]}>{result.driver}</Text>
                          <Text style={[styles.teamName, { color: themeColors.icon }]}>{result.team}</Text>
                        </View>
                        <Text style={[styles.timeText, { color: themeColors.icon }]}>{result.time}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </>
            ) : null}

            {/* DRIVER STANDINGS */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: themeColors.text }]}>{t('driverStandings')}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Standings' as any, { type: 'driver' })}>
                <IconSymbol name="chevron.right" size={20} color={Colors.dark.icon} />
              </TouchableOpacity>
            </View>
            <View style={[styles.statsCard, { backgroundColor: themeColors.card }]}>
              {standings.map((driver) => {
                const isDriverFav = isFavorite('driver', driver.driverId);

                return (
                  <View key={driver.position} style={[styles.standingRow, { borderBottomColor: resolvedTheme === 'dark' ? '#222' : '#eee' }]}>
                    <Text style={[styles.standingPos, { color: themeColors.text }]}>#{driver.position}</Text>
                    <View style={styles.driverInfo}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={[styles.driverName, { color: themeColors.text }]}>{driver.driver}</Text>
                        <TouchableOpacity hitSlop={10} onPress={() => toggle('driver', driver.driverId, driver)}>
                          <IconSymbol name={isDriverFav ? "heart.fill" : "heart"} size={16} color={isDriverFav ? Colors.dark.primary : (resolvedTheme === 'dark' ? "#888" : "#ccc")} />
                        </TouchableOpacity>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={[styles.teamName, { color: themeColors.icon }]}>{driver.team}</Text>
                      </View>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={[styles.pointsText, { color: themeColors.text }]}>{driver.points}</Text>
                      <Text style={[styles.ptsLabel, { color: themeColors.icon }]}>{t('points')}</Text>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* CONSTRUCTOR STANDINGS */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: themeColors.text }]}>{t('constructorStandings')}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Standings' as any, { type: 'constructor' })}>
                <IconSymbol name="chevron.right" size={20} color={Colors.dark.icon} />
              </TouchableOpacity>
            </View>
            <View style={[styles.statsCard, { backgroundColor: themeColors.card }]}>
              {constructorStandings.map((team) => {
                const isTeamFav = isFavorite('team', team.teamId);

                return (
                  <View key={team.position} style={[styles.standingRow, { borderBottomColor: resolvedTheme === 'dark' ? '#222' : '#eee' }]}>
                    <Text style={[styles.standingPos, { color: themeColors.text }]}>#{team.position}</Text>
                    <View style={styles.driverInfo}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={[styles.driverName, { color: themeColors.text }]}>{team.team}</Text>
                        <TouchableOpacity hitSlop={10} onPress={() => toggle('team', team.teamId, team)}>
                          <IconSymbol name={isTeamFav ? "heart.fill" : "heart"} size={16} color={isTeamFav ? Colors.dark.primary : (resolvedTheme === 'dark' ? "#888" : "#ccc")} />
                        </TouchableOpacity>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={[styles.teamName, { color: themeColors.icon }]}>{t('wins')}: {team.wins}</Text>
                      </View>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={[styles.pointsText, { color: themeColors.text }]}>{team.points}</Text>
                      <Text style={[styles.ptsLabel, { color: themeColors.icon }]}>{t('points')}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505', // Very dark bg
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    fontStyle: 'italic',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  // HERO CARD
  heroCard: {
    height: 380,
    borderRadius: 24,
    borderWidth: 2, // Red border as requested
    borderColor: '#D40000',
    overflow: 'hidden',
    marginBottom: 30,
    backgroundColor: '#111',
  },
  heroImage: {
    flex: 1,
    padding: 24,
    justifyContent: 'flex-end',
  },
  heroContent: {
    // Content overlaid on image
  },
  badgeContainer: {
    position: 'absolute',
    top: -200, // Move it to top left of card relative to content
    left: 0,
  },
  nextRaceBadge: {
    backgroundColor: '#D40000',
    color: 'white',
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
    fontSize: 12,
  },
  heroRaceName: {
    color: 'white',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  heroLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  heroLocation: {
    color: '#999',
    fontSize: 14,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  dateText: {
    color: '#999',
    fontSize: 14,
  },
  // SECTIONS
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 10,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  viewAll: {
    color: '#D40000',
    fontSize: 14,
    fontWeight: '600',
  },
  desktopControls: {
    flexDirection: 'row',
  },
  // UPCOMING SCROLL
  horizontalScroll: {
    marginBottom: 24,
  },
  upcomingCardContainer: {
    marginRight: 8, // Reduced from 12 to tighter spacing
    width: 140,
    height: 140, // Taller to show image better
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#151515',
  },
  upcomingCardImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  upcomingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 12,
    justifyContent: 'space-between',
  },
  upcomingRound: {
    color: '#D40000',
    fontWeight: 'bold',
    fontSize: 12,
  },
  upcomingCountryCode: {
    color: 'white',
    fontSize: 28,
    fontWeight: '900',
    marginTop: 0,
    fontStyle: 'italic',
  },
  upcomingRaceName: {
    color: '#EEE',
    fontSize: 10,
    fontWeight: '600',
  },
  upcomingDate: {
    color: '#CCC',
    fontSize: 12,
    fontWeight: '500',
  },

  // STATS CARD (Generic for Last Race & Standings)
  statsCard: {
    backgroundColor: '#151515',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statsTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  statsDate: {
    color: '#666',
    fontSize: 12,
    marginLeft: 26, // Align with title text
    marginBottom: 16,
  },
  resultsList: {
    gap: 16,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  posBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  pos1: { backgroundColor: '#FFD700' },
  pos2: { backgroundColor: '#C0C0C0' },
  pos3: { backgroundColor: '#CD7F32' },
  posText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 12,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  teamName: {
    color: '#666',
    fontSize: 12,
  },
  timeText: {
    color: '#888',
    fontSize: 14,
    fontVariant: ['tabular-nums'],
  },
  // STANDINGS SPECIFIC
  standingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  standingPos: {
    color: '#444',
    fontSize: 16,
    fontWeight: 'bold',
    width: 40,
  },
  pointsText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  ptsLabel: {
    color: '#666',
    fontSize: 10,
  }
});
