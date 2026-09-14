'use client';

import React from 'react';
import { AuthenticateWithRedirectCallback } from '@clerk/nextjs';
import {
  SIGN_IN_URL,
  SIGN_UP_URL,
  AFTER_SIGN_IN_URL,
  AFTER_SIGN_UP_URL,
} from '@/lib/auth-urls';

export default function SSOCallbackPage() {
  return (
    <div style={styles.root}>
      <span style={styles.spinner} />
      <p style={styles.text}>Completing sign in…</p>

      <AuthenticateWithRedirectCallback
        signInUrl={SIGN_IN_URL}
        signUpUrl={SIGN_UP_URL}
        signInFallbackRedirectUrl={AFTER_SIGN_IN_URL}
        signUpFallbackRedirectUrl={AFTER_SIGN_UP_URL}
        continueSignUpUrl={SIGN_UP_URL}
      />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    background: '#080e18',
  },

  spinner: {
    display: 'inline-block',
    width: '20px',
    height: '20px',
    border: '2px solid rgba(200,216,236,0.15)',
    borderTop: '2px solid #c8d8ec',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
  },

  text: {
    margin: 0,
    fontSize: '13px',
    color: '#4a6080',
  },
};
