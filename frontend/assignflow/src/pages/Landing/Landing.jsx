import Hero from '../../components/Hero/Hero';
import FeatureSection from '../../components/landing/FeatureSection/FeatureSection';
import HowItWorksSection from '../../components/landing/HowItWorksSection/HowItWorksSection';

const Landing = () => {
  return (
    <main className="main-content">
      <Hero />
      <FeatureSection />
      <HowItWorksSection />
    </main>
  );
};


export default Landing;
