import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { useUserStore } from '../store/userStore';

export const syncProgressToCloud = async () => {
    const { userId, currentSurah, currentAyah, setProgress } = useUserStore.getState();
    if (!userId) return;

    const userRef = doc(db, 'users', userId);

    try {
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            await setDoc(userRef, {
                progress: {
                    lastSurah: currentSurah,
                    lastAyah: currentAyah,
                    updatedAt: new Date().toISOString(),
                }
            });
            return;
        }

        const cloudData = userSnap.data();

        // Simple naive merge: highest ayah index wins across the whole Quran.
        const cloudPos = cloudData.progress ? (cloudData.progress.lastSurah * 1000 + cloudData.progress.lastAyah) : 0;
        const localPos = (currentSurah * 1000) + currentAyah;

        if (cloudPos > localPos) {
            // Cloud is ahead, update local
            setProgress(cloudData.progress.lastSurah, cloudData.progress.lastAyah);
        } else {
            // Local is ahead (or equal), update cloud
            await setDoc(userRef, {
                progress: {
                    lastSurah: currentSurah,
                    lastAyah: currentAyah,
                    updatedAt: new Date().toISOString(),
                }
            }, { merge: true });
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
