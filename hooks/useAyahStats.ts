import { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';

interface AyahStats {
    ayahId: string;
    favoriteCount: number;
    commentCount: number;
    likeCount: number;
}

export function useAyahStats(surahNo: number, ayahNo: number) {
    const [stats, setStats] = useState<AyahStats | null>(null);
    const [loading, setLoading] = useState(true);

    const ayahId = `${surahNo}_${ayahNo}`;

    const fetchStats = async () => {
        try {
            const response = await apiClient.get(`/stats/${ayahId}`);
            setStats(response.data);
        } catch (error) {
            console.error("Error fetching ayah stats:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [ayahId]);

    // UI için her iki sayıyı da ayrı ayrı döndürüyoruz
    const commentCount = stats?.commentCount || 0;
    const favoriteCount = stats?.favoriteCount || 0;

    return { 
        stats, 
        loading, 
        refresh: fetchStats,
        commentCount,
        favoriteCount,
        incrementOptimistic: (delta: number = 1) => setStats(prev => prev ? { ...prev, favoriteCount: Math.max(0, prev.favoriteCount + delta) } : null)
    };
}
