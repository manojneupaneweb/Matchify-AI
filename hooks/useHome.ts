// @ts-nocheck
'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

/**
 * Custom hook to manage the state and logic for the Matchify AI landing page.
 */
export function useHome() {
  const [file, setFile] = useState<any>(null);
  const [jd, setJd] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const [analysisStep, setAnalysisStep] = useState('');
  const [analysisError, setAnalysisError] = useState('');
  const [stats, setStats] = useState({ totalUsers: 0, totalAnalyses: 0 });
  const [activeSection, setActiveSection] = useState('hero');
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const progressTimerRef = useRef(null);
  const router = useRouter();

  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user) {
      setUser(session.user);
    } else {
      setUser(null);
    }
  }, [session]);

  /* ── Track active section for Navbar highlight ──────────────────── */
  useEffect(() => {
    const sections = ['hero', 'analyzer', 'jd-generator', 'cover-letter', 'features', 'testimonials', 'pricing', 'faq', 'cta'];
    const observer = new IntersectionObserver(
      (entries) => {
        // Find sections that are currently intersecting
        const visibleSections = entries.filter(entry => entry.isIntersecting);
        
        if (visibleSections.length > 0) {
          // Priority: pick the section that is closest to the top of our "active zone"
          // This avoids jumping over small sections
          const bestSection = visibleSections.reduce((prev, current) => {
            return Math.abs(current.boundingClientRect.top) < Math.abs(prev.boundingClientRect.top) 
              ? current 
              : prev;
          });
          setActiveSection(bestSection.target.id);
        }
      },
      { threshold: [0.1, 0.2], rootMargin: '-10% 0px -50% 0px' }
    );
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  /* ── Fetch live stats ───────────────────────────────────────────── */
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json() as any;
      if (data) setStats(data);
    } catch {
      /* silent */
    }
  }, []);

  const initUserStats = useCallback(() => {
    if (localStorage.getItem('matchify_user')) return;
    fetch('/api/stats', { method: 'POST' })
      .then((r) => r.json() as any)
      .then((data) => {
        if (data) setStats(data);
        localStorage.setItem('matchify_user', 'true');
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchStats();
    initUserStats();
  }, [fetchStats, initUserStats]);

  /* ── Scroll to analyzer ─────────────────────────────────────────── */
  const scrollToAnalyzer = useCallback(() => {
    document.getElementById('analyzer')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  /* ── Run analysis ───────────────────────────────────────────────── */
  const handleAnalyze = useCallback(async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!file || !jd.trim()) return;

    setLoading(true);
    setResults(null);
    setProgress(0);
    setAnalysisError('');
    setAnalysisStep('Parsing');

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('jobDescription', jd);

    const controller = new AbortController();
    progressTimerRef.current = controller;

    try {
      const res = await fetch('/api/analyze', { method: 'POST', body: formData, signal: controller.signal });
      if (!res.ok) {
        const data = await res.json() as any;
        throw new Error(data?.error?.message || data?.error || 'Analysis failed');
      }
      const reader = res.body?.getReader();
      if (!reader) throw new Error('No response stream');
      const decoder = new TextDecoder();
      let buffer = '';
      let finalPayload = null;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const chunks = buffer.split('\n\n');
        buffer = chunks.pop() || '';
        for (const chunk of chunks) {
          const lines = chunk.split('\n');
          const eventName = (lines.find((line) => line.startsWith('event: ')) || 'event: message').slice(7);
          const dataLine = lines.find((line) => line.startsWith('data: '));
          if (!dataLine) continue;
          const payload = JSON.parse(dataLine.slice(6));
          if (eventName === 'progress') {
            const order = ['Parsing', 'Extracting', 'Matching', 'Scoring', 'Suggesting'];
            const index = order.indexOf(payload.step);
            if (index >= 0) setProgress(Math.round(((index + 1) / order.length) * 100));
            setAnalysisStep(payload.step);
          }
          if (eventName === 'error') throw new Error(payload?.error?.message || 'Analysis failed');
          if (eventName === 'done') finalPayload = payload;
        }
      }
      if (!finalPayload) throw new Error('Analysis did not finish');
      setResults(finalPayload);
      fetchStats();
      if (finalPayload.resultId) router.push(`/dashboard/results/${finalPayload.resultId}`);
    } catch (err) {
      setProgress(0);
      if (err.name !== 'AbortError') setAnalysisError(err.message);
    } finally {
      setLoading(false);
    }
  }, [file, jd, fetchStats, user, router]);

  /* ── Reset ──────────────────────────────────────────────────────── */
  const handleReset = useCallback(() => {
    setResults(null);
    setFile(null);
    setJd('');
    setProgress(0);
    setAnalysisError('');
    scrollToAnalyzer();
  }, [scrollToAnalyzer]);

  const cancelAnalyze = useCallback(() => {
    progressTimerRef.current?.abort?.();
    setLoading(false);
    setProgress(0);
  }, []);

  return {
    file,
    setFile,
    jd,
    setJd,
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
    cancelAnalyze,
    analysisStep,
    analysisError,
    scrollToAnalyzer,
  };
}
