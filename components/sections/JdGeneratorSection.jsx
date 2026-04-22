'use client';
import { useState } from 'react';
import { 
  Sparkles, 
  Briefcase, 
  Copy, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  ArrowRight,
  AlertCircle
} from 'lucide-react';

export default function JdGeneratorSection() {
  const [idea, setIdea] = useState('');
  const [tone, setTone] = useState('professional');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const tones = [
    { id: 'professional', label: 'Professional' },
    { id: 'startup', label: 'Startup & Edgy' },
    { id: 'corporate', label: 'Strict Corporate' },
  ];

  const handleGenerate = async () => {
    if (!idea.trim()) return;
    
    setLoading(true);
    setError('');
    setCopied(false);
    
    try {
      const response = await fetch('/api/generate-jd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea, tone }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate JD');
      }
      
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    
    // Format the JSON result into nice text for clipboard
    const textToCopy = `
Job Title: ${result.title}

Job Summary:
${result.summary}

Key Responsibilities:
${result.responsibilities?.map(r => '- ' + r).join('\n')}

Required Skills:
${result.skills?.map(s => '- ' + s).join('\n')}

Preferred Qualifications:
${result.qualifications?.map(q => '- ' + q).join('\n')}

Experience Requirements:
${result.experience}
    `.trim();

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    
    const textToDownload = `
Job Title: ${result.title}

Job Summary:
${result.summary}

Key Responsibilities:
${result.responsibilities?.map(r => '- ' + r).join('\n')}

Required Skills:
${result.skills?.map(s => '- ' + s).join('\n')}

Preferred Qualifications:
${result.qualifications?.map(q => '- ' + q).join('\n')}

Experience Requirements:
${result.experience}
    `.trim();

    const blob = new Blob([textToDownload], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.title.replace(/\s+/g, '-').toLowerCase()}-job-description.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <section id="jd-generator" className="py-16 md:py-24 relative flex flex-col items-center bg-black">
      <div className="w-full max-w-7xl mx-auto px-6 md:px-20">
        
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="badge mb-4">
            <Sparkles className="w-3 h-3 text-violet-400" /> AI Job Description Generator
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Turn a short idea into a{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-cyan-400">
              Professional JD
            </span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-lg">
            Turn your brief requirements into an ATS-ready job description in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Input Panel */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="glass-panel p-6 md:p-8 bg-white/[0.01] border-white/5 shadow-2xl h-full flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg flex-shrink-0">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Role Details</h3>
                  <p className="text-xs text-slate-400">Describe the job in a few words</p>
                </div>
              </div>

              <div className="flex-1 flex flex-col gap-6">
                <div className="space-y-3">
                  <label htmlFor="jd-idea" className="text-sm font-medium text-slate-300">
                    Your Idea
                  </label>
                  <textarea
                    id="jd-idea"
                    placeholder="e.g. .NET developer with 5 years experience in microservices"
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    rows={5}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all resize-none"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-300">
                    Tone of Voice
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {tones.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setTone(t.id)}
                        className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                          tone === t.id
                            ? 'bg-violet-500/10 text-violet-400 border border-violet-500/30'
                            : 'bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10 hover:text-slate-300'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2.5 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-300">{error}</p>
                  </div>
                )}
              </div>

              <div className="mt-8">
                <button
                  onClick={handleGenerate}
                  disabled={loading || !idea.trim()}
                  className="w-full relative group overflow-hidden rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-purple-600 transition-transform duration-300 group-hover:scale-105" />
                  <div className="relative px-6 py-4 flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span className="font-semibold text-white">Generating...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 text-white" />
                        <span className="font-semibold text-white">Generate Job Description</span>
                        <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Output Panel */}
          <div className="lg:col-span-7 flex flex-col">
            <div className={`glass-panel p-6 md:p-8 border-white/5 shadow-2xl h-full flex flex-col transition-all duration-500 ${
              result ? 'bg-white/[0.02]' : 'bg-black/20 border-dashed border-white/10 items-center justify-center text-center'
            }`}>
              
              {!result && !loading && (
                <div className="max-w-xs mx-auto space-y-4 py-12">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                    <FileTextGhost className="w-8 h-8 text-slate-600" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-300">Awaiting Input</h3>
                  <p className="text-sm text-slate-500">
                    Provide a brief description of the role on the left, and we'll craft a complete job posting here.
                  </p>
                </div>
              )}

              {loading && !result && (
                <div className="max-w-xs mx-auto space-y-6 py-12 text-center w-full">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-violet-500/10 flex items-center justify-center mb-4 animate-pulse">
                    <Sparkles className="w-8 h-8 text-violet-400" />
                  </div>
                  <div className="space-y-3 w-full">
                    <div className="h-4 bg-white/5 rounded w-3/4 mx-auto animate-pulse" />
                    <div className="h-3 bg-white/5 rounded w-full animate-pulse" />
                    <div className="h-3 bg-white/5 rounded w-5/6 mx-auto animate-pulse" />
                    <div className="h-3 bg-white/5 rounded w-4/6 mx-auto animate-pulse" />
                  </div>
                  <p className="text-sm font-medium text-violet-400/80 animate-pulse">Crafting description...</p>
                </div>
              )}

              {result && (
                <div className="flex flex-col h-full animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">{result.title}</h3>
                      <div className="flex items-center gap-2 text-xs font-medium">
                        <span className="px-2 py-1 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20">
                          {tone.charAt(0).toUpperCase() + tone.slice(1)} Tone
                        </span>
                        <span className="px-2 py-1 rounded bg-white/5 text-slate-400 border border-white/10">
                          ATS Optimized
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-300 transition-colors"
                      >
                        {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                      <button
                        onClick={handleDownload}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-300 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Save .txt
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto pr-2 space-y-8 custom-scrollbar">
                    
                    {/* Summary */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-violet-400 uppercase tracking-wider">Job Summary</h4>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        {result.summary}
                      </p>
                    </div>

                    {/* Experience */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-violet-400 uppercase tracking-wider">Experience Required</h4>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        {result.experience}
                      </p>
                    </div>

                    {/* Responsibilities */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-violet-400 uppercase tracking-wider">Key Responsibilities</h4>
                      <ul className="space-y-2">
                        {result.responsibilities?.map((item, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-violet-500/50 mt-1.5 flex-shrink-0" />
                            <span className="leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Skills */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-violet-400 uppercase tracking-wider">Required Skills</h4>
                        <ul className="space-y-2">
                          {result.skills?.map((item, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                              <CheckCircle2 className="w-4 h-4 text-violet-500/70 mt-0.5 flex-shrink-0" />
                              <span className="leading-relaxed">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Qualifications */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-violet-400 uppercase tracking-wider">Preferred Qualifications</h4>
                        <ul className="space-y-2">
                          {result.qualifications?.map((item, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                              <Sparkles className="w-4 h-4 text-violet-500/70 mt-0.5 flex-shrink-0" />
                              <span className="leading-relaxed">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}

// Simple ghost icon for empty state
function FileTextGhost({ className }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <line x1="10" y1="9" x2="8" y2="9"/>
    </svg>
  );
}
