import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kullanım Şartları",
  description: "Kur'an Ne Diyor? uygulamasını ve web sitesini kullanırken geçerli olan şartlar ve koşullar.",
  alternates: { canonical: "/terms" },
};

import { Suspense } from "react";
import { LegalDocument } from "@/components/LegalDocument";
export default function Page() { return <Suspense><LegalDocument kind="terms" /></Suspense>; }
