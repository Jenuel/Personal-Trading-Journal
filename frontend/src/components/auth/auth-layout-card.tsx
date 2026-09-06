'use client';

import React from 'react';

interface AuthLayoutCardProps {
  children: React.ReactNode;
  className?: string;
}

export function AuthLayoutCard({ children, className }: AuthLayoutCardProps) {
  return (
    <div style={styles.card} className={className}>
      <div style={styles.topGlow} />
      {children}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    position: 'relative',
    background: '#0d1524',
    borderRadius: '16px',
    padding: '32px 36px 28px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
    overflow: 'hidden',
  },
  topGlow: {
    position: 'absolute',
    top: 0,
    left: '20%',
    right: '20%',
    height: '2px',
    background: 'linear-gradient(90deg, transparent, #3a5c7a, transparent)',
    borderRadius: '0 0 4px 4px',
  },
};
