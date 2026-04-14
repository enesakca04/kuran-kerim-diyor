import { Stack } from 'expo-router';
import { useFonts, Amiri_400Regular, Amiri_700Bold } from '@expo-google-fonts/amiri';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { auth } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

import { useRouter, useSegments } from 'expo-router';
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
            
            // Yükle
            const { useUserStore } = await import('../store/userStore');
            await useUserStore.getState().loadFavorites();
            
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
        </Stack>
    );
}
