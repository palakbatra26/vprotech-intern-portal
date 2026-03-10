import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { About } from '@/components/landing/About';
import { Domains } from '@/components/landing/Domains';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Footer } from '@/components/landing/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <About />
      <Domains />
      <HowItWorks />
      <Footer />
    </div>
  );
};

export default Index;
