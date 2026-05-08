import { doc, setDoc, increment } from 'firebase/firestore';
import { db } from './firebase';

export const updateGlobalFavCount = async (ayahId: string, diff: number) => {
    try {
        // favoriteId formati "1:1" (JS key), Firestore icin "1_1" formatina cevir
        const statId = ayahId.replace(':', '_');
        const statRef = doc(db, 'ayah_stats', statId);
        await setDoc(statRef, { count: increment(diff) }, { merge: true });
    } catch (e) {
        console.warn('Could not update global fav count', e);
    }
};

export const formatFavCount = (count: number): string => {
    if (count >= 1000000) return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'B';
    return count.toString();
};
