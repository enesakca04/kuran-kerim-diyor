import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { Colors } from '../../constants/colors';
import { auth } from '../../services/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInAnonymously, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithCredential, OAuthProvider } from 'firebase/auth';
import { useUserStore } from '../../store/userStore';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as AppleAuthentication from 'expo-apple-authentication';

WebBrowser.maybeCompleteAuthSession();

import { ACHIEVEMENTS } from '../../constants/achievements';
import { useAchievements } from '../../hooks/useAchievements';
import { BookOpen, BookMarked, MessageSquare, Heart, TrendingUp, GitCommitHorizontal, Star } from 'lucide-react-native';
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

    const clearDevStorage = async () => {
        await AsyncStorage.removeItem('hasOnboarded');
        router.replace('/onboarding');
    };

    const translateAuthError = (message: string) => {
        if (message.includes('operation-not-allowed')) return 'Bu giriş yöntemi henüz aktif edilmemiş. (Firebase Console > Auth kısmından E-posta/Şifre girişini açın)';
        if (message.includes('invalid-email') || message.includes('invalid-credential')) return 'E-posta veya şifre hatalı.';
        if (message.includes('user-not-found')) return 'Böyle bir kullanıcı bulunamadı.';
        if (message.includes('email-already-in-use')) return 'Bu e-posta adresi ile zaten kayıt olunmuş.';
        if (message.includes('weak-password')) return 'Şifreniz çok zayıf (En az 6 karakter olmalı).';
        if (message.includes('network-request-failed')) return 'İnternet bağlantınızı kontrol edip tekrar deneyin.';
        if (message.includes('ERR_REQUEST_CANCELED')) return 'Kullanıcı işlemi iptal etti.';
        return 'Bir hata oluştu: ' + message;
    };

    const [emailInput, setEmailInput] = useState('');
    const [passwordInput, setPasswordInput] = useState('');
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

    // Listen to Auth State
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setAuth(user.uid, user.isAnonymous, user.displayName, user.email);
                const { syncProgressToCloud } = await import('../../services/syncService');
                await syncProgressToCloud();
            } else {
                setAuth(null, false, null, null);
            }
        });
        return unsubscribe;
    }, []);

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
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={[styles.card, { backgroundColor: theme.card }]}>
                    <Text style={[styles.title, { color: theme.text }]}>Profiliniz</Text>
                    <Text style={{ color: theme.secondary, marginBottom: 8, textAlign: 'center' }}>
                        Durum: {isAnonymous ? 'Misafir Kullanıcı' : 'Kayıtlı Kullanıcı'}
                    </Text>
                    {!isAnonymous && <Text style={{ color: theme.text, marginBottom: 24, textAlign: 'center' }}>Email: {email}</Text>}

                    <Text style={[styles.title, { color: theme.text, marginTop: 16, fontSize: 18 }]}>Kazanılan Rozetler</Text>
                    <View style={styles.badgesContainer}>
                        {ACHIEVEMENTS.map(badge => {
                            const IconComponent = ICON_MAP[badge.icon] || Star;
                            const hasEarned = earnedBadges.includes(badge.id);

                            return (
                                <View key={badge.id} style={[styles.badge, hasEarned ? styles.badgeEarned : styles.badgeLocked]}>
                                    <IconComponent size={32} color={hasEarned ? theme.primary : '#ccc'} />
                                    <Text style={{ fontSize: 12, marginTop: 4, color: hasEarned ? theme.text : '#ccc', textAlign: 'center' }}>
                                        {badge.title}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>

                    <Text style={[styles.title, { color: theme.text, marginTop: 16, fontSize: 18 }]}>Ayarlar (Dil)</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 8 }}>
                        <TouchableOpacity onPress={() => setLanguage('tr')} style={[styles.button, { flex: 1, margin: 4, backgroundColor: language === 'tr' ? theme.primary : theme.muted }]}><Text style={{ color: '#fff', textAlign: 'center' }}>Türkçe</Text></TouchableOpacity>
                        <TouchableOpacity onPress={() => setLanguage('en')} style={[styles.button, { flex: 1, margin: 4, backgroundColor: language === 'en' ? theme.primary : theme.muted }]}><Text style={{ color: '#fff', textAlign: 'center' }}>English</Text></TouchableOpacity>
                        <TouchableOpacity onPress={() => setLanguage('ar')} style={[styles.button, { flex: 1, margin: 4, backgroundColor: language === 'ar' ? theme.primary : theme.muted }]}><Text style={{ color: '#fff', textAlign: 'center' }}>العربية</Text></TouchableOpacity>
                    </View>

                    <TouchableOpacity style={[styles.button, { backgroundColor: '#e74c3c', marginTop: 16 }]} onPress={handleLogout}>
                        <Text style={styles.buttonText}>Çıkış Yap</Text>
                    </TouchableOpacity>

                    {__DEV__ && (
                        <TouchableOpacity style={[styles.button, { backgroundColor: '#000', marginTop: 16, borderWidth: 1, borderColor: '#333' }]} onPress={clearDevStorage}>
                            <Text style={[styles.buttonText, { color: '#fff' }]}>[DEV] Onboarding'i Sıfırla</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.card}>
                <Text style={[styles.title, { color: theme.text }]}>Giriş Yap</Text>

                {error ? <Text style={styles.error}>{error}</Text> : null}

                <TextInput
                    style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                    placeholder="E-posta"
                    placeholderTextColor={theme.muted}
                    value={emailInput}
                    onChangeText={setEmailInput}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />

                <TextInput
                    style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                    placeholder="Şifre"
                    placeholderTextColor={theme.muted}
                    value={passwordInput}
                    onChangeText={setPasswordInput}
                    secureTextEntry
                />

                {loading ? (
                    <ActivityIndicator size="large" color={theme.primary} style={{ marginVertical: 16 }} />
                ) : (
                    <>
                        <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={handleLogin}>
                            <Text style={styles.buttonText}>Giriş Yap</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.button, { backgroundColor: theme.secondary, marginTop: 12 }]} onPress={handleRegister}>
                            <Text style={styles.buttonText}>Kayıt Ol</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[styles.outlineButton, { borderColor: theme.primary, marginTop: 12, backgroundColor: 'transparent' }]} 
                            onPress={() => promptAsync()}
                            disabled={!request}
                        >
                            <Text style={[styles.outlineButtonText, { color: theme.primary }]}>Google ile Giriş Yap</Text>
                        </TouchableOpacity>

                        <View style={styles.divider}>
                            <View style={[styles.line, { backgroundColor: theme.border }]} />
                            <Text style={{ marginHorizontal: 8, color: theme.muted }}>VEYA</Text>
                            <View style={[styles.line, { backgroundColor: theme.border }]} />
                        </View>

                        <TouchableOpacity style={[styles.outlineButton, { borderColor: theme.primary }]} onPress={handleGuestLogin}>
                            <Text style={[styles.outlineButtonText, { color: theme.primary }]}>Misafir Olarak Devam Et</Text>
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
        justifyContent: 'center',
        padding: 24,
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
    }
});
