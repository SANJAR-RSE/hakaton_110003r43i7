import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { ProblemSolution } from '@/components/ProblemSolution';
import { HowItWorks } from '@/components/HowItWorks';
import { Benefits } from '@/components/Benefits';
import { ClinicsStrip } from '@/components/ClinicsStrip';
import { AIShowcase } from '@/components/AIShowcase';
import { BotShowcase } from '@/components/BotShowcase';
import { CTA } from '@/components/CTA';
import { Footer } from '@/components/Footer';

export default function LandingPage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <ProblemSolution />
        <HowItWorks />
        <Benefits />
        <ClinicsStrip />
        <AIShowcase />
        <BotShowcase />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
