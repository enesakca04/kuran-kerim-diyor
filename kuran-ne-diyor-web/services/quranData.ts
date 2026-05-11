import quranDataJson from "@/data/quran.json";
import type { AppLanguage, Ayah, Surah, SurahSummary } from "@/types/quran";

export const quranData = quranDataJson as Surah[];

export const getAllSurahs = (): SurahSummary[] =>
  quranData.map((surah) => ({
    number: surah.number,
    name: surah.name,
    englishNameTranslation: surah.englishNameTranslation,
    revelationType: surah.revelationType,
    ayahsCount: surah.ayahs.length,
  }));

export const getSurah = (surahNumber: number): Surah | undefined =>
  quranData.find((surah) => surah.number === surahNumber);

export const getAyah = (surahNumber: number, ayahNumber: number): Ayah | undefined =>
  getSurah(surahNumber)?.ayahs.find((ayah) => ayah.number === ayahNumber);

const charMap: Record<string, string> = {
  ş: "s",
  ç: "c",
  ğ: "g",
  ı: "i",
  ö: "o",
  ü: "u",
  â: "a",
  î: "i",
  û: "u",
};

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^\x00-\x7F]/g, (char) => charMap[char] || char)
    .replace(/[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/g, "")
    .replace(/^(adh|ash|al|an|ar|ad|at|az|aal)[-\s]*/i, "")
    .replace(/[-'\s]/g, "")
    .replace(/sh/g, "s")
    .replace(/kh/g, "h")
    .replace(/gh/g, "g")
    .replace(/th/g, "t")
    .replace(/dh/g, "d")
    .replace(/(.)\1+/g, "$1");

const parseReference = (query: string) => {
  const trimmed = query.trim();
  const numeric = trimmed.match(/^(\d{1,3})[:.\-\s]+(\d{1,3})$/);

  if (numeric) {
    return {
      surahNumber: Number(numeric[1]),
      ayahNumber: Number(numeric[2]),
    };
  }

  const tailDigits = trimmed.match(/(\d{1,3})$/);
  if (!tailDigits) return null;

  const ayahNumber = Number(tailDigits[1]);
  const namePart = trimmed.substring(0, tailDigits.index).replace(/[:.\-]+$/, "").trim();
  if (!namePart) return null;

  const normalizedName = normalize(namePart);
  const surah = quranData.find((item) =>
    [item.name.tr, item.name.en, item.englishNameTranslation].some((candidate) => {
      const normalizedCandidate = normalize(candidate);
      return normalizedCandidate === normalizedName || normalizedCandidate.startsWith(normalizedName);
    }),
  );

  return surah ? { surahNumber: surah.number, ayahNumber } : null;
};

const getLocalizedSurahName = (surah: Surah, language: AppLanguage) => {
  if (language === "ar" || language === "en" || language === "tr") {
    return surah.name[language];
  }

  return surah.name.tr;
};

export const searchAyahs = (query: string, language: AppLanguage = "tr") => {
  const cleaned = query.trim();
  if (cleaned.length < 3) return [];

  const reference = parseReference(cleaned);
  if (reference) {
    const surah = getSurah(reference.surahNumber);
    const ayah = surah?.ayahs.find((item) => item.number === reference.ayahNumber);
    return surah && ayah ? [{ surahName: getLocalizedSurahName(surah, language), surahNumber: surah.number, ayah }] : [];
  }

  const lowerQuery = cleaned.toLowerCase();
  return quranData.flatMap((surah) =>
    surah.ayahs
      .filter((ayah) => ayah.arabic.includes(cleaned) || ayah.translations[language]?.toLowerCase().includes(lowerQuery))
      .slice(0, 12)
      .map((ayah) => ({
        surahName: getLocalizedSurahName(surah, language),
        surahNumber: surah.number,
        ayah,
      })),
  );
};
