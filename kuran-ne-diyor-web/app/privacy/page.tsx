import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gizlilik Politikası",
  description: "Kur'an Ne Diyor? uygulamasının kişisel verileri nasıl işlediği, sakladığı ve koruduğu hakkında bilgi.",
  alternates: { canonical: "/privacy" },
};

import { Suspense } from "react";
import { LegalDocument } from "@/components/LegalDocument";
export default function Page() { return <Suspense><LegalDocument kind="privacy" /></Suspense>; }
