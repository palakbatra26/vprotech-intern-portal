import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative overflow-hidden py-24 md:py-36">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[600px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 text-center">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-6">
          <Zap className="h-4 w-4" />
          Now Hiring Interns — Apply Today
        </div>

        <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          Hire Smarter with{' '}
          <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
            Automated Internship
          </span>{' '}
          Screening
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
          VproTechDigital's AI-powered assessment portal streamlines campus recruitment.
          Students take domain-specific tests, and we identify top talent instantly.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button size="lg" className="h-12 px-8 text-base" asChild>
            <Link to="/signup">
              Apply Now <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="h-12 px-8 text-base" asChild>
            <Link to="/login">Login to Portal</Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-8 md:grid-cols-4">
          {[
            { label: 'Domains', value: '4+' },
            { label: 'MCQ Questions', value: '120+' },
            { label: 'Minutes / Test', value: '30' },
            { label: 'Anti-Cheat', value: 'AI' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-primary">{stat.value}</div>
              <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
