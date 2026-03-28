import Hero from '../../components/Hero/Hero';
import FeatureSection from '../../components/landing/FeatureSection/FeatureSection';
import HowItWorksSection from '../../components/landing/HowItWorksSection/HowItWorksSection';
import StatsSection from '../../components/landing/StatsSection/StatsSection';

const Landing = () => {
  return (
    <main className="main-content">
      <Hero />
      <FeatureSection />
      <HowItWorksSection />
      <StatsSection />
    </main>
  );
};



export default Landing;
