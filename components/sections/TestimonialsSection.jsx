'use client';
import { Star, Quote } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: 'Sarah Johnson',
    role: 'Software Engineer',
    company: 'Google',
    avatar: 'SJ',
    rating: 5,
    text: 'My interview callback rate increased by 300% after using Matchify AI. The keyword gap analysis alone was worth it — I added 12 missing terms and got a Google call the next week.',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    name: 'Michael Chen',
    role: 'Product Manager',
    company: 'Amazon',
    avatar: 'MC',
    rating: 5,
    text: 'I was applying for months with no responses. Matchify AI showed my resume only matched 42% of PM job descriptions. After tailoring it using the suggestions, I landed at Amazon in 3 weeks.',
    gradient: 'from-cyan-500 to-blue-600',
  },
  {
    name: 'Emily Rodriguez',
    role: 'Data Scientist',
    company: 'Meta',
    avatar: 'ER',
    rating: 5,
    text: 'The ATS optimization feature is a game-changer. I didn\'t realize my resume was being filtered out automatically. Matchify AI fixed that and I got my Meta offer within a month.',
    gradient: 'from-pink-500 to-rose-600',
  },
  {
    name: 'David Park',
    role: 'UX Designer',
    company: 'Stripe',
    avatar: 'DP',
    rating: 5,
    text: 'Clean UI, incredibly fast, and the results are spot-on. I compared my resume to 10 different design roles and iterated until I hit above 85% on all of them. Landed Stripe!',
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    name: 'Priya Sharma',
    role: 'ML Engineer',
    company: 'Microsoft',
    avatar: 'PS',
    rating: 5,
    text: 'I was skeptical AI could really help, but the skills radar chart showed me exactly where I was weak for ML roles. Took the suggested courses, updated my resume, got the job.',
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    name: 'James Wilson',
    role: 'Marketing Director',
    company: 'Netflix',
    avatar: 'JW',
    rating: 5,
    text: 'Even for marketing roles, Matchify AI nailed it. It identified I wasn\'t mentioning specific metrics in my achievements. Added numbers to every bullet — completely transformed my resume.',
    gradient: 'from-indigo-500 to-violet-600',
  },
];

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-28 md:py-40 flex flex-col items-center bg-black">
      <div className="w-full max-w-7xl mx-auto px-6 md:px-20">

        {/* Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="badge mb-4">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> Success Stories
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            They Got the Job.{' '}
            <span className="gradient-text">So Can You.</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-lg">
            Join thousands of job seekers who've transformed their career trajectory with Matchify AI.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                className="glass-panel p-7 bg-white/[0.01] border-white/5 group hover:-translate-y-2 transition-all duration-500 relative overflow-hidden animate-fade-in-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
              {/* Quote icon */}
              <Quote className="absolute top-5 right-5 w-8 h-8 text-white/4 group-hover:text-white/8 transition-colors" />

              {/* Stars */}
              <div className="flex items-center gap-0.5 mb-4">
                {[...Array(t.rating)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Text */}
              <p className="text-gray-400 text-sm leading-relaxed mb-6 italic font-medium opacity-90">"{t.text}"</p>

              {/* Author */}
              <div className="flex items-center gap-3 mt-auto pt-4 border-t border-white/[0.06]">
                <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-lg`}>
                  {t.avatar}
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role} <span className="text-slate-600">at</span> <span className="text-slate-400">{t.company}</span></p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
