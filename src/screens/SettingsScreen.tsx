import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useSettings } from '@/context/SettingsContext';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SettingsScreen() {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { theme, resolvedTheme, language, setTheme, setLanguage, t } = useSettings();

    const toggleTheme = (value: boolean) => {
        setTheme(value ? 'dark' : 'light');
    };

    const handleLanguageChange = () => {
        if (language === 'en') {
            setLanguage('id');
        } else {
            setLanguage('en');
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: resolvedTheme === 'dark' ? Colors.dark.background : Colors.light.background }]}>

            {/* Header with dynamic safe area padding */}
            <View style={[styles.header, {
                backgroundColor: resolvedTheme === 'dark' ? Colors.dark.card : Colors.light.card,
                borderBottomColor: resolvedTheme === 'dark' ? Colors.dark.border : Colors.light.border,
                paddingTop: (insets.top || 40) + 10,
                paddingBottom: 12,
            }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={15}>
                    <IconSymbol name="chevron.left" size={28} color={resolvedTheme === 'dark' ? "#FFF" : "#000"} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: resolvedTheme === 'dark' ? "#FFF" : "#000" }]}>{t('settings').toUpperCase()}</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* General Section */}
                <Text style={styles.sectionTitle}>{t('general')}</Text>
                <View style={[styles.section, { backgroundColor: resolvedTheme === 'dark' ? Colors.dark.card : Colors.light.card }]}>
                    <TouchableOpacity style={styles.row} onPress={handleLanguageChange}>
                        <View style={styles.rowLeft}>
                            <IconSymbol name="globe" size={20} color={resolvedTheme === 'dark' ? "#FFF" : "#000"} />
                            <Text style={[styles.rowLabel, { color: resolvedTheme === 'dark' ? "#FFF" : "#000" }]}>{t('language')}</Text>
                        </View>
                        <View style={styles.rowRight}>
                            <Text style={styles.rowValue}>{language === 'en' ? 'English' : 'Bahasa Indonesia'}</Text>
                            <IconSymbol name="chevron.right" size={16} color="#666" />
                        </View>
                    </TouchableOpacity>


                    <View style={[styles.separator, { backgroundColor: resolvedTheme === 'dark' ? Colors.dark.border : Colors.light.border }]} />

                    <View style={styles.row}>
                        <View style={styles.rowLeft}>
                            <IconSymbol name="moon.fill" size={20} color={resolvedTheme === 'dark' ? "#FFF" : "#000"} />
                            <Text style={[styles.rowLabel, { color: resolvedTheme === 'dark' ? "#FFF" : "#000" }]}>{t('darkMode')}</Text>
                        </View>
                        <View style={styles.rowRight}>
                            <Switch
                                value={theme === 'dark'}
                                onValueChange={toggleTheme}
                                trackColor={{ false: '#767577', true: Colors.dark.tint }}
                            />
                        </View>
                    </View>
                </View>

                {/* About Section */}
                <Text style={styles.sectionTitle}>{t('about')}</Text>
                <View style={[styles.section, { backgroundColor: resolvedTheme === 'dark' ? Colors.dark.card : Colors.light.card }]}>
                    <TouchableOpacity style={styles.row}>
                        <View style={styles.rowLeft}>
                            <IconSymbol name="info.circle" size={20} color={resolvedTheme === 'dark' ? "#FFF" : "#000"} />
                            <Text style={[styles.rowLabel, { color: resolvedTheme === 'dark' ? "#FFF" : "#000" }]}>{t('version')}</Text>
                        </View>
                        <Text style={styles.rowValue}>1.0.0</Text>
                    </TouchableOpacity>

                    <View style={[styles.separator, { backgroundColor: resolvedTheme === 'dark' ? Colors.dark.border : Colors.light.border }]} />

                    <TouchableOpacity style={styles.row}>
                        <View style={styles.rowLeft}>
                            <IconSymbol name="doc.text" size={20} color={resolvedTheme === 'dark' ? "#FFF" : "#000"} />
                            <Text style={[styles.rowLabel, { color: resolvedTheme === 'dark' ? "#FFF" : "#000" }]}>{t('terms')}</Text>
                        </View>
                        <IconSymbol name="chevron.right" size={16} color="#666" />
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '900',
        fontStyle: 'italic',
        letterSpacing: 1,
    },
    content: {
        padding: 20,
    },
    sectionTitle: {
        color: '#888',
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 8,
        marginTop: 16,
        marginLeft: 4,
    },
    section: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    rowLabel: {
        fontSize: 16,
    },
    rowRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    rowValue: {
        color: '#888',
        fontSize: 14,
    },
    separator: {
        height: 1,
        marginLeft: 48, // Indent separator
    },
});
