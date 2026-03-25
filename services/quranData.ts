/**
 * Quran Data Service
 * Reads and formats surahs and ayahs from the local JSON data.
 */

import quranDataJson from '../assets/quran/data.json';
import { AppLanguage } from '../constants/languages';

export interface Ayah {
    number: number;
    globalNumber: number;
    arabic: string;
    translations: Record<AppLanguage, string>;
}

export interface Surah {
    number: number;
    name: {
        ar: string;
        tr: string;
        en: string;
    };
    englishNameTranslation: string;
    revelationType: string;
    ayahs: Ayah[];
}

export const quranData = quranDataJson as Surah[];

export const getAllSurahs = () => {
    return quranData.map(surah => ({
        number: surah.number,
        name: surah.name,
        englishNameTranslation: surah.englishNameTranslation,
        revelationType: surah.revelationType,
        ayahsCount: surah.ayahs.length,
    }));
};

export const getSurah = (surahNumber: number): Surah | undefined => {
    return quranData.find(s => s.number === surahNumber);
};

export const getAyah = (surahNumber: number, ayahNumber: number): Ayah | undefined => {
    const surah = getSurah(surahNumber);
    if (!surah) return undefined;
    return surah.ayahs.find(a => a.number === ayahNumber);
};

export const searchAyahs = (query: string, language: AppLanguage) => {
    const results: { surahName: string; surahNumber: number; ayah: Ayah }[] = [];
    const lowerQuery = query.toLowerCase();

    quranData.forEach(surah => {
        surah.ayahs.forEach(ayah => {
            if (ayah.translations[language]?.toLowerCase().includes(lowerQuery) || ayah.arabic.includes(query)) {
                // Simple fallback for surah name display
                const sName = language === 'ar' ? surah.name.ar : (language === 'en' ? surah.name.en : surah.name.tr);
                results.push({
                    surahName: sName || surah.name.ar,
                    surahNumber: surah.number,
                    ayah,
                });
            }
        });
    });

    return results;
};
