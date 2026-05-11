import { getAyah, getSurah } from "@/services/quranData";

export const ayahIdOf = (surahNumber: number, ayahNumber: number) => `${surahNumber}_${ayahNumber}`;

export const parseAyahId = (ayahId: string) => {
  const [surahNumber, ayahNumber] = ayahId.split("_").map(Number);
  return { surahNumber, ayahNumber };
};

export const getAyahDisplay = (ayahId: string) => {
  const { surahNumber, ayahNumber } = parseAyahId(ayahId);
  const surah = getSurah(surahNumber);
  const ayah = getAyah(surahNumber, ayahNumber);

  return {
    surahNumber,
    ayahNumber,
    surah,
    ayah,
  };
};
