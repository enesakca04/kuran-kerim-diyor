import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

const countCache: Record<string, number> = {};

export const useAyahStats = (ayahId: string | null) => {
    // If it's already in cache, load it immediately. Otherwise default to 0 during fetch.
    const [count, setCount] = useState<number>(ayahId ? (countCache[ayahId] || 0) : 0);

    useEffect(() => {
        if (!ayahId) return;

        // Reset state or use existing cache while pulling
        setCount(countCache[ayahId] || 0);

        let isMounted = true;
        const ref = doc(db, 'ayah_stats', ayahId);

        getDoc(ref).then(snap => {
            if (snap.exists() && isMounted) {
                const data = snap.data();
                if (typeof data.count === 'number') {
                    countCache[ayahId] = data.count;
                    setCount(data.count);
                }
            }
        }).catch(err => {
            // Silently fail if no internet
            console.log('Failed fetching ayah count:', err.message);
        });

        return () => { isMounted = false; };
    }, [ayahId]);

    // Expose a helper to optimistically update the counter when user themselves favorites it
    const incrementOptimistic = (diff: number) => {
        if (!ayahId) return;
        const newVal = Math.max(0, count + diff); // Don't let it go below 0
        setCount(newVal);
        countCache[ayahId] = newVal;
    };

    return { count, incrementOptimistic };
};
