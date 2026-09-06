"use client";

import { AppShell } from "@/components/AppShell";
import { NamesClient } from "@/components/NamesClient";
import { useTranslation } from "react-i18next";

export default function NamesPage() {
  const { t } = useTranslation();

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-text">
            {t("names.page_title", "Esma-ül Hüsna (Allah'ın 99 İsmi)")}
          </h1>
          <p className="mt-2 text-sm font-semibold text-muted">
            {t(
              "names.page_subtitle",
              "Yüce Allah'ın güzel isimleri, Arapça yazılışları, okunuşları ve detaylı tefekkür anlamları."
            )}
          </p>
        </div>

        <NamesClient />
      </div>
    </AppShell>
  );
}
