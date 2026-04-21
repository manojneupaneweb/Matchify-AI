'use client';
import { useHome } from '@/hooks/useHome';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SectionDivider from '@/components/layout/SectionDivider';

import HeroSection from '@/components/sections/HeroSection';
import IntegrationsSection from '@/components/sections/IntegrationsSection';
import HowItWorksSection from '@/components/sections/HowItWorksSection';
import FeaturesSection from '@/components/sections/FeaturesSection';
import StatsSection from '@/components/sections/StatsSection';
import SecuritySection from '@/components/sections/SecuritySection';
import AnalyzerSection from '@/components/sections/AnalyzerSection';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import PricingSection from '@/components/sections/PricingSection';
import FAQSection from '@/components/sections/FAQSection';
import NewsletterSection from '@/components/sections/NewsletterSection';
import CTASection from '@/components/sections/CTASection';
import AuthModal from '@/components/auth/AuthModal';

export default function MainContent() {
  const {
    file, setFile,
    jd, setJd,
    loading,
    results,
    progress,
    stats,
    activeSection,
    user,
    showAuthModal,
    setShowAuthModal,
    handleAnalyze,
    handleReset,
    scrollToAnalyzer,
  } = useHome();

  return (
    <>
      <Navbar activeSection={activeSection} />

      <main className="relative flex flex-col items-center w-full">
        {/* ... existing sections ... */}
        {/* (I'll use the proper section sequence I just set up) */}
        <HeroSection onScrollToAnalyzer={scrollToAnalyzer} liveStats={stats} />
        
        <SectionDivider />
        <AnalyzerSection
          file={file}         setFile={setFile}
          jd={jd}             setJd={setJd}
          loading={loading}
          results={results}
          progress={progress}
          onAnalyze={handleAnalyze}
          onReset={handleReset}
        />

        <SectionDivider />
        <IntegrationsSection />

        <SectionDivider />
        <HowItWorksSection />
        
        <SectionDivider />
        <FeaturesSection />

        <SectionDivider />
        <StatsSection />
        
        <SectionDivider />
        <SecuritySection />
        
        <SectionDivider />
        <TestimonialsSection />

        <SectionDivider />
        <PricingSection />

        <SectionDivider />
        <FAQSection />

        <SectionDivider />
        <NewsletterSection />

        <SectionDivider />
        <CTASection onScrollToAnalyzer={scrollToAnalyzer} />
      </main>

      <Footer />

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </>
  );
}
