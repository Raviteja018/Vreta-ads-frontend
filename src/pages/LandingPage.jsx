import React from 'react';
import HeroSection from '../../components/HeroSection';
import FeaturesSection from '../../components/FeaturesSection';
import HowItWorksSection from '../../components/HowItWorksSection';
import StatsSection from '../../components/StatsSection';
import CTASection from '../../components/CTASection';
import PublicAdsSection from '../../components/PublicAdsSection';

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <PublicAdsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <StatsSection />
      <CTASection />
    </>
  );
}

         