import { DOMAINS, DOMAIN_ICONS, DOMAIN_COLORS } from '@/lib/constants';

export function Domains() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold md:text-4xl">Internship Domains</h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Choose your area of expertise. Each domain features a curated 30-question assessment designed by industry experts.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {DOMAINS.map((domain) => (
            <div
              key={domain}
              className="group relative overflow-hidden rounded-2xl border bg-card p-6 transition-all hover:shadow-xl hover:-translate-y-1"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${DOMAIN_COLORS[domain]} opacity-0 transition-opacity group-hover:opacity-5`} />
              <div className="text-4xl mb-4">{DOMAIN_ICONS[domain]}</div>
              <h3 className="text-lg font-semibold">{domain}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                30 MCQ questions • 30 minutes • Auto-evaluated
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
