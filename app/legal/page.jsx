'use client';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Shield, Scale, Cookie, Globe } from 'lucide-react';

export default function LegalPage() {
  const sections = [
    {
      id: 'privacy',
      title: 'Privacy Policy',
      icon: Shield,
      content: `Your privacy is important to us. It is Matchify AI's policy to respect your privacy regarding any information we may collect from you across our website, and other sites we own and operate. We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. We also let you know why we’re collecting it and how it will be used.`
    },
    {
      id: 'terms',
      title: 'Terms of Service',
      icon: Scale,
      content: `By accessing our website, you are agreeing to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws. If you do not agree with any of these terms, you are prohibited from using or accessing this site. The materials contained in this website are protected by applicable copyright and trademark law.`
    },
    {
      id: 'cookies',
      title: 'Cookie Policy',
      icon: Cookie,
      content: `We use cookies to help improve your experience of our website. This cookie policy is part of Matchify AI's privacy policy. It covers the use of cookies between your device and our site. We also provide basic information on third-party services we may use, who may also use cookies as part of their service. This policy does not cover their cookies.`
    },
    {
      id: 'gdpr',
      title: 'GDPR Compliance',
      icon: Globe,
      content: `In accordance with the General Data Protection Regulation (GDPR), we are committed to protecting the privacy and personal data of our users within the European Economic Area (EEA). We ensure that personal data is processed lawfully, fairly, and in a transparent manner. You have the right to access, rectify, or erase your personal data, and to object to or restrict processing.`
    }
  ];

  return (
    <>
      <Navbar />
      <main className="relative pt-32 pb-20 bg-black min-h-screen">
        {/* Background orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 md:px-10">
          <div className="mb-12 text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 tracking-tight">
              Legal <span className="gradient-text">Information</span>
            </h1>
            <p className="text-slate-400 text-lg">Last updated: April 23, 2026</p>
          </div>
          
          <div className="space-y-12">
            {sections.map((section) => (
              <section 
                key={section.id} 
                id={section.id} 
                className="glass-panel p-8 md:p-10 bg-white/[0.02] border-white/5 scroll-mt-32"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center border border-violet-500/20">
                    <section.icon className="w-6 h-6 text-violet-400" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white">{section.title}</h2>
                </div>
                
                <div className="prose prose-invert max-w-none text-slate-400 leading-relaxed space-y-4">
                  <p>{section.content}</p>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                  </p>
                  <p>
                    Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                  </p>
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
