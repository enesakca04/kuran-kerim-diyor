"use client";

import { useTranslation } from "react-i18next";

/**
 * Arama sayfasinin cevrilmis basligi.
 * Sayfanin kendisi metadata export edebilmek icin server component kaldi;
 * ceviri hook'u gerektiren bu parca ayri bir client bilesene alindi.
 */
export function SearchHeader() {
  const { t } = useTranslation();

  return (
    <div className="mb-5">
      <h1 className="text-3xl font-bold text-text">{t("tabs.search", "Ara")}</h1>
      <p className="mt-2 text-sm font-semibold text-muted">
        {t("search.desc", "Ayet metni, sure adı veya referans ile hızlı arama.")}
      </p>
    </div>
  );
}
