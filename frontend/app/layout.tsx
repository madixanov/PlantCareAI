import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Plant Care System - AI-Powered Plant Management',
  description: 'Manage your plants with AI-powered care recommendations',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <p className="text-center text-gray-600 text-sm">
                © 2024 Plant Care System. Built with Next.js, TypeScript, and IBM Bob.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}

// Made with Bob
