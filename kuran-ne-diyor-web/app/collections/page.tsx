import { AppShell } from "@/components/AppShell";
import { CollectionsClient } from "@/components/CollectionsClient";

export default function CollectionsPage() {
  return (
    <AppShell>
      <div className="mb-5">
        <h1 className="text-3xl font-bold text-text">Koleksiyonlar</h1>
        <p className="mt-2 text-sm font-semibold text-muted">Ayetleri konu veya okuma planına göre gruplandır.</p>
      </div>
      <CollectionsClient />
    </AppShell>
  );
}
