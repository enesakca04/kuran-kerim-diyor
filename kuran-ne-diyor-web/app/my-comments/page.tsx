import { AppShell } from "@/components/AppShell";
import { MyCommentsClient } from "@/components/MyCommentsClient";

export default function MyCommentsPage() {
  return (
    <AppShell>
      <div className="mb-5">
        <h1 className="text-3xl font-bold text-text">Yorumlarım</h1>
        <p className="mt-2 text-sm font-semibold text-muted">Yorumların ve moderasyon durumları.</p>
      </div>
      <MyCommentsClient />
    </AppShell>
  );
}
