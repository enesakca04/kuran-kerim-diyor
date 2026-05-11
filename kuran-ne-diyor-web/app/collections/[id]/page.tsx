import { AppShell } from "@/components/AppShell";
import { CollectionDetailClient } from "@/components/CollectionDetailClient";

export default async function CollectionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <AppShell>
      <CollectionDetailClient id={id} />
    </AppShell>
  );
}
