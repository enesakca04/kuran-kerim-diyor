import Link from "next/link";
import { BookOpen, Clock3, Search, Sparkles } from "lucide-react";
import { getAllSurahs, getSurah } from "@/services/quranData";
import { AppShell } from "@/components/AppShell";
import { SurahList } from "@/components/SurahList";
import { ReadingProgress } from "@/components/ReadingProgress";

export default function Home() {
  const surahs = getAllSurahs();
  const openingSurah = getSurah(1);
  const featuredAyah = openingSurah?.ayahs[0];

  return (
    <AppShell>
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm sm:p-7">
          <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-primary">
            <span className="inline-flex items-center gap-2">
              <Sparkles size={18} />
              Bugunun okuması
            </span>
            <span className="rounded-full border border-border px-3 py-1 text-muted">
              {surahs.length} sure
            </span>
          </div>

          <div className="mt-8 text-center">
            <p className="arabic-text text-4xl leading-[2.1] text-text sm:text-5xl" dir="rtl">
              {featuredAyah?.arabic}
            </p>
            <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-secondary sm:text-lg">
              {featuredAyah?.translations.tr}
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/surah/1"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-bold text-white transition hover:opacity-90"
            >
              <BookOpen size={18} />
              Fatiha ile başla
            </Link>
            <Link
              href="/search"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-border bg-card px-5 text-sm font-bold text-text transition hover:bg-background"
            >
              <Search size={18} />
              Ayet ara
            </Link>
          </div>
        </div>

        <aside className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-bold text-text">
            <Clock3 size={20} className="text-primary" />
            Hızlı Bakış
          </h2>
          <div className="mt-5 grid gap-3">
            <ReadingProgress />
            <div className="rounded-md border border-border bg-background p-4">
              <p className="text-2xl font-bold text-text">6</p>
              <p className="text-sm font-semibold text-muted">Dil desteği hazırlandı</p>
            </div>
            <div className="rounded-md border border-border bg-background p-4">
              <p className="text-2xl font-bold text-text">114</p>
              <p className="text-sm font-semibold text-muted">Sure listesi yerel veriden okunuyor</p>
            </div>
            <div className="rounded-md border border-border bg-background p-4">
              <p className="text-2xl font-bold text-text">6236</p>
              <p className="text-sm font-semibold text-muted">Ayet arama altyapısı</p>
            </div>
          </div>
        </aside>
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-text">Sureler</h2>
          <Link href="/search" className="text-sm font-bold text-primary">
            Aramaya git
          </Link>
        </div>
        <SurahList surahs={surahs} />
      </section>
    </AppShell>
  );
}
