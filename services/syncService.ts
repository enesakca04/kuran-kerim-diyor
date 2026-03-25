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
