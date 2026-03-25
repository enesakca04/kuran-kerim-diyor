import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserStore } from '../store/userStore';
import { syncProgressToCloud } from '../services/syncService';
import { getSurah } from '../services/quranData';

const PROGRESS_KEY = '@kuran_progress';
const COMPLETED_KEY = '@kuran_completed';

export function useProgress() {
    const { currentSurah, currentAyah, completedSurahs, setProgress: setStoreProgress, setCompletedSurahs, addCompletedSurah } = useUserStore();

    // Load progress and completed on mount
    useEffect(() => {
        const loadData = async () => {
            try {
                const storedProg = await AsyncStorage.getItem(PROGRESS_KEY);
                if (storedProg) {
                    const { surah, ayah } = JSON.parse(storedProg);
                    setStoreProgress(surah, ayah);
                }
                const storedComp = await AsyncStorage.getItem(COMPLETED_KEY);
                if (storedComp) {
                    setCompletedSurahs(JSON.parse(storedComp) || []);
                }
            } catch (e) {
                console.error('Failed to load data', e);
            }
        };
        loadData();
    }, []);

    // Helper wrapper to handle progress + completion check
    const setProgress = (surah: number, ayah: number) => {
        setStoreProgress(surah, ayah);

        const surahData = getSurah(surah);
        if (surahData && ayah === surahData.ayahs.length) {
            addCompletedSurah(surah);
        }
    };

    // Save progress when it changes
    useEffect(() => {
        const saveProgress = async () => {
            try {
                const data = JSON.stringify({ surah: currentSurah, ayah: currentAyah });
                await AsyncStorage.setItem(PROGRESS_KEY, data);
                await AsyncStorage.setItem(COMPLETED_KEY, JSON.stringify(completedSurahs));

                // Background sync to cloud if logged in
                syncProgressToCloud().catch(console.error);
            } catch (e) {
                console.error('Failed to save progress', e);
            }
        };
        if (currentSurah && currentAyah) {
            saveProgress();
        }
    }, [currentSurah, currentAyah, completedSurahs]);

    return { currentSurah, currentAyah, setProgress, completedSurahs };
}
