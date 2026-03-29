import Hero from '../../components/Hero/Hero';
import FeatureSection from '../../components/landing/FeatureSection/FeatureSection';
import HowItWorksSection from '../../components/landing/HowItWorksSection/HowItWorksSection';
import WhyChooseUsSection from '../../components/landing/WhyChooseUsSection/WhyChooseUsSection';
import ComparisonSection from '../../components/landing/ComparisonSection/ComparisonSection';
import StatsSection from '../../components/landing/StatsSection/StatsSection';
import TestimonialsSection from '../../components/landing/TestimonialsSection/TestimonialsSection';
import CTASection from '../../components/landing/CTASection/CTASection';
import Footer from '../../components/layout/Footer/Footer';

const Landing = () => {
  return (
    <>
      <main className="main-content">
        <Hero />
        <FeatureSection />
        <HowItWorksSection />
        <WhyChooseUsSection />
        <ComparisonSection />
        <StatsSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
};






export default Landing;
