'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/sidebar';

const AUTH_PATHS = ['/sign-in', '/sign-up'];

/** Auth routes render bare; every other route gets the sidebar + main layout. */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = AUTH_PATHS.some((p) => pathname?.startsWith(p));

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, minHeight: '100vh', background: '#080e18', overflow: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
