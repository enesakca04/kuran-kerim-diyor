"use client";

import { useAppInit } from "@/hooks/useAppInit";
import { useUserStore } from "@/store/userStore";
import type { AppLanguage } from "@/types/quran";

const languages: { value: AppLanguage; label: string }[] = [
  { value: "tr", label: "Türkçe" },
  { value: "en", label: "English" },
  { value: "ar", label: "العربية" },
  { value: "de", label: "Deutsch" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
];

export function SettingsClient() {
  useAppInit();
  const language = useUserStore((state) => state.language);
  const setLanguage = useUserStore((state) => state.setLanguage);
  const showArabicTranslation = useUserStore((state) => state.showArabicTranslation);
  const setShowArabicTranslation = useUserStore((state) => state.setShowArabicTranslation);
  const arabicTranslationLang = useUserStore((state) => state.arabicTranslationLang);
  const setArabicTranslationLang = useUserStore((state) => state.setArabicTranslationLang);

  return (
    <div className="grid gap-5">
      <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-text">Dil</h1>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {languages.map((item) => (
            <button
              key={item.value}
              onClick={() => setLanguage(item.value)}
              className={`h-11 rounded-md border px-3 text-sm font-bold ${
                language === item.value ? "border-primary bg-primary text-white" : "border-border text-secondary hover:bg-background"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>
      <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-text">Arapça kullanıcı ayarı</h2>
        <label className="mt-4 flex items-center justify-between gap-4 rounded-md border border-border bg-background p-4 text-sm font-bold text-text">
          Meal göster
          <input
            type="checkbox"
            checked={showArabicTranslation}
            onChange={(event) => setShowArabicTranslation(event.target.checked)}
            className="h-5 w-5 accent-[var(--primary)]"
          />
        </label>
        <select
          value={arabicTranslationLang}
          onChange={(event) => setArabicTranslationLang(event.target.value as AppLanguage)}
          className="mt-4 h-11 rounded-md border border-border bg-background px-3 text-sm font-bold text-text"
        >
          {languages.filter((item) => item.value !== "ar").map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </section>
    </div>
  );
}
