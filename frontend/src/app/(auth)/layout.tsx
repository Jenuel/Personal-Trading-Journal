import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={styles.root}>
      <style>{`html, body { overflow: hidden !important; height: 100%; }`}</style>
      {children}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    position: 'relative',
    width: '100vw',
    height: '100vh',
    background: '#080e18',
    display: 'flex',
    overflow: 'hidden',
  },
};
