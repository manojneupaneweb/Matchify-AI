'use client';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    q: 'How accurate is the AI match score?',
    a: 'Our AI achieves 98% accuracy in identifying relevant skills and keywords compared to the job description. It uses advanced NLP to understand context, not just exact keyword matching.',
  },
  {
    q: 'What file formats does Matchify AI support?',
    a: 'Currently we support PDF files for resume uploads. PDF is the industry standard and preserves formatting — we recommend saving your resume as a PDF before uploading.',
  },
  {
    q: 'Is my resume data stored or shared?',
    a: 'No. Your resume and job description are processed in real-time and never stored on our servers. We take privacy seriously — your data is used solely for the current analysis.',
  },
  {
    q: 'How is this different from other resume tools?',
    a: 'Unlike static templates or generic tips, Matchify AI compares your specific resume against a specific job description using the latest Gemini AI. You get tailored, actionable feedback — not generic advice.',
  },
  {
    q: 'Can I use this for multiple job applications?',
    a: 'Absolutely. We recommend running a fresh analysis for each job you apply to since job descriptions vary widely. Pro users get unlimited analyses for exactly this use case.',
  },
  {
    q: 'What does the ATS optimization score mean?',
    a: 'ATS (Applicant Tracking System) is software used by recruiters to automatically filter resumes. Our ATS score tells you the likelihood your resume passes these filters before a human even sees it.',
  },
  {
    q: 'How long does the analysis take?',
    a: 'Most analyses complete in under 30 seconds. Occasionally, during peak usage, it may take up to 60 seconds. You\'ll see a progress indicator while we work.',
  },
  {
    q: 'Do I need to create an account to use it?',
    a: 'No account is required to get started on the free plan. You can analyze your first resume immediately. Creating an account lets you save your history and access Pro features.',
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section id="faq" className="py-28 md:py-40 flex flex-col items-center bg-black">
      <div className="w-full max-w-4xl mx-auto px-6 md:px-20">

        {/* Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="badge mb-4">FAQ</div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Frequently Asked{' '}
            <span className="gradient-text">Questions</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-lg">
            Everything you need to know before you get started.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className={`glass-panel bg-white/[0.01] border-white/5 overflow-hidden transition-all duration-500 animate-fade-in-up ${isOpen ? 'border-violet-500/30' : ''}`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <button
                  className="w-full flex items-center justify-between px-6 py-5 text-left gap-4 group"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                >
                  <span className={`font-semibold text-base transition-colors ${isOpen ? 'text-violet-300' : 'text-white group-hover:text-violet-200'}`}>
                    {faq.q}
                  </span>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${isOpen ? 'bg-violet-500/20 rotate-180' : 'bg-white/5'}`}>
                    <ChevronDown className={`w-4 h-4 transition-colors ${isOpen ? 'text-violet-400' : 'text-slate-400'}`} />
                  </div>
                </button>
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <p className="px-6 pb-5 text-slate-400 text-sm leading-relaxed border-t border-white/[0.04] pt-4">
                    {faq.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Still have Q? */}
        <div className="mt-10 text-center">
          <p className="text-slate-400 text-sm">
            Still have questions?{' '}
            <a href="mailto:hello@matchifyai.com" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
              Email our team →
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
