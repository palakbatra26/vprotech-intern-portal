import { UserPlus, ClipboardList, Timer, Trophy } from 'lucide-react';

const steps = [
  { icon: UserPlus, title: 'Sign Up', desc: 'Create your account with your college details and personal information.' },
  { icon: ClipboardList, title: 'Choose Domain', desc: 'Select your preferred internship domain from 4 specializations.' },
  { icon: Timer, title: 'Take Assessment', desc: '30 MCQ questions in 30 minutes. Anti-cheat monitored, fullscreen enforced.' },
  { icon: Trophy, title: 'Get Results', desc: 'Instant scoring and qualification status. Shortlisted candidates are contacted.' },
];

export function HowItWorks() {
  return (
    <section className="py-20 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold md:text-4xl">How It Works</h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            A seamless four-step process from registration to results.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-4">
          {steps.map((step, i) => (
            <div key={step.title} className="relative text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                {i + 1}
              </div>
              <div className="mt-4 flex justify-center">
                <step.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
