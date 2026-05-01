'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page has been removed - AI is now contextual
// Redirecting to Find Plants page
export default function AIAssistantRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/find-plants');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to Find Plants...</p>
      </div>
    </div>
  );
}

// Made with Bob
