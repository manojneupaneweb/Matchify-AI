'use client';
import { useState, Suspense, lazy } from 'react';
import { 
  Sparkles, 
  FileText, 
  Upload,
  Copy, 
  Download, 
  CheckCircle2, 
  ArrowRight,
  AlertCircle,
  XCircle,
  Clipboard
} from 'lucide-react';

const DropZone = lazy(() => import('@/components/DropZone'));

const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse rounded-2xl bg-white/5 ${className}`} />
);

export default function CoverLetterSection() {
  const [file, setFile] = useState(null);
  const [jd, setJd] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!file || !jd.trim()) return;
    
    setLoading(true);
    setError('');
    setCopied(false);
    
    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('jobDescription', jd);

      const response = await fetch('/api/generate-cover-letter', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate cover letter');
      }
      
      setResult(data.coverLetter);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([result], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cover-letter.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <section id="cover-letter" className="py-16 md:py-24 relative flex flex-col items-center bg-black">
      <div className="w-full max-w-7xl mx-auto px-6 md:px-20">
        
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="badge mb-4">
            <Sparkles className="w-3 h-3 text-violet-400" /> AI Cover Letter Generator
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Write the Perfect{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-cyan-400">
              Cover Letter
            </span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-lg">
            Upload your resume and the job description to generate a highly tailored, professional cover letter in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Input Panel */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="glass-panel p-6 md:p-8 bg-white/[0.01] border-white/5 shadow-2xl h-full flex flex-col">
              
              <div className="flex-1 flex flex-col gap-6">
                
                {/* Resume Upload */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg flex-shrink-0">
                      <Upload className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white">Your Resume</h3>
                      <p className="text-xs text-slate-500">PDF format · Max 5MB</p>
                    </div>
                  </div>

                  <Suspense fallback={<Skeleton className="h-[140px]" />}>
                    <DropZone onFileSelect={setFile} file={file} />
                  </Suspense>

                  {file && (
                    <div className="flex items-center gap-2.5 px-4 py-3 bg-emerald-500/8 border border-emerald-500/20 rounded-xl animate-fade-in">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span className="text-sm text-emerald-300 truncate">{file.name}</span>
                      <button
                        onClick={() => setFile(null)}
                        className="ml-auto text-slate-500 hover:text-slate-300 transition-colors"
                        title="Remove file"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Job Description */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg flex-shrink-0">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 flex justify-between items-center pr-2">
                      <div>
                        <h3 className="text-base font-semibold text-white">Job Description</h3>
                        <p className="text-xs text-slate-500">Paste the full job posting</p>
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            const text = await navigator.clipboard.readText();
                            setJd(text);
                          } catch (err) {}
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
                      >
                        <Clipboard className="w-3.5 h-3.5" />
                        Paste
                      </button>
                    </div>
                  </div>

                  <textarea
                    id="cl-jd"
                    placeholder="Paste the job description here..."
                    value={jd}
                    onChange={(e) => setJd(e.target.value)}
                    rows={5}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all resize-none min-h-[140px]"
                  />
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
                  disabled={loading || !file || !jd.trim()}
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
                        <span className="font-semibold text-white">Generate Cover Letter</span>
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
                    <FileText className="w-8 h-8 text-slate-600" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-300">Ready to Write</h3>
                  <p className="text-sm text-slate-500">
                    Upload your resume and paste a job description to generate a tailored cover letter.
                  </p>
                </div>
              )}

              {loading && !result && (
                <div className="max-w-xs mx-auto space-y-6 py-12 text-center w-full">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-violet-500/10 flex items-center justify-center mb-4 animate-pulse">
                    <Sparkles className="w-8 h-8 text-violet-400" />
                  </div>
                  <div className="space-y-3 w-full">
                    <div className="h-4 bg-white/5 rounded w-full mx-auto animate-pulse" />
                    <div className="h-3 bg-white/5 rounded w-11/12 animate-pulse" />
                    <div className="h-3 bg-white/5 rounded w-full animate-pulse" />
                    <div className="h-3 bg-white/5 rounded w-5/6 animate-pulse" />
                    <div className="h-3 bg-white/5 rounded w-4/6 animate-pulse" />
                  </div>
                  <p className="text-sm font-medium text-violet-400/80 animate-pulse">Writing your cover letter...</p>
                </div>
              )}

              {result && (
                <div className="flex flex-col h-full animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-white">Your Cover Letter</h3>
                      <p className="text-xs text-slate-400 mt-1">Ready to be customized and sent</p>
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

                  <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="p-6 bg-black/40 border border-white/5 rounded-xl text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                      {result}
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
