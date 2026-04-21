import { Inter, Outfit } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata = {
  title: 'Matchify AI — AI-Powered Resume Analyzer | Land Your Dream Job',
  description:
    'Upload your resume, paste a job description, and get an instant AI match score, keyword analysis, and actionable improvement suggestions. Free to start.',
  keywords: 'resume analyzer, ATS optimizer, job match score, AI resume, career tool',
  openGraph: {
    title: 'Matchify AI — AI-Powered Resume Analyzer',
    description: 'Get your resume match score in 30 seconds. Free AI-powered analysis.',
    type: 'website',
  },
};

import Providers from './Providers';

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
