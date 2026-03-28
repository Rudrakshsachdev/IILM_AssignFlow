import StatsSection from '../../components/landing/StatsSection/StatsSection';
import TestimonialsSection from '../../components/landing/TestimonialsSection/TestimonialsSection';
import CTASection from '../../components/landing/CTASection/CTASection';
import Hero from '../../components/Hero/Hero';
import FeatureSection from '../../components/landing/FeatureSection/FeatureSection';
import HowItWorksSection from '../../components/landing/HowItWorksSection/HowItWorksSection';

const Landing = () => {
  return (
    <main className="main-content">
      <Hero />
      <FeatureSection />
      <HowItWorksSection />
      <StatsSection />
      <TestimonialsSection />
      <CTASection />
    </main>
  );
};





export default Landing;
