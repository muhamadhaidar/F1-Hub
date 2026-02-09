import { Colors } from '@/constants/theme';
import { useSettings } from '@/context/SettingsContext';
import { f1Api } from '@/services/api';
import { JournalEntry, deleteJournalNote, getJournalNoteForRace, getJournalNotes, saveJournalNote } from '@/services/database';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { format } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';
import React, { memo, useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useWindowDimensions
} from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CATEGORIES = ['Note', 'Prediction', 'Memory', 'Technical'] as const;

const renderRating = (val: number, size = 16) => {
    return (
        <View style={styles.ratingStars}>
            {[1, 2, 3, 4, 5].map(star => (
                <Ionicons
                    key={star}
                    name={star <= val ? "star" : "star-outline"}
                    size={size}
                    color={star <= val ? "#FFD700" : "#555"}
                    style={{ marginRight: 2 }}
                />
            ))}
        </View>
    );
};

const JournalItem = memo(({ item, themeColors, resolvedTheme, isDesktop, onEdit, onDelete }: any) => (
    <View style={[
        styles.noteCard,
        { backgroundColor: themeColors.card, borderColor: resolvedTheme === 'dark' ? '#333' : '#eee' },
        isDesktop && { flex: 1, marginBottom: 20 }
    ]}>
        <View style={styles.cardIndicator} />
        <View style={{ flex: 1 }}>
            <View style={styles.noteHeader}>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.raceName, { color: themeColors.text }]}>{item.raceName}</Text>
                    <View style={styles.metaRow}>
                        <View style={[styles.categoryBadge, { backgroundColor: themeColors.tint + '20' }]}>
                            <Text style={[styles.categoryText, { color: themeColors.tint }]}>{item.category || 'Note'}</Text>
                        </View>
                        {renderRating(item.rating || 0)}
                    </View>
                </View>
                <View style={styles.actionButtons}>
                    <TouchableOpacity onPress={() => onEdit(item)} style={styles.actionButton}>
                        <Ionicons name="pencil" size={18} color={themeColors.tint} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => onDelete(item.raceId)} style={styles.actionButton}>
                        <Ionicons name="trash-outline" size={18} color="#ff4444" />
                    </TouchableOpacity>
                </View>
            </View>
            <Text style={[styles.noteContent, { color: themeColors.text, opacity: 0.8 }]} numberOfLines={3}>
                {item.note}
            </Text>
            <View style={styles.cardFooter}>
                <Ionicons name="time-outline" size={12} color={themeColors.text} style={{ opacity: 0.5, marginRight: 4 }} />
                <Text style={[styles.updatedAt, { color: themeColors.text, opacity: 0.5 }]}>
                    {format(new Date(item.updatedAt), 'MMM d, yyyy • HH:mm')}
                </Text>
            </View>
        </View>
    </View>
));
type Category = typeof CATEGORIES[number];

export default function RaceJournalScreen() {
    const { resolvedTheme, t } = useSettings();
    const themeColors = Colors[resolvedTheme];
    const navigation = useNavigation();
    const route = useRoute();
    const { raceId: paramRaceId, raceName: paramRaceName } = (route.params as any) || {};

    const [notes, setNotes] = useState<JournalEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Editor State
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingNote, setEditingNote] = useState<JournalEntry | null>(null);
    const [noteText, setNoteText] = useState('');
    const [rating, setRating] = useState(0);
    const [category, setCategory] = useState<Category>('Note');

    // Race Picker State
    const [isPickerVisible, setIsPickerVisible] = useState(false);
    const [allRaces, setAllRaces] = useState<any[]>([]);
    const [isRacesLoading, setIsRacesLoading] = useState(false);

    useEffect(() => {
        loadNotes();
        if (paramRaceId && paramRaceName) {
            handleDirectOpen(paramRaceId, paramRaceName);
        }
    }, [paramRaceId, paramRaceName]);

    const loadNotes = async () => {
        setIsLoading(true);
        try {
            const data = await getJournalNotes();
            setNotes(data);
        } catch (error) {
            console.error('Failed to load journal notes', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadAllRaces = async () => {
        if (allRaces.length > 0) {
            setIsPickerVisible(true);
            return;
        }
        setIsRacesLoading(true);
        try {
            const data = await f1Api.getSeasonSchedule('2026'); // Default to 2026
            setAllRaces(data);
            setIsPickerVisible(true);
        } catch (error) {
            Alert.alert('Error', 'Failed to load race list');
        } finally {
            setIsRacesLoading(false);
        }
    }

    const handleDirectOpen = async (id: string, name: string) => {
        const existing = await getJournalNoteForRace(id);
        setEditingNote({
            raceId: id,
            raceName: name,
            note: existing?.note || '',
            rating: existing?.rating || 0,
            category: (existing?.category as Category) || 'Note',
            updatedAt: existing?.updatedAt || new Date().toISOString()
        });
        setNoteText(existing?.note || '');
        setRating(existing?.rating || 0);
        setCategory((existing?.category as Category) || 'Note');
        setIsModalVisible(true);
    };

    const handleEdit = useCallback((note: JournalEntry) => {
        setEditingNote(note);
        setNoteText(note.note);
        setRating(note.rating || 0);
        setCategory((note.category as Category) || 'Note');
        setIsModalVisible(true);
    }, []);

    const handleSave = async () => {
        if (!editingNote) return;
        if (!noteText.trim()) {
            Alert.alert('Empty Note', 'Please write something before saving.');
            return;
        }

        try {
            await saveJournalNote(editingNote.raceId, editingNote.raceName, noteText, rating, category);
            setIsModalVisible(false);
            setEditingNote(null);
            loadNotes();
        } catch (error) {
            Alert.alert('Error', 'Failed to save note');
        }
    };

    const performDelete = async (raceId: string) => {
        try {
            await deleteJournalNote(raceId);
            loadNotes();
        } catch (error) {
            console.error('Delete error:', error);
            Alert.alert('Error', 'Failed to delete note');
        }
    };

    const handleDelete = useCallback((raceId: string) => {
        if (Platform.OS === 'web') {
            // Web compliant confirmation
            if (window.confirm(t('delete_note_message'))) {
                performDelete(raceId);
            }
            return;
        }

        Alert.alert(
            t('confirm_delete'),
            t('delete_note_message'),
            [
                { text: t('cancel'), style: 'cancel' },
                {
                    text: t('delete'),
                    style: 'destructive',
                    onPress: () => performDelete(raceId)
                }
            ]
        );
    }, [t]);

    const { width } = useWindowDimensions();
    const isDesktop = width > 768; // Desktop breakpoint

    const renderItem = ({ item }: { item: JournalEntry }) => (
        <JournalItem
            item={item}
            themeColors={themeColors}
            resolvedTheme={resolvedTheme}
            isDesktop={isDesktop}
            onEdit={handleEdit}
            onDelete={handleDelete}
        />
    );

    return (
        <View style={[styles.container, { backgroundColor: themeColors.background }]}>
            <LinearGradient
                colors={resolvedTheme === 'dark' ? ['#FF1801', '#101010'] : ['#FF1801', '#FFF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1.2 }}
                style={styles.premiumHeader}
            >
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Race Journal</Text>
                    <TouchableOpacity onPress={() => loadNotes()} style={styles.backButton}>
                        <Ionicons name="refresh" size={20} color="#FFF" />
                    </TouchableOpacity>
                </View>
                <View style={[styles.headerStats, { maxWidth: 1200, alignSelf: 'center', width: '100%' }]}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{notes.length}</Text>
                        <Text style={styles.statLabel}>Entries</Text>
                    </View>
                    <View style={[styles.statItem, { borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.2)' }]}>
                        <Text style={styles.statValue}>🏎️</Text>
                        <Text style={styles.statLabel}>Personal Paddock</Text>
                    </View>
                </View>
            </LinearGradient>

            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={themeColors.tint} />
                </View>
            ) : notes.length === 0 ? (
                <View style={styles.center}>
                    <View style={styles.emptyIconContainer}>
                        <Ionicons name="book" size={80} color={themeColors.tint} style={{ opacity: 0.3 }} />
                        <View style={styles.emptyIconOverlay}>
                            <Ionicons name="pencil" size={30} color="#FFF" />
                        </View>
                    </View>
                    <Text style={[styles.emptyText, { color: themeColors.text }]}>
                        {t('no_notes')}
                    </Text>
                    <TouchableOpacity
                        style={[styles.premiumButton, { backgroundColor: themeColors.tint }]}
                        onPress={loadAllRaces}
                    >
                        <Text style={styles.premiumButtonText}>Start Your First Entry</Text>
                        <Ionicons name="add-circle" size={20} color="#FFF" style={{ marginLeft: 8 }} />
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    key={isDesktop ? 'desktop-grid' : 'mobile-list'}
                    data={notes}
                    renderItem={renderItem}
                    keyExtractor={(item: JournalEntry) => item.raceId}
                    contentContainerStyle={[styles.listContent, { maxWidth: 1200, width: '100%', alignSelf: 'center' }]}
                    showsVerticalScrollIndicator={false}
                    numColumns={isDesktop ? 3 : 1}
                    columnWrapperStyle={isDesktop ? { gap: 20 } : undefined}
                />
            )}

            {/* Floating Action Button */}
            {!isLoading && notes.length > 0 && (
                <TouchableOpacity
                    style={[styles.fab, { backgroundColor: themeColors.tint }]}
                    onPress={loadAllRaces}
                >
                    <Ionicons name="add" size={30} color="#FFF" />
                </TouchableOpacity>
            )}

            {/* RACE PICKER MODAL */}
            <Modal visible={isPickerVisible} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: themeColors.card, maxHeight: '80%' }]}>
                        <View style={styles.modalHeaderRow}>
                            <Text style={[styles.modalTitle, { color: themeColors.text }]}>Pick a Race</Text>
                            <TouchableOpacity onPress={() => setIsPickerVisible(false)}>
                                <Ionicons name="close-circle" size={28} color={themeColors.icon} />
                            </TouchableOpacity>
                        </View>
                        {isRacesLoading ? (
                            <ActivityIndicator size="large" color={themeColors.tint} style={{ margin: 40 }} />
                        ) : (
                            <FlatList
                                data={allRaces}
                                keyExtractor={(item: any) => item.id.toString()}
                                renderItem={({ item }: { item: any }) => (
                                    <TouchableOpacity
                                        style={[styles.racePickerItem, { borderBottomColor: resolvedTheme === 'dark' ? '#333' : '#eee' }]}
                                        onPress={() => {
                                            setIsPickerVisible(false);
                                            handleDirectOpen(item.id.toString(), item.name);
                                        }}
                                    >
                                        <Text style={[styles.racePickerName, { color: themeColors.text }]}>{item.name}</Text>
                                        <Ionicons name="chevron-forward" size={16} color={themeColors.icon} />
                                    </TouchableOpacity>
                                )}
                            />
                        )}
                    </View>
                </View>
            </Modal>

            {/* EDITOR MODAL */}
            <Modal visible={isModalVisible} animationType="slide" transparent={true}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalOverlay}
                >
                    <View style={[styles.modalContent, { backgroundColor: themeColors.card }]}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={styles.editorRaceRound}>RACE ENTRY</Text>
                            <Text style={[styles.modalTitle, { color: themeColors.text, marginBottom: 5 }]}>
                                {editingNote?.raceName}
                            </Text>

                            <Text style={styles.inputLabel}>CATEGORY</Text>
                            <View style={styles.categoryRow}>
                                {CATEGORIES.map(cat => (
                                    <TouchableOpacity
                                        key={cat}
                                        style={[
                                            styles.catPill,
                                            category === cat && { backgroundColor: themeColors.tint },
                                            { borderColor: themeColors.tint }
                                        ]}
                                        onPress={() => setCategory(cat)}
                                    >
                                        <Text style={[styles.catPillText, category === cat && { color: '#FFF' }]}>{cat}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.inputLabel}>RACE RATING</Text>
                            <View style={styles.ratingPicker}>
                                {[1, 2, 3, 4, 5].map(star => (
                                    <TouchableOpacity key={star} onPress={() => setRating(star)}>
                                        <Ionicons
                                            name={star <= rating ? "star" : "star-outline"}
                                            size={32}
                                            color={star <= rating ? "#FFD700" : "#555"}
                                            style={{ marginRight: 8 }}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.inputLabel}>YOUR THOUGHTS</Text>
                            <TextInput
                                style={[styles.input, {
                                    color: themeColors.text,
                                    backgroundColor: resolvedTheme === 'dark' ? '#222' : '#f9f9f9',
                                    borderColor: resolvedTheme === 'dark' ? '#444' : '#ddd'
                                }]}
                                multiline
                                placeholder={t('write_note_placeholder')}
                                placeholderTextColor="#888"
                                value={noteText}
                                onChangeText={setNoteText}
                            />

                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={[styles.button, styles.cancelButton]}
                                    onPress={() => setIsModalVisible(false)}
                                >
                                    <Text style={styles.buttonText}>{t('cancel')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.button, styles.saveButton, { backgroundColor: themeColors.tint }]}
                                    onPress={handleSave}
                                >
                                    <Text style={styles.buttonText}>{t('save')}</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    premiumHeader: {
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 25,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFF',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    headerStats: {
        flexDirection: 'row',
        marginTop: 10,
    },
    statItem: {
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFF',
    },
    statLabel: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.7)',
        textTransform: 'uppercase',
        marginTop: 2,
    },
    listContent: {
        padding: 20,
        paddingBottom: 100,
    },
    noteCard: {
        borderRadius: 20,
        padding: 15,
        marginBottom: 20,
        borderWidth: 1,
        flexDirection: 'row',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    cardIndicator: {
        width: 4,
        height: '100%',
        backgroundColor: '#FF1801',
        borderRadius: 2,
        marginRight: 12,
    },
    noteHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    raceName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    categoryBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        marginRight: 10,
    },
    categoryText: {
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    ratingStars: {
        flexDirection: 'row',
    },
    actionButtons: {
        flexDirection: 'row',
    },
    actionButton: {
        marginLeft: 12,
        padding: 4,
    },
    noteContent: {
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 12,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
        paddingTop: 8,
    },
    updatedAt: {
        fontSize: 11,
        fontWeight: '500',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyIconContainer: {
        position: 'relative',
        marginBottom: 20,
    },
    emptyIconOverlay: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#FF1801',
        width: 45,
        height: 45,
        borderRadius: 22.5,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#101010',
    },
    emptyText: {
        textAlign: 'center',
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 30,
        opacity: 0.7,
    },
    premiumButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 25,
        paddingVertical: 15,
        borderRadius: 30,
        shadowColor: "#FF1801",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 8,
    },
    premiumButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        padding: 25,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        minHeight: 500,
    },
    modalHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '900',
    },
    editorRaceRound: {
        fontSize: 12,
        color: '#FF1801',
        fontWeight: 'bold',
        letterSpacing: 2,
        marginBottom: 4,
    },
    inputLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#888',
        marginTop: 20,
        marginBottom: 10,
        letterSpacing: 1,
    },
    categoryRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    catPill: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        marginRight: 10,
        marginBottom: 10,
    },
    catPillText: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#888',
    },
    ratingPicker: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    input: {
        height: 150,
        borderRadius: 20,
        padding: 15,
        fontSize: 16,
        textAlignVertical: 'top',
        marginBottom: 30,
        borderWidth: 1,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: 20,
    },
    button: {
        flex: 1,
        padding: 16,
        borderRadius: 15,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#333',
        marginRight: 10,
    },
    saveButton: {
        marginLeft: 10,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    racePickerItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 18,
        borderBottomWidth: 1,
    },
    racePickerName: {
        fontSize: 16,
        fontWeight: '600',
    },
});
