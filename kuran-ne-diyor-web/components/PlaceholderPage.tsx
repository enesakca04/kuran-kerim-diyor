export function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <p className="text-sm font-bold text-primary">Hazırlanıyor</p>
      <h1 className="mt-2 text-3xl font-bold text-text">{title}</h1>
      <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-muted">{description}</p>
    </section>
  );
}
