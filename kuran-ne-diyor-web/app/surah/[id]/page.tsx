import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { SurahReaderClient } from "@/components/SurahReaderClient";
import { getAllSurahs, getSurah } from "@/services/quranData";

export function generateStaticParams() {
  return getAllSurahs().map((surah) => ({ id: String(surah.number) }));
}

export default async function SurahPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const surahNumber = Number(id);
  const surah = getSurah(surahNumber);

  if (!surah) {
    notFound();
  }

  return (
    <AppShell>
      <SurahReaderClient surah={surah} />
    </AppShell>
  );
}
