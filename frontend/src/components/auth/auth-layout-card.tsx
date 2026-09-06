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
    background: 'rgba(20, 24, 36, 0.85)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid #2a3347',
    borderRadius: '16px',
    padding: '32px 36px 28px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,212,255,0.04)',
    overflow: 'hidden',
  },
  topGlow: {
    position: 'absolute',
    top: 0,
    left: '20%',
    right: '20%',
    height: '2px',
    background: 'linear-gradient(90deg, transparent, #00d4ff, transparent)',
    borderRadius: '0 0 4px 4px',
  },
};
