import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import { I18nManager } from 'react-native';

import tr from '../locales/tr.json';
import en from '../locales/en.json';
import ar from '../locales/ar.json';
import de from '../locales/de.json';
import fr from '../locales/fr.json';
import es from '../locales/es.json';

export type AppLanguage = 'tr' | 'en' | 'ar' | 'de' | 'fr' | 'es';

const SUPPORTED_LANGUAGES: AppLanguage[] = ['tr', 'en', 'ar', 'de', 'fr', 'es'];

/**
 * Cihaz dilini desteklenen dillere eşler.
 * Örn: "tr-TR" → "tr", "ar-SA" → "ar", "zh-CN" → "en" (fallback)
 */
export function detectDeviceLanguage(): AppLanguage {
    const locales = getLocales();
    const deviceLang = locales[0]?.languageCode ?? 'tr';
    const matched = SUPPORTED_LANGUAGES.find(lang => lang === deviceLang);
    return matched ?? 'tr';
}

/**
 * RTL dillerini (Arapça) etkinleştirir/devre dışı bırakır.
 * Not: RTL değişikliği uygulamanın yeniden başlatılmasını gerektirebilir.
 */
export function applyRTL(language: AppLanguage) {
    const isRTL = language === 'ar';
    if (I18nManager.isRTL !== isRTL) {
        I18nManager.allowRTL(isRTL);
        I18nManager.forceRTL(isRTL);
    }
}

i18n
    .use(initReactI18next)
    .init({
        resources: {
            tr: { translation: tr },
            en: { translation: en },
            ar: { translation: ar },
            de: { translation: de },
            fr: { translation: fr },
            es: { translation: es },
        },
        lng: detectDeviceLanguage(),
        fallbackLng: 'tr',
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
