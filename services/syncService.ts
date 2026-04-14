import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { useUserStore } from '../store/userStore';

export const syncProgressToCloud = async () => {
    const { userId } = useUserStore.getState();
    if (!userId) return;

    const userRef = doc(db, 'users', userId);

    try {
        // AsyncStorage her zaman daha güvenilir: store initialize edilmeden önce
        // de doğru pozisyonu tutar. Store'daki varsayılan (1,1) değeri cloud'a
        // yazarak kaydedilmiş ilerlemenin silinmesini önlüyoruz.
        const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
        const storedProg = await AsyncStorage.getItem('@kuran_progress');

        const userSnap = await getDoc(userRef);
        const now = new Date().toISOString();

        if (storedProg) {
            // Yerel kayıt var: cloud'a yaz (local wins)
            const { surah, ayah } = JSON.parse(storedProg);

            if (!userSnap.exists()) {
                await setDoc(userRef, {
                    progress: { lastSurah: surah, lastAyah: ayah, updatedAt: now }
                });
                return;
            }

            await setDoc(userRef, {
                progress: { lastSurah: surah, lastAyah: ayah, updatedAt: now }
            }, { merge: true });

            // Store henüz senkronize olmadıysa güncelle
            const storeState = useUserStore.getState();
            if (storeState.currentSurah !== surah || storeState.currentAyah !== ayah) {
                storeState.setProgress(surah, ayah);
            }
        } else if (userSnap.exists()) {
            // Yerel kayıt yok → yeni cihaz veya ilk giriş → cloud'dan yükle
            const cloudData = userSnap.data();
            if (cloudData.progress?.lastSurah) {
                const { setProgress } = useUserStore.getState();
                setProgress(cloudData.progress.lastSurah, cloudData.progress.lastAyah);
                // AsyncStorage'a da yaz ki bir sonraki açılışta yerel kayıt olsun
                await AsyncStorage.setItem('@kuran_progress', JSON.stringify({
                    surah: cloudData.progress.lastSurah,
                    ayah: cloudData.progress.lastAyah
                }));
            }
        }
    } catch (e) {
        console.error('Error syncing progress:', e);
    }
};

import { Collection } from '../store/userStore';

export const syncFavoritesToCloud = async (favorites: Record<string, number>, collections?: Record<string, Collection>) => {
    const { userId } = useUserStore.getState();
    if (!userId) return;

    try {
        const userRef = doc(db, 'users', userId);
        const updateData: any = { favorites };
        if (collections) {
            updateData.collections = collections;
        }
        await setDoc(userRef, updateData, { merge: true });
    } catch (e) {
        console.error('Error syncing favorites to cloud:', e);
    }
};

export const mergeGuestFavoritesToCloud = async () => {
    const { userId, favorites, collections, setFavorites, setCollections } = useUserStore.getState();
    if (!userId) return;
    
    try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        
        let mergedFavorites = { ...favorites };
        let mergedCollections = { ...collections };
        let hasChanges = false;
        
        if (userSnap.exists()) {
            const cloudData = userSnap.data();
            if (cloudData.favorites) {
                const cloudFavorites = cloudData.favorites as Record<string, number>;
                for (const key of Object.keys(cloudFavorites)) {
                    if (!mergedFavorites[key] || cloudFavorites[key] > mergedFavorites[key]) {
                        mergedFavorites[key] = cloudFavorites[key];
                        hasChanges = true;
                    }
                }
            }
            if (cloudData.collections) {
                const cloudCols = cloudData.collections as Record<string, Collection>;
                for (const colId of Object.keys(cloudCols)) {
                    if (!mergedCollections[colId]) {
                        mergedCollections[colId] = cloudCols[colId];
                        hasChanges = true;
                    } else {
                        // Merge sub-ayahs
                        const mergedAyahs = { ...mergedCollections[colId].ayahs };
                        Object.keys(cloudCols[colId].ayahs).forEach(ayahId => {
                            if (!mergedAyahs[ayahId] || cloudCols[colId].ayahs[ayahId] > mergedAyahs[ayahId]) {
                                mergedAyahs[ayahId] = cloudCols[colId].ayahs[ayahId];
                                hasChanges = true;
                            }
                        });
                        mergedCollections[colId].ayahs = mergedAyahs;
                    }
                }
            }
        }
        
        // Push merged state to cloud
        await setDoc(userRef, { favorites: mergedFavorites, collections: mergedCollections }, { merge: true });
        
        // Update local if cloud had changes
        if (hasChanges) {
            setFavorites(mergedFavorites);
            setCollections(mergedCollections);
            const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
            await AsyncStorage.setItem('userFavorites', JSON.stringify(mergedFavorites));
            await AsyncStorage.setItem('userCollections', JSON.stringify(mergedCollections));
        }
    } catch (e) {
        console.error('Error auto-merging favorites and collections:', e);
    }
};
