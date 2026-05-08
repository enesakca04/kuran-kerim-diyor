import { Stack } from 'expo-router';
import { useFonts, Amiri_400Regular, Amiri_700Bold } from '@expo-google-fonts/amiri';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { auth } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
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

        // Listen to Auth State Globally
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            const { useUserStore } = await import('../store/userStore');
            if (user) {
                useUserStore.getState().setAuth(user.uid, user.isAnonymous, user.displayName, user.email);
                const { syncProgressToCloud, mergeGuestFavoritesToCloud } = await import('../services/syncService');
                syncProgressToCloud();
                mergeGuestFavoritesToCloud();
            } else {
                useUserStore.getState().setAuth(null, false, null, null);
            }
        });

        return () => unsubscribe();
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
