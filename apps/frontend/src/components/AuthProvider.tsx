'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { checkAuth, isAuthenticated } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      await checkAuth();
      setIsChecking(false);
    };

    verifyAuth();
  }, []);

  useEffect(() => {
    if (!isChecking) {
      const isAuthPage = pathname?.startsWith('/auth');
      const isDashboardPage = pathname?.startsWith('/dashboard');

      if (isDashboardPage && !isAuthenticated) {
        router.push('/auth/login');
      } else if (isAuthPage && isAuthenticated) {
        router.push('/dashboard');
      }
    }
  }, [isChecking, isAuthenticated, pathname, router]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}
