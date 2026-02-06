import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSettings } from '@/context/SettingsContext';

export default function LoginScreen() {
    const { resolvedTheme, t } = useSettings();
    const themeColors = Colors[resolvedTheme];
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const { signIn, signUp } = useAuth();
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    console.log('LoginScreen RENDER. Loading:', loading);

    const handleAuth = async () => {
        setErrorMsg(''); // Clear previous errors
        if (!email || !password) {
            setErrorMsg('Please enter both email and password');
            return;
        }

        setLoading(true);
        try {
            if (isSignUp) {
                await signUp(email, password);
            } else {
                await signIn(email, password);
            }
        } catch (error: any) {
            console.error('LoginScreen caught error:', error);
            setErrorMsg(error.message || 'Authentication Failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <View style={styles.logoContainer}>
                    {/* Using a text logo for now, but could be an image */}
                    <Text style={[styles.logoText, { color: themeColors.text }]}>{t('homeTitle')}</Text>
                    <View style={styles.logoBadge}>
                        <Text style={styles.logoBadgeText}>{t('logoSubtitle')}</Text>
                    </View>
                </View>

                <View style={styles.formContainer}>
                    <Text style={[styles.title, { color: themeColors.text }]}>{isSignUp ? t('createAccount') : t('welcomeBack')}</Text>
                    <Text style={[styles.subtitle, { color: themeColors.icon }]}>
                        {isSignUp ? t('signUpSubtitle') : t('signInSubtitle')}
                    </Text>

                    <View style={[styles.inputContainer, { backgroundColor: themeColors.card, borderColor: resolvedTheme === 'dark' ? Colors.dark.border : Colors.light.border }]}>
                        <IconSymbol name="envelope.fill" size={20} color={themeColors.icon} style={styles.inputIcon} />
                        <TextInput
                            style={[styles.input, { color: themeColors.text }]}
                            placeholder={t('email')}
                            placeholderTextColor={themeColors.icon}
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={[styles.inputContainer, { backgroundColor: themeColors.card, borderColor: resolvedTheme === 'dark' ? Colors.dark.border : Colors.light.border }]}>
                        <IconSymbol name="lock.fill" size={20} color={themeColors.icon} style={styles.inputIcon} />
                        <TextInput
                            style={[styles.input, { color: themeColors.text }]}
                            placeholder={t('password')}
                            placeholderTextColor={themeColors.icon}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <Pressable
                        style={({ pressed }) => [
                            styles.button,
                            loading && styles.buttonDisabled,
                            pressed && { opacity: 0.8 }
                        ]}
                        onPress={handleAuth}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>
                            {loading ? (isSignUp ? t('creating') : t('startingEngine')) : (isSignUp ? t('createAccount') : t('signIn'))}
                        </Text>
                    </Pressable>

                    <Pressable
                        style={styles.forgotButton}
                        onPress={() => setIsSignUp(!isSignUp)}
                    >
                        <Text style={[styles.forgotText, { color: themeColors.icon }]}>
                            {isSignUp ? t('alreadyHaveAccount') : t('dontHaveAccount')}
                        </Text>
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.dark.background,
    },
    keyboardView: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
        maxWidth: 1000,
        width: '100%',
        alignSelf: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 48,
    },
    logoText: {
        fontSize: 48,
        fontWeight: '900',
        fontStyle: 'italic',
        color: '#FFF',
        letterSpacing: -2,
    },
    logoBadge: {
        backgroundColor: Colors.dark.primary,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        marginTop: -5,
    },
    logoBadgeText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    formContainer: {
        width: '100%',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.dark.icon,
        marginBottom: 32,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.dark.card,
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 56,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.dark.border,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        color: '#FFF',
        fontSize: 16,
    },
    button: {
        backgroundColor: Colors.dark.primary,
        height: 56,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 24,
        shadowColor: Colors.dark.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        fontStyle: 'italic',
    },
    forgotButton: {
        alignItems: 'center',
        marginTop: 16,
    },
    forgotText: {
        color: Colors.dark.icon,
        fontSize: 14,
    },
});
