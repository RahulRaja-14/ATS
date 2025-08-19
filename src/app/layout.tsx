import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Footer from '../components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Plamento - ScanCV',
  description: 'Upload your resume and get AI-powered suggestions for improvement',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} flex flex-col min-h-screen bg-black pt-16`}>
        <header className="flex items-center p-4 border-b border-gray-700 fixed top-0 left-0 right-0 bg-black z-50">
          {/* Back button */}
          <button className="text-white mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-white">Plamento</h1>
            <span className="text-xl font-semibold text-white mx-1">/</span>
            <h1 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">ScanCV</h1>
          </div>
        </header>
        <main className="flex-grow">
          {children}
        </main>
        <Toaster/>
        <Footer />
      </body>
    </html>
  );
}