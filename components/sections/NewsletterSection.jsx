'use client';
import { useState } from 'react';
import { Mail, Send, Sparkles, CheckCircle2 } from 'lucide-react';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus('loading');
    // Simulate API call
    setTimeout(() => setStatus('success'), 1500);
  };

  return (
    <section id="newsletter" className="relative py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-20 relative z-10">
        <div className="glass-panel p-1 border-white/5 overflow-hidden">
          <div className="relative p-10 md:p-16 bg-slate-950/40 rounded-[19px] overflow-hidden">
            
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/4 pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center mb-8 border border-white/10 shadow-lg">
                <Mail className="w-8 h-8 text-violet-400" />
              </div>
              
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Master Your <span className="gradient-text">Job Search</span>
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-lg mb-10 leading-relaxed">
                Join 15,000+ job seekers receiving weekly AI insights, resume tips, and interview strategies delivered straight to your inbox.
              </p>

              {status === 'success' ? (
                <div className="animate-fade-in flex flex-col items-center py-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 mb-4 border border-emerald-500/30">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">You're on the list!</h3>
                  <p className="text-slate-500">Check your inbox for our latest guide coming soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="w-full max-w-lg flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1 group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
                    <input 
                      type="email" 
                      required
                      placeholder="Enter your email address"
                      className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-white focus:outline-none focus:border-violet-500/50 focus:bg-white/10 transition-all"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={status === 'loading'}
                    className="btn-primary h-14 px-8 whitespace-nowrap"
                  >
                    {status === 'loading' ? (
                      <div className="spinner" />
                    ) : (
                      <>
                        Subscribe Now
                        <Send className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </button>
                </form>
              )}

              <p className="mt-8 text-xs text-slate-600 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                No spam. Only high-value career growth content. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
