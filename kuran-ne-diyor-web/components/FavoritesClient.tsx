"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useAppInit } from "@/hooks/useAppInit";
import { useUserStore } from "@/store/userStore";
import { getAyahDisplay } from "@/services/ayahUtils";

export function FavoritesClient() {
  useAppInit();
  const favorites = useUserStore((state) => state.favorites);
  const items = Object.keys(favorites).map(getAyahDisplay).filter((item) => item.ayah && item.surah);

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-center shadow-sm">
        <Heart className="mx-auto text-primary" size={30} />
        <h1 className="mt-3 text-2xl font-bold text-text">Favori yok</h1>
        <p className="mt-2 text-sm font-semibold text-muted">Ayet kartlarındaki kalp ikonuyla favori ekleyebilirsin.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {items.map(({ surah, ayah, surahNumber, ayahNumber }) => (
        <Link
          key={`${surahNumber}_${ayahNumber}`}
          href={`/surah/${surahNumber}#ayah-${ayahNumber}`}
          className="rounded-lg border border-border bg-card p-5 shadow-sm transition hover:bg-background"
        >
          <p className="text-sm font-bold text-primary">
            {surah!.name.tr} · Ayet {ayahNumber}
          </p>
          <p className="arabic-text mt-3 line-clamp-2 text-right text-2xl font-normal leading-loose text-text" dir="rtl">
            {ayah!.arabic}
          </p>
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-secondary">{ayah!.translations.tr}</p>
        </Link>
      ))}
    </div>
  );
}
