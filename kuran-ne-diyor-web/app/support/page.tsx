import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Destek",
  description: "Kur'an Ne Diyor? hakkında sorularınız, hata bildirimleri ve iletişim kanalları.",
  alternates: { canonical: "/support" },
};

import { Suspense } from "react";
import { SupportDocument } from "@/components/SupportDocument";
export default function Page() { return <Suspense><SupportDocument /></Suspense>; }
