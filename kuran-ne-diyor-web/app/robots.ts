import type { MetadataRoute } from "next";
import { absoluteUrl, SITE_URL } from "@/lib/site";

/**
 * Origin tarafinda uretilen robots.txt.
 *
 * NOT: Alan adi Cloudflare arkasinda ve Cloudflare kendi yonetilen robots.txt
 * dosyasini servis ediyor. Bu dosyanin canliya yansimasi icin Cloudflare
 * panelinden yonetilen robots.txt kapatilmali; aksi halde edge, origin'i
 * golgelemeye devam eder.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Giris gerektiren, kisiye ozel veya arama sonucu ureten yollar
        // indekslenmemeli: tarama butcesini tuketir, deger uretmez.
        disallow: [
          "/admin",
          "/admin/",
          "/profile",
          "/favorites",
          "/collections",
          "/my-comments",
          "/settings",
          "/login",
          "/register",
          "/onboarding",
          "/search?",
        ],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: SITE_URL,
  };
}
