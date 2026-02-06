
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { f1Api, getRaceImage } from '@/services/api';
import { F1Race } from '@/types/f1';
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, ImageBackground, Modal, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HoverScale } from '@/components/ui/HoverScale';
import { useSettings } from '@/context/SettingsContext';
import { useFavorites } from '@/hooks/useFavorites';
import { useNavigation } from '@react-navigation/native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function CalendarScreen() {
  const { isFavorite, toggle } = useFavorites();
  const { resolvedTheme, t } = useSettings();
  const themeColors = Colors[resolvedTheme];
  const navigation = useNavigation();
  const [races, setRaces] = useState<F1Race[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('2026');

  // Results Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRace, setSelectedRace] = useState<F1Race | null>(null);
  const [raceResults, setRaceResults] = useState<any[]>([]);
  const [resultsLoading, setResultsLoading] = useState(false);

  // Animation Values
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const opacity = useSharedValue(0);

  useEffect(() => {
    loadSchedule();
  }, [selectedYear]);

  useEffect(() => {
    if (modalVisible) {
      translateY.value = withTiming(0, { duration: 300 });
      opacity.value = withTiming(1);
    } else {
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 });
      opacity.value = withTiming(0);
    }
  }, [modalVisible]);

  const loadSchedule = async () => {
    setLoading(true);
    const data = await f1Api.getSeasonSchedule(selectedYear);
    setRaces(data);
    setLoading(false);
  };

  const handleRacePress = async (race: F1Race) => {
    if (new Date(race.date) > new Date()) {
      if (selectedYear === '2026') return;
    }

    setSelectedRace(race);
    setModalVisible(true);
    setResultsLoading(true);

    const results = await f1Api.getRaceResults(selectedYear, race.round.toString());
    setRaceResults(results);
    setResultsLoading(false);
  };

  const closeModal = () => {
    translateY.value = withTiming(SCREEN_HEIGHT, { duration: 250 }, () => {
      runOnJS(setModalVisible)(false);
    });
  };

  // Gesture Handler
  const pan = Gesture.Pan()
    .onChange((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onFinalize((event) => {
      if (event.translationY > 100) {
        runOnJS(closeModal)();
      } else {
        translateY.value = withTiming(0, { duration: 200 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const nextRaceIndex = selectedYear === '2026' ? races.findIndex(r => new Date(r.date) > new Date()) : -1;

  const renderItem = ({ item, index }: { item: F1Race; index: number }) => {
    const isNext = index === nextRaceIndex;
    const isPast = new Date(item.date) < new Date();
    const raceImage = getRaceImage(item.circuit.country);

    return (
      <HoverScale
        style={[
          styles.raceCardContainer,
          isNext && styles.nextRaceBorder
        ]}
        onPress={() => handleRacePress(item)}
      >
        <ImageBackground
          source={{ uri: raceImage }}
          style={styles.cardInfo}
          imageStyle={{ borderRadius: 12 }}
          resizeMode="cover"
        >
          <View style={[styles.cardOverlay, isPast && { backgroundColor: 'rgba(0,0,0,0.8)' }]}>
            <View style={styles.roundInfo}>
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                <Text style={[styles.roundText, isNext && styles.nextRoundText]}>R{item.round}</Text>
                {isNext && <View style={styles.nextBadge}><Text style={styles.nextBadgeText}>{t('next')}</Text></View>}
              </View>

              <View style={{ alignItems: 'center', gap: 12 }}>
                <HoverScale onPress={() => toggle('race', item.id.toString(), item)}>
                  <IconSymbol
                    name={isFavorite('race', item.id.toString()) ? "star.fill" : "star"}
                    size={20}
                    color={isFavorite('race', item.id.toString()) ? "#FFD700" : "#FFF"}
                  />
                </HoverScale>
                <HoverScale
                  onPress={() => (navigation as any).navigate('RaceJournal', { raceId: item.id.toString(), raceName: item.name })}
                >
                  <IconSymbol
                    name="square.and.pencil"
                    size={20}
                    color="#FFF"
                  />
                </HoverScale>
              </View>
            </View>

            <View style={styles.raceInfo}>
              <View>
                <Text style={styles.raceName}>{item.name}</Text>
                <Text style={styles.circuitName}>{item.circuit.name}</Text>
              </View>
            </View>

            <View style={styles.dateContainer}>
              <IconSymbol name="calendar" size={14} color="#CCC" />
              <Text style={styles.dateText}>{format(new Date(item.date), 'MMM dd, yyyy')}</Text>
              {isPast && <Text style={styles.viewResultsText}> • Result {'>'}</Text>}
            </View>
          </View>
        </ImageBackground>
      </HoverScale>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={[styles.header, { borderBottomColor: resolvedTheme === 'dark' ? Colors.dark.border : Colors.light.border }]}>
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>{t('calendarTitle')}</Text>
        <View style={[styles.yearToggle, { backgroundColor: themeColors.card, borderColor: resolvedTheme === 'dark' ? '#333' : '#ddd' }]}>
          <HoverScale
            style={[styles.yearButton, selectedYear === '2025' && styles.yearActive]}
            onPress={() => setSelectedYear('2025')}
          >
            <Text style={[
              styles.yearText,
              selectedYear === '2025' && styles.yearTextActive,
              selectedYear !== '2025' && { color: themeColors.text }
            ]}>2025</Text>
          </HoverScale>
          <HoverScale
            style={[styles.yearButton, selectedYear === '2026' && styles.yearActive]}
            onPress={() => setSelectedYear('2026')}
          >
            <Text style={[
              styles.yearText,
              selectedYear === '2026' && styles.yearTextActive,
              selectedYear !== '2026' && { color: themeColors.text }
            ]}>2026</Text>
          </HoverScale>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.dark.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={races}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text style={{ color: themeColors.text, textAlign: 'center', marginTop: 20 }}>{t('noRacesFound')}</Text>}
        />
      )}

      {/* DRAGGABLE RESULTS MODAL */}
      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <GestureHandlerRootView style={styles.modalOverlay}>
          <Animated.View style={[styles.backdrop, backdropStyle]} onTouchEnd={closeModal} />

          <GestureDetector gesture={pan}>
            <Animated.View style={[styles.modalContent, animatedStyle, { backgroundColor: themeColors.card }]}>
              <View style={styles.dragHandleBar}>
                <View style={[styles.dragHandle, { backgroundColor: resolvedTheme === 'dark' ? '#444' : '#ccc' }]} />
              </View>

              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: themeColors.text }]}>{t('raceResults')}</Text>
                <HoverScale onPress={closeModal} style={styles.closeButton}>
                  <IconSymbol name="xmark.circle.fill" size={24} color={themeColors.icon} />
                </HoverScale>
              </View>

              {selectedRace && (
                <View style={[styles.modalSubHeader, { borderBottomColor: resolvedTheme === 'dark' ? '#222' : '#eee' }]}>
                  <Text style={[styles.modalRaceName, { color: themeColors.text }]}>{selectedRace.name}</Text>
                  <Text style={[styles.modalDate, { color: themeColors.icon }]}>{format(new Date(selectedRace.date), 'MMM dd, yyyy')}</Text>
                </View>
              )}

              {resultsLoading ? (
                <ActivityIndicator size="large" color={Colors.dark.primary} style={{ marginVertical: 40 }} />
              ) : raceResults.length > 0 ? (
                <Animated.ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 40 }}
                  // Prevent ScrollView from stealing drag gesture when at top
                  bounces={false}
                >
                  {raceResults.map((result) => (
                    <View key={result.pos} style={[styles.resultRow, { borderBottomColor: resolvedTheme === 'dark' ? '#222' : '#eee' }]}>
                      <View style={[styles.posBadge, result.pos === 1 ? styles.pos1 : result.pos === 2 ? styles.pos2 : result.pos === 3 ? styles.pos3 : { backgroundColor: resolvedTheme === 'dark' ? '#333' : '#ddd' }]}>
                        <Text style={[styles.posText, result.pos <= 3 ? { color: 'black' } : { color: themeColors.text }]}>{result.pos}</Text>
                      </View>
                      <View style={styles.driverInfo}>
                        <Text style={[styles.driverName, { color: themeColors.text }]}>{result.driver}</Text>
                        <Text style={[styles.teamName, { color: themeColors.icon }]}>{result.team}</Text>
                      </View>
                      <Text style={[styles.timeText, { color: themeColors.icon }]}>{result.time}</Text>
                      <Text style={styles.ptsText}>{result.pts}</Text>
                    </View>
                  ))}
                </Animated.ScrollView>
              ) : (
                <View style={styles.emptyState}>
                  <Text style={[styles.emptyText, { color: themeColors.text }]}>{t('noResults')}</Text>
                  {selectedYear === '2026' && <Text style={[styles.emptySubText, { color: themeColors.icon }]}>{t('raceNotHeld')}</Text>}
                </View>
              )}
            </Animated.View>
          </GestureDetector>
        </GestureHandlerRootView>
      </Modal>
    </SafeAreaView>
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
  yearToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.dark.card,
    borderRadius: 8,
    padding: 4,
    borderWidth: 1,
    borderColor: '#333',
  },
  yearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  yearActive: {
    backgroundColor: Colors.dark.primary,
  },
  yearText: {
    color: '#666',
    fontWeight: '600',
  },
  yearTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
  },
  raceCardContainer: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    backgroundColor: Colors.dark.card,
  },
  nextRaceBorder: {
    borderWidth: 2,
    borderColor: Colors.dark.primary,
  },
  cardInfo: {
    width: '100%',
    minHeight: 120,
  },
  cardOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 16,
    justifyContent: 'space-between',
  },
  pastRaceCard: {
    // Kept if needed, or remove if unused. 
    // Logic was: View style={[styles.cardOverlay, isPast && { backgroundColor: 'rgba(0,0,0,0.8)' }]}
    // So this might not be needed in styles object if handled inline, but let's leave valid structure.
  },
  roundInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  roundText: {
    color: Colors.dark.icon,
    fontWeight: 'bold',
    fontSize: 12,
  },
  nextRoundText: {
    color: Colors.dark.primary,
  },
  nextBadge: {
    backgroundColor: Colors.dark.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    justifyContent: 'center',
  },
  nextBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    lineHeight: 12,
  },
  raceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  raceName: {
    color: Colors.dark.text,
    fontSize: 18,
    fontWeight: '700',
  },
  circuitName: {
    color: Colors.dark.icon,
    fontSize: 12,
    marginTop: 2,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    color: Colors.dark.text,
    fontSize: 13,
    fontWeight: '500',
  },
  viewResultsText: {
    color: Colors.dark.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  // MODAL STYLES
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  modalContent: {
    backgroundColor: '#151515',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '85%',
    padding: 20,
    paddingTop: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
  },
  dragHandleBar: {
    alignItems: 'center',
    paddingBottom: 20,
    paddingTop: 10,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#444',
    borderRadius: 2,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  closeButton: {
    padding: 4,
  },
  modalSubHeader: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    paddingBottom: 16,
  },
  modalRaceName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  modalDate: {
    color: '#666',
    fontSize: 14,
  },
  // RESULT ROWS
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
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
  posDefault: { backgroundColor: '#333' },
  posText: {
    color: 'white',
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
    fontSize: 12,
    fontVariant: ['tabular-nums'],
    marginRight: 10,
  },
  ptsText: {
    color: Colors.dark.primary,
    fontWeight: 'bold',
    width: 30,
    textAlign: 'right',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptySubText: {
    color: '#666',
    marginTop: 8,
  }
});
