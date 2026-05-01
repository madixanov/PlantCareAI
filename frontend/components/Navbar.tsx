'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl font-bold">🌱</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Plant Care</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex space-x-1">
            <Link
              href="/"
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isActive('/')
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/plants"
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isActive('/plants') || pathname?.startsWith('/plants/')
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              My Plants
            </Link>
            <Link
              href="/plants/add"
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isActive('/plants/add')
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              Add Plant
            </Link>
            <Link
              href="/ai-assistant"
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isActive('/ai-assistant')
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              AI Assistant
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

// Made with Bob
