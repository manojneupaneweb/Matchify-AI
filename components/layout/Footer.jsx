'use client';
import { Sparkles, GitFork, ExternalLink, Mail, ArrowUpRight } from 'lucide-react';

const FOOTER_LINKS = {
  Product: [
    { label: 'Resume Analyzer', href: '#analyzer' },
    { label: 'JD Generator', href: '#jd-generator' },
    { label: 'Cover Letter Builder', href: '#cover-letter' },
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' }
  ],
  Company: [
    { label: 'About Us', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Press', href: '#' }
  ],
  Support: [
    { label: 'Documentation', href: '#' },
    { label: 'Contact Us', href: '#' },
    { label: 'Status', href: '#' }
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/legal#privacy' },
    { label: 'Terms of Service', href: '/legal#terms' },
    { label: 'Cookie Policy', href: '/legal#cookies' },
    { label: 'GDPR', href: '/legal#gdpr' }
  ],
};

const SOCIAL = [
  { icon: GitFork, label: 'GitHub', href: '#' },
  { icon: ExternalLink, label: 'LinkedIn', href: '#' },
  { icon: Mail, label: 'Email', href: 'mailto:hello@matchifyai.com' },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-white/5 mt-24 flex flex-col items-center bg-black">
      {/* Top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px] bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

      <div className="w-full max-w-7xl mx-auto px-6 md:px-20 pt-16 pb-10">

        {/* Top: Brand + Newsletter */}
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 pb-12 border-b border-white/[0.06]">

          {/* Brand */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                <img src="/logo.png" alt="Matchify AI Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                Matchify AI
              </span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed mb-6 font-medium">
              Empowering job seekers with AI-driven resume analysis. Land your dream job with data-backed confidence.
            </p>

            {/* Newsletter */}
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Stay Updated</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 px-4 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl text-slate-300 placeholder-slate-500 focus:outline-none focus:border-violet-500/50 transition-colors"
                />
                <button className="px-4 py-2.5 bg-gradient-to-r from-violet-500 to-cyan-500 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity whitespace-nowrap">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          {/* Links grid */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-8">
            {Object.entries(FOOTER_LINKS).map(([section, links]) => (
              <div key={section}>
                <p className="text-xs font-semibold text-white uppercase tracking-wider mb-4">{section}</p>
                <ul className="space-y-2.5">
                  {links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1 group"
                      >
                        {link.label}
                        <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-0.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: copyright + socials */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8">
          <p className="text-sm text-gray-600 font-bold tracking-tight">
            &copy; {new Date().getFullYear()} Matchify AI, Inc. All rights reserved. Developed by <a href="https://manoj-neupane.com.np/" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 transition-colors">Manoj Neupane</a>
          </p>
          <div className="flex items-center gap-2">
            {SOCIAL.map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/8 transition-all"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
