import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kaynaklar",
  description: "Uygulamada kullanılan Kur'an metni, meal, ses kayıtları ve font kaynaklarının listesi.",
  alternates: { canonical: "/sources" },
};

import { Suspense } from "react";
import { SourcesDocument } from "@/components/SourcesDocument";

export default function Page() {
  return <Suspense><SourcesDocument /></Suspense>;
}
