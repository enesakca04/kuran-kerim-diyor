import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hesap Silme",
  description: "Kur'an Ne Diyor? hesabınızı nasıl silebileceğinizi ve verilerinize ne olacağını öğrenin.",
  alternates: { canonical: "/account-deletion" },
};

import { Suspense } from "react";
import { LegalDocument } from "@/components/LegalDocument";
export default function Page() { return <Suspense><LegalDocument kind="deletion" /></Suspense>; }
