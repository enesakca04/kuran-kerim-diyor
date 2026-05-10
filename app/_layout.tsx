import { Stack } from 'expo-router';
import { useFonts, Amiri_400Regular, Amiri_700Bold } from '@expo-google-fonts/amiri';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import '../services/i18n'; // i18n'i uygulama baslarken baslat
import i18n, { applyRTL, detectDeviceLanguage } from '../services/i18n';

import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [loaded, error] = useFonts({
        Amiri_400Regular,
        Amiri_700Bold,
    });
    const router = useRouter();

    useEffect(() => {
        if (!loaded && !error) return;

        const checkFirstLaunch = async () => {
            const hasOnboarded = await AsyncStorage.getItem('hasOnboarded');
            if (hasOnboarded !== 'true') {
                router.replace('/onboarding');
            }
            
            // Favorileri ve dil tercihini yukle
            const { useUserStore } = await import('../store/userStore');
            await useUserStore.getState().loadFavorites();

            // Kayitli dil tercihi varsa i18n'e uygula, yoksa cihaz dilini kullan
            const storedLang = await AsyncStorage.getItem('@app_language');
            const language = storedLang ?? detectDeviceLanguage();
            i18n.changeLanguage(language);
            applyRTL(language as any);
            // Store'u da guncelle
            useUserStore.getState().setLanguage(language as any);
            
            SplashScreen.hideAsync();
        };

        checkFirstLaunch();

        checkFirstLaunch();

        // Listen to Auth State Globally using our API
        const checkAuth = async () => {
            const { useUserStore } = await import('../store/userStore');
            const { default: apiClient } = await import('../services/apiClient');
            const SecureStore = await import('expo-secure-store');
            
            try {
                const token = await SecureStore.getItemAsync('userToken');
                if (token) {
                    // Fetch real user info from backend
                    const res = await apiClient.get('/auth/me');
                    const { user } = res.data;
                    useUserStore.getState().setAuth(user.id, user.isGuest, user.email, user.email);
                } else {
                    useUserStore.getState().setAuth(null, false, null, null);
                }
            } catch (e) {
                // If token is invalid or expired, clear it
                await SecureStore.deleteItemAsync('userToken');
                useUserStore.getState().setAuth(null, false, null, null);
            }
        };

        checkAuth();
    }, [loaded, error]);

    if (!loaded && !error) {
        return null;
    }

    return (
        <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            <Stack.Screen name="settings" options={{ headerShown: false }} />
        </Stack>
    );
}
