"use client";

import { AppShell } from "@/components/AppShell";
import { DuaGeneratorClient } from "@/components/DuaGeneratorClient";
import { useTranslation } from "react-i18next";

export default function DuaGeneratorPage() {
  const { t } = useTranslation();

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-text">
            {t("dua.page_title", "AI Dua Asistanı")}
          </h1>
          <p className="mt-2 text-sm font-semibold text-muted">
            {t(
              "dua.page_subtitle",
              "Kalbinizden geçeni yazın; sistem İslami dua âdâbına, hamd ve salavat geleneğine uygun olarak samimi bir dua oluştursun."
            )}
          </p>
        </div>

        <DuaGeneratorClient />
      </div>
    </AppShell>
  );
}
