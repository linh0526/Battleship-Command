"use client";

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import GlobalLoading from './GlobalLoading';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    // Artificial delay to show the "establishing uplink" brand experience on reload
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);
  
  // Define pages that should have a fixed (non-scrolling) layout
  const fixedPages = ['/profile', '/messages', '/battle'];
  const isFixed = fixedPages.includes(pathname);

  if (initialLoading) {
    return <GlobalLoading />;
  }

  return (
    <div className={`app-container relative isolate ${isFixed ? 'fixed-layout' : ''}`}>
      {children}
    </div>
  );
}
