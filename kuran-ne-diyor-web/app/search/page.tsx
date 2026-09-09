import type { Metadata } from "next";

import { AppShell } from "@/components/AppShell";
import { SearchClient } from "./SearchClient";
import { SearchHeader } from "./SearchHeader";

export const metadata: Metadata = {
  title: "Kur'an'da Ara — Âyet, Sûre ve Referans Arama",
  description:
    "Kur'an-ı Kerim'in 6236 âyeti içinde arama yapın. Âyet metni, sûre adı veya " +
    "\"Bakara 153\" gibi referanslarla saniyeler içinde sonuca ulaşın.",
  alternates: { canonical: "/search" },
};

export default function SearchPage() {
  return (
    <AppShell>
      <SearchHeader />
      <SearchClient />
    </AppShell>
  );
}
