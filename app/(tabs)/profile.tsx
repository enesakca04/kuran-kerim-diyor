import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Platform, Modal, FlatList } from 'react-native';
import { Colors } from '../../constants/colors';
import { auth } from '../../services/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInAnonymously, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithCredential, OAuthProvider } from 'firebase/auth';
import { useUserStore } from '../../store/userStore';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useTranslation } from 'react-i18next';
import { LANGUAGES, AppLanguage } from '../../constants/languages';

WebBrowser.maybeCompleteAuthSession();

import { ACHIEVEMENTS } from '../../constants/achievements';
import { useAchievements } from '../../hooks/useAchievements';
import { BookOpen, BookMarked, MessageSquare, Heart, TrendingUp, GitCommitHorizontal, Star, Settings, LogOut, UserX, ChevronRight, Globe, Check } from 'lucide-react-native';
import { useColorScheme, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const ICON_MAP: Record<string, any> = {
    BookOpen, BookMarked, MessageSquare, Heart, TrendingUp, GitCommitHorizontal, Star
};

export default function ProfileScreen() {
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
    const { userId, isAnonymous, email, setAuth, language, setLanguage } = useUserStore();
    const { earnedBadges } = useAchievements();
    const router = useRouter();
    const { t } = useTranslation();
    const [showLangModal, setShowLangModal] = useState(false);

    const clearDevStorage = async () => {
        await AsyncStorage.removeItem('hasOnboarded');
        router.replace('/onboarding');
    };

    const translateAuthError = (message: string) => {
        if (message.includes('operation-not-allowed')) return t('auth_errors.operation_not_allowed');
        if (message.includes('invalid-email') || message.includes('invalid-credential')) return t('auth_errors.invalid_credential');
        if (message.includes('user-not-found')) return t('auth_errors.user_not_found');
        if (message.includes('email-already-in-use')) return t('auth_errors.email_in_use');
        if (message.includes('weak-password')) return t('auth_errors.weak_password');
        if (message.includes('network-request-failed')) return t('auth_errors.network_failed');
        if (message.includes('ERR_REQUEST_CANCELED')) return t('auth_errors.cancelled');
        return t('auth_errors.generic', { message });
    };

    const [emailInput, setEmailInput] = useState('');
    const [passwordInput, setPasswordInput] = useState('');
    const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
        clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
        iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
        androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    });

    useEffect(() => {
        if (response?.type === 'success') {
            const { id_token } = response.params;
            const credential = GoogleAuthProvider.credential(id_token);
            setLoading(true);
            signInWithCredential(auth, credential)
                .catch(e => setError(translateAuthError(e.message)))
                .finally(() => setLoading(false));
        }
    }, [response]);

    // Auth State is now managed globally in _layout.tsx

    const handleLogin = async () => {
        setLoading(true);
        setError('');
        try {
            await signInWithEmailAndPassword(auth, emailInput, passwordInput);
        } catch (e: any) {
            setError(translateAuthError(e.message));
        }
        setLoading(false);
    };

    const handleRegister = async () => {
        if (passwordInput.length < 6) {
            setError(t('auth_errors.min_password'));
            return;
        }
        setLoading(true);
        setError('');
        try {
            await createUserWithEmailAndPassword(auth, emailInput, passwordInput);
        } catch (e: any) {
            setError(translateAuthError(e.message));
        }
        setLoading(false);
    };

    const handleGuestLogin = async () => {
        setLoading(true);
        setError('');
        try {
            await signInAnonymously(auth);
        } catch (e: any) {
            setError(translateAuthError(e.message));
        }
        setLoading(false);
    };

    const handleAppleLogin = async () => {
        try {
            const credential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
            });
            const { identityToken } = credential;
            if (identityToken) {
                setLoading(true);
                const provider = new OAuthProvider('apple.com');
                const authCredential = provider.credential({
                    idToken: identityToken,
                });
                await signInWithCredential(auth, authCredential);
            }
        } catch (e: any) {
            if (e.code !== 'ERR_REQUEST_CANCELED') {
                setError(e.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
    };

    if (userId) {
        return (
            <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={[styles.headerCard, { backgroundColor: theme.card }]}>
                    <View style={styles.avatarCircle}>
                        <Text style={styles.avatarText}>{isAnonymous ? 'M' : email?.[0]?.toUpperCase() || 'U'}</Text>
                    </View>
                    <Text style={[styles.title, { color: theme.text, marginBottom: 4 }]}>
                        {isAnonymous ? t('profile.guest') : email}
                    </Text>
                    <Text style={{ color: theme.secondary, marginBottom: 16 }}>
                        {t('profile.account_type')}: {isAnonymous ? t('profile.account_type_guest') : t('profile.account_type_registered')}
                    </Text>
                </View>

                <View style={[styles.menuCard, { backgroundColor: theme.card }]}>
                    <TouchableOpacity style={[styles.menuItem, { borderBottomColor: theme.border }]} onPress={() => router.push('/(tabs)/favorites')}>
                        <View style={styles.menuItemLeft}>
                            <Heart size={20} color={theme.primary} />
                            <Text style={[styles.menuItemText, { color: theme.text }]}>{t('profile.favorites')}</Text>
                        </View>
                        <ChevronRight size={20} color={theme.muted} />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.menuItem, { borderBottomColor: theme.border }]} onPress={() => router.push('/my-comments')}>
                        <View style={styles.menuItemLeft}>
                            <MessageSquare size={20} color={theme.primary} />
                            <Text style={[styles.menuItemText, { color: theme.text }]}>{t('profile.my_comments')}</Text>
                        </View>
                        <ChevronRight size={20} color={theme.muted} />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.menuItem, { borderBottomColor: theme.border }]} onPress={() => setShowLangModal(true)}>
                        <View style={styles.menuItemLeft}>
                            <Globe size={20} color={theme.primary} />
                            <Text style={[styles.menuItemText, { color: theme.text }]}>{t('profile.language')}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ color: theme.muted, marginRight: 6 }}>{LANGUAGES[language]?.nativeName}</Text>
                            <ChevronRight size={20} color={theme.muted} />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.menuItem, { borderBottomColor: theme.border }]} onPress={() => router.push('/settings')}>
                        <View style={styles.menuItemLeft}>
                            <Settings size={20} color={theme.primary} />
                            <Text style={[styles.menuItemText, { color: theme.text }]}>{t('profile.settings')}</Text>
                        </View>
                        <ChevronRight size={20} color={theme.muted} />
                    </TouchableOpacity>
                </View>

                <View style={[styles.menuCard, { backgroundColor: theme.card }]}>
                    <TouchableOpacity style={[styles.menuItem, { borderBottomColor: theme.border }]} onPress={handleLogout}>
                        <View style={styles.menuItemLeft}>
                            <LogOut size={20} color="#e74c3c" />
                            <Text style={[styles.menuItemText, { color: "#e74c3c" }]}>{t('profile.logout')}</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]}>
                        <View style={styles.menuItemLeft}>
                            <UserX size={20} color="#e74c3c" />
                            <Text style={[styles.menuItemText, { color: "#e74c3c" }]}>{t('profile.delete_account')}</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Dil Secici Modal */}
                <Modal visible={showLangModal} transparent animationType="fade" onRequestClose={() => setShowLangModal(false)}>
                    <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowLangModal(false)}>
                        <View style={[styles.langModal, { backgroundColor: theme.card }]}>
                            <Text style={[styles.langModalTitle, { color: theme.text }]}>{t('profile.language')}</Text>
                            {(Object.keys(LANGUAGES) as AppLanguage[]).map(lang => (
                                <TouchableOpacity
                                    key={lang}
                                    style={[styles.langItem, { borderBottomColor: theme.border }]}
                                    onPress={() => { setLanguage(lang); setShowLangModal(false); }}
                                >
                                    <Text style={{ color: theme.text, fontSize: 16 }}>{LANGUAGES[lang].nativeName}</Text>
                                    {language === lang && <Check size={20} color={theme.primary} />}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </TouchableOpacity>
                </Modal>
            </ScrollView>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.card}>
                <Text style={[styles.title, { color: theme.text }]}>
                    {authMode === 'login' ? t('profile.login') : t('profile.register')}
                </Text>

                {error ? <Text style={styles.error}>{error}</Text> : null}

                <TextInput
                    style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                    placeholder={t('profile.email')}
                    placeholderTextColor={theme.muted}
                    value={emailInput}
                    onChangeText={setEmailInput}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />

                <TextInput
                    style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                    placeholder={t('profile.password')}
                    placeholderTextColor={theme.muted}
                    value={passwordInput}
                    onChangeText={setPasswordInput}
                    secureTextEntry
                />

                {loading ? (
                    <ActivityIndicator size="large" color={theme.primary} style={{ marginVertical: 16 }} />
                ) : (
                    <>
                        {authMode === 'login' ? (
                            <>
                                <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={handleLogin}>
                                    <Text style={styles.buttonText}>{t('profile.login')}</Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity style={{marginTop: 16, alignItems: 'center'}} onPress={() => { setAuthMode('register'); setError(''); }}>
                                    <Text style={{color: theme.primary, fontWeight: 'bold'}}>{t('profile.no_account')}</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={handleRegister}>
                                    <Text style={styles.buttonText}>{t('profile.register')}</Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity style={{marginTop: 16, alignItems: 'center'}} onPress={() => { setAuthMode('login'); setError(''); }}>
                                    <Text style={{color: theme.primary, fontWeight: 'bold'}}>{t('profile.has_account')}</Text>
                                </TouchableOpacity>
                            </>
                        )}

                        <View style={styles.divider}>
                            <View style={[styles.line, { backgroundColor: theme.border }]} />
                            <Text style={{ marginHorizontal: 8, color: theme.muted }}>{t('profile.or')}</Text>
                            <View style={[styles.line, { backgroundColor: theme.border }]} />
                        </View>

                        <TouchableOpacity 
                            style={[styles.outlineButton, { borderColor: theme.primary, backgroundColor: 'transparent', marginBottom: 12 }]} 
                            onPress={() => promptAsync()}
                            disabled={!request}
                        >
                            <Text style={[styles.outlineButtonText, { color: theme.primary }]}>{t('profile.google_login')}</Text>
                        </TouchableOpacity>

                        {Platform.OS === 'ios' && (
                            <TouchableOpacity 
                                style={[styles.outlineButton, { borderColor: theme.text, backgroundColor: theme.card, marginBottom: 12 }]} 
                                onPress={handleAppleLogin}
                            >
                                <Text style={[styles.outlineButtonText, { color: theme.text }]}>{t('profile.apple_login')}</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity style={[styles.outlineButton, { borderColor: theme.primary }]} onPress={handleGuestLogin}>
                            <Text style={[styles.outlineButtonText, { color: theme.primary }]}>{t('profile.guest_continue')}</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    headerCard: {
        padding: 24,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 16,
        elevation: 2,
    },
    avatarCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#B69A73',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarText: {
        fontSize: 32,
        color: '#fff',
        fontWeight: 'bold',
    },
    menuCard: {
        borderRadius: 12,
        marginBottom: 16,
        elevation: 2,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuItemText: {
        fontSize: 16,
        marginLeft: 12,
        fontWeight: '500',
    },
    card: {
        backgroundColor: '#fff',
        padding: 24,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        fontSize: 16,
    },
    button: {
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    outlineButton: {
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
    },
    outlineButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
    },
    line: {
        flex: 1,
        height: 1,
    },
    error: {
        color: '#e74c3c',
        marginBottom: 16,
        textAlign: 'center',
    },
    badgesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginVertical: 16,
    },
    badge: {
        width: '30%',
        alignItems: 'center',
        margin: '1.5%',
        padding: 8,
        borderRadius: 8,
        borderWidth: 1,
    },
    badgeEarned: {
        borderColor: '#B69A73',
        backgroundColor: 'rgba(182, 154, 115, 0.1)',
    },
    badgeLocked: {
        borderColor: '#eee',
        backgroundColor: '#fafafa',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    langModal: {
        width: 280,
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
    },
    langModalTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        padding: 16,
        paddingBottom: 8,
    },
    langItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
});
