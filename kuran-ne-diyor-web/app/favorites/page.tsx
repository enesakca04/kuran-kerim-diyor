import { AppShell } from "@/components/AppShell";
import { FavoritesClient } from "@/components/FavoritesClient";

export default function FavoritesPage() {
  return (
    <AppShell>
      <div className="mb-5">
        <h1 className="text-3xl font-bold text-text">Favoriler</h1>
        <p className="mt-2 text-sm font-semibold text-muted">Kaydettiğin ayetler yerel olarak ve giriş yaptıysan backend ile senkron tutulur.</p>
      </div>
      <FavoritesClient />
    </AppShell>
  );
}
