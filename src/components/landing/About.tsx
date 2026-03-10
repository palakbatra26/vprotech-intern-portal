import { Building2, Users, Award, Globe } from 'lucide-react';

const features = [
  { icon: Building2, title: 'Industry Leaders', desc: 'A cutting-edge software company specializing in digital transformation and IT solutions.' },
  { icon: Users, title: 'Campus Recruitment', desc: 'We visit colleges and seminars to discover and nurture emerging tech talent.' },
  { icon: Award, title: 'Merit-Based Selection', desc: 'Automated assessments ensure fair, unbiased evaluation of every candidate.' },
  { icon: Globe, title: 'Pan-India Presence', desc: 'Partnering with colleges across India to build the next generation of tech professionals.' },
];

export function About() {
  return (
    <section className="py-20 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold md:text-4xl">About VproTechDigital</h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            We are a technology-driven company committed to empowering businesses through innovative software solutions.
            Our internship program helps students launch their careers in tech.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl border bg-background p-6 transition-shadow hover:shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <f.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
