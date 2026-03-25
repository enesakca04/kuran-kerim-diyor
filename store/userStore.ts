import { create } from 'zustand';
import { AppLanguage } from '../constants/languages';

interface UserState {
    language: AppLanguage;
    currentSurah: number;
    currentAyah: number;
    completedSurahs: number[];

    // Auth state
    userId: string | null;
    isAnonymous: boolean;
    displayName: string | null;
    email: string | null;

    setLanguage: (lang: AppLanguage) => void;
    setProgress: (surah: number, ayah: number) => void;
    addCompletedSurah: (surah: number) => void;
    setCompletedSurahs: (surahs: number[]) => void;
    setAuth: (userId: string | null, isAnonymous: boolean, displayName: string | null, email: string | null) => void;
}

export const useUserStore = create<UserState>((set) => ({
    language: 'tr', // Default
    currentSurah: 1,
    currentAyah: 1,
    completedSurahs: [],

    userId: null,
    isAnonymous: false,
    displayName: null,
    email: null,

    setLanguage: (lang) => set({ language: lang }),
    setProgress: (surah, ayah) => set({ currentSurah: surah, currentAyah: ayah }),
    addCompletedSurah: (surah) => set((state) => {
        const list = state.completedSurahs || [];
        if (!list.includes(surah)) {
            return { completedSurahs: [...list, surah] };
        }
        return state;
    }),
    setCompletedSurahs: (surahs) => set({ completedSurahs: surahs }),
    setAuth: (userId, isAnonymous, displayName, email) => set({ userId, isAnonymous, displayName, email }),
}));
