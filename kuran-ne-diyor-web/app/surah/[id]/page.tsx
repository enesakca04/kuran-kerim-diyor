import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { SurahReaderClient } from "@/components/SurahReaderClient";
import { getAllSurahs, getSurah } from "@/services/quranData";

export function generateStaticParams() {
  return getAllSurahs().map((surah) => ({ id: String(surah.number) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const surah = getSurah(Number(id));

  if (!surah) {
    return { title: "Sûre bulunamadı", robots: { index: false, follow: false } };
  }

  const revelation = surah.revelationType === "Meccan" ? "Mekkî" : "Medenî";
  const title = `${surah.name.tr} Sûresi — Türkçe Meali ve Arapça Metni`;
  const description =
    `${surah.name.tr} sûresi (${surah.name.ar}), Kur'an-ı Kerim'in ${surah.number}. sûresidir ve ` +
    `${surah.ayahs.length} âyetten oluşur. ${revelation} bir sûredir. ` +
    `Tüm âyetleri Türkçe meali, Arapça metni ve sesli okuyuşuyla okuyun.`;

  return {
    title,
    description,
    alternates: { canonical: `/surah/${surah.number}` },
    openGraph: {
      type: "article",
      title,
      description,
      url: `/surah/${surah.number}`,
    },
    twitter: { card: "summary", title, description },
  };
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
