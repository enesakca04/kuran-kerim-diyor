import { AppShell } from "@/components/AppShell";
import { SearchClient } from "./SearchClient";

export default function SearchPage() {
  return (
    <AppShell>
      <div className="mb-5">
        <h1 className="text-3xl font-bold text-text">Ara</h1>
        <p className="mt-2 text-sm font-semibold text-muted">Ayet metni, sure adı veya referans ile hızlı arama.</p>
      </div>
      <SearchClient />
    </AppShell>
  );
}
