'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

/**
 * Custom hook to manage the state and logic for the Matchify AI landing page.
 */
export function useHome() {
  const [file, setFile] = useState(null);
  const [jd, setJd] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState({ totalUsers: 0, totalAnalyses: 0 });
  const [activeSection, setActiveSection] = useState('hero');
  const [user, setUser] = useState(null);
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
      const data = await res.json();
      if (data) setStats(data);
    } catch {
      /* silent */
    }
  }, []);

  const initUserStats = useCallback(() => {
    if (localStorage.getItem('matchify_user')) return;
    fetch('/api/stats', { method: 'POST' })
      .then((r) => r.json())
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

    // Animated progress bar
    progressTimerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) return prev;
        const step = prev < 40 ? 6 : prev < 70 ? 3 : 0.8;
        return Math.min(92, prev + step);
      });
    }, 900);

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('jobDescription', jd);

    try {
      const res = await fetch('/api/analyze', { method: 'POST', body: formData });
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      setProgress(100);

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed');

      setResults(data);
      fetchStats();

      // Redirect directly to the main dashboard to see updated stats
      if (data.resultId) {
        router.push('/dashboard');
      }
    } catch (err) {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      setProgress(0);
      alert('❌ Analysis failed: ' + err.message);
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
    scrollToAnalyzer();
  }, [scrollToAnalyzer]);

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
    scrollToAnalyzer,
  };
}
