import { AppShell } from "@/components/AppShell";
import { SettingsClient } from "@/components/SettingsClient";

export default function SettingsPage() {
  return (
    <AppShell>
      <div className="mb-5">
        <h1 className="text-3xl font-bold text-text">Ayarlar</h1>
        <p className="mt-2 text-sm font-semibold text-muted">Dil ve okuma tercihleri.</p>
      </div>
      <SettingsClient />
    </AppShell>
  );
}
