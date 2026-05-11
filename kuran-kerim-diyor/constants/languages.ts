/**
 * Supported Languages map
 */

export type AppLanguage = 'tr' | 'en' | 'ar' | 'de' | 'fr' | 'es';

export const LANGUAGES: Record<AppLanguage, { name: string; nativeName: string; appName: string }> = {
    tr: {
        name: 'Turkish',
        nativeName: 'Türkçe',
        appName: "Kur'an-ı Kerim Diyor"
    },
    en: {
        name: 'English',
        nativeName: 'English',
        appName: "The Holy Quran Says"
    },
    ar: {
        name: 'Arabic',
        nativeName: 'العربية',
        appName: "القرآن الكريم يقول"
    },
    de: {
        name: 'German',
        nativeName: 'Deutsch',
        appName: "Der Heilige Koran Sagt"
    },
    fr: {
        name: 'French',
        nativeName: 'Français',
        appName: "Le Saint Coran Dit"
    },
    es: {
        name: 'Spanish',
        nativeName: 'Español',
        appName: "El Sagrado Corán Dice"
    }
};
