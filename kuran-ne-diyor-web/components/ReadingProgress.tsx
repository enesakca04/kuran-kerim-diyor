"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";
import { useAppInit } from "@/hooks/useAppInit";
import { useUserStore } from "@/store/userStore";
import { getAyahDisplay } from "@/services/ayahUtils";

export function ReadingProgress() {
  useAppInit();
  const currentSurah = useUserStore((state) => state.currentSurah);
  const currentAyah = useUserStore((state) => state.currentAyah);
  const display = getAyahDisplay(`${currentSurah}_${currentAyah}`);

  return (
    <Link
      href={`/surah/${currentSurah}#ayah-${currentAyah}`}
      className="rounded-md border border-border bg-background p-4 transition hover:bg-card"
    >
      <p className="flex items-center gap-2 text-sm font-bold text-primary">
        <BookOpen size={16} />
        Kaldığın yer
      </p>
      <p className="mt-2 text-sm font-semibold text-text">
        {display.surah?.name.tr || "Fatiha"} · Ayet {currentAyah}
      </p>
    </Link>
  );
}
