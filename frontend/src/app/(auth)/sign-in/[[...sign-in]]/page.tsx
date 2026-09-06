'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { AuthBrandPanel } from '@/components/auth/auth-brand-panel';

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    // TODO: integrate Clerk signIn()
    setTimeout(() => setIsLoading(false), 1500);
  }

  return (
    <div style={s.page}>
      <AuthBrandPanel />

      <div style={s.formSide}>
        <div style={s.formWrap}>

          <div style={s.header}>
            <h1 style={s.title}>Sign in</h1>
            <p style={s.sub}>Enter your credentials to access your journal.</p>
          </div>

          <form onSubmit={handleSubmit} style={s.form} noValidate>

            <div style={s.field}>
              <label htmlFor="si-email" style={s.label}>Email</label>
              <input
                id="si-email" type="email" autoComplete="email"
                placeholder="you@example.com" value={email}
                onChange={(e) => setEmail(e.target.value)} required
                style={s.input}
                onFocus={(e) => Object.assign(e.currentTarget.style, s.inputFocus)}
                onBlur={(e) => Object.assign(e.currentTarget.style, s.input)}
              />
            </div>

            <div style={s.field}>
              <div style={s.labelRow}>
                <label htmlFor="si-pw" style={s.label}>Password</label>
                <button type="button" style={s.textBtn}>Forgot password?</button>
              </div>
              <div style={s.inputWrap}>
                <input
                  id="si-pw" type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password" placeholder="••••••••"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ ...s.input, paddingRight: '40px' }}
                  onFocus={(e) => Object.assign(e.currentTarget.style, { ...s.inputFocus, paddingRight: '40px' })}
                  onBlur={(e) => Object.assign(e.currentTarget.style, { ...s.input, paddingRight: '40px' })}
                />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  style={s.eyeBtn} aria-label={showPassword ? 'Hide' : 'Show'}>
                  {showPassword
                    ? <EyeOff size={14} color="#3a5570" />
                    : <Eye size={14} color="#3a5570" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading} style={s.submitBtn}>
              {isLoading
                ? <><span style={s.spinner} />Signing in…</>
                : 'Sign in'}
            </button>

          </form>

          <div style={s.sep}>
            <span style={s.sepLine} />
            <span style={s.sepTxt}>or</span>
            <span style={s.sepLine} />
          </div>

          <button type="button" style={s.googleBtn} disabled>
            <GoogleIcon />
            Continue with Google
          </button>

          <p style={s.footer}>
            No account?{' '}
            <Link href="/sign-up" style={s.footerLink}>Create one free</Link>
          </p>

        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: {
    display: 'flex',
    width: '100%',
    height: '100%',
    position: 'relative',
    zIndex: 1,
    background: '#080e18',
  },

  formSide: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    overflowY: 'auto',
  },

  formWrap: {
    width: '420px',
  },

  header: {
    marginBottom: '36px',
  },

  title: {
    margin: '0 0 8px',
    fontSize: '24px',
    fontWeight: 700,
    color: '#dce8f5',
    letterSpacing: '-0.025em',
    lineHeight: 1.2,
  },

  sub: {
    margin: 0,
    fontSize: '13px',
    color: '#4a6080',
    lineHeight: 1.6,
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },

  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },

  labelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  label: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#3a5570',
    letterSpacing: '0.07em',
    textTransform: 'uppercase' as const,
  },

  textBtn: {
    background: 'none', border: 'none', padding: 0,
    fontSize: '11px', color: '#2d4a6a',
    cursor: 'pointer', fontFamily: 'var(--fx-font-sans)',
    letterSpacing: '0.01em',
  },

  inputWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },

  input: {
    width: '100%',
    padding: '12px 16px',
    background: '#0b1220',
    borderRadius: '8px',
    border: 'none',
    outline: 'none',
    color: '#c8d8ec',
    fontSize: '14px',
    fontFamily: 'var(--fx-font-sans)',
    transition: 'background 0.15s',
  },

  inputFocus: {
    width: '100%',
    padding: '12px 16px',
    background: '#0e1628',
    borderRadius: '8px',
    border: 'none',
    outline: 'none',
    color: '#dce8f5',
    fontSize: '14px',
    fontFamily: 'var(--fx-font-sans)',
    transition: 'background 0.15s',
  },

  eyeBtn: {
    position: 'absolute', right: '12px',
    background: 'none', border: 'none',
    cursor: 'pointer', display: 'flex',
    alignItems: 'center', padding: '2px',
  },

  submitBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '12px 18px',
    background: '#1a2d47',
    borderRadius: '8px',
    border: 'none',
    color: '#c8d8ec',
    fontSize: '13px',
    fontWeight: 600,
    fontFamily: 'var(--fx-font-sans)',
    cursor: 'pointer',
    marginTop: '4px',
    transition: 'background 0.15s',
    letterSpacing: '0.01em',
  },

  spinner: {
    display: 'inline-block', width: '12px', height: '12px',
    border: '1.5px solid rgba(200,216,236,0.2)',
    borderTop: '1.5px solid #c8d8ec',
    borderRadius: '50%', animation: 'spin 0.7s linear infinite',
  },

  sep: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    margin: '28px 0',
  },

  sepLine: {
    flex: 1, height: '1px',
    background: '#1a2e44',
    display: 'block',
  },

  sepTxt: {
    fontSize: '11px',
    color: '#4a6a88',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    whiteSpace: 'nowrap' as const,
  },

  googleBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    width: '100%',
    padding: '11px 18px',
    background: '#0f1d2e',
    border: 'none',
    borderRadius: '8px',
    color: '#6a8eaa',
    fontSize: '13px',
    fontWeight: 500,
    fontFamily: 'var(--fx-font-sans)',
    cursor: 'not-allowed',
  },

  footer: {
    margin: '24px 0 0',
    textAlign: 'center' as const,
    fontSize: '13px',
    color: '#506880',
  },

  footerLink: {
    color: '#7aA8cc',
    textDecoration: 'none',
    fontWeight: 600,
  },
};
