'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { AuthBrandPanel } from '@/components/auth/auth-brand-panel';

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    // TODO: integrate Clerk signUp()
    setTimeout(() => setIsLoading(false), 1500);
  }

  return (
    <div style={s.page}>
      <AuthBrandPanel />

      <div style={s.formSide}>
        <div style={s.formWrap}>

          <div style={s.header}>
            <h1 style={s.title}>Create account</h1>
            <p style={s.sub}>Free forever. Start building your trading edge today.</p>
          </div>

          <form onSubmit={handleSubmit} style={s.form} noValidate>

            <div style={s.row}>
              <div style={s.field}>
                <label htmlFor="su-name" style={s.label}>Full name</label>
                <input
                  id="su-name" type="text" autoComplete="name"
                  placeholder="John Trader" value={fullName}
                  onChange={(e) => setFullName(e.target.value)} required
                  style={s.input}
                  onFocus={(e) => Object.assign(e.currentTarget.style, s.inputFocus)}
                  onBlur={(e) => Object.assign(e.currentTarget.style, s.input)}
                />
              </div>
              <div style={s.field}>
                <label htmlFor="su-email" style={s.label}>Email</label>
                <input
                  id="su-email" type="email" autoComplete="email"
                  placeholder="you@example.com" value={email}
                  onChange={(e) => setEmail(e.target.value)} required
                  style={s.input}
                  onFocus={(e) => Object.assign(e.currentTarget.style, s.inputFocus)}
                  onBlur={(e) => Object.assign(e.currentTarget.style, s.input)}
                />
              </div>
            </div>

            <div style={s.row}>
              <div style={s.field}>
                <label htmlFor="su-pw" style={s.label}>Password</label>
                <div style={s.inputWrap}>
                  <input
                    id="su-pw" type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password" placeholder="Min. 8 chars"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    required minLength={8}
                    style={{ ...s.input, paddingRight: '38px' }}
                    onFocus={(e) => Object.assign(e.currentTarget.style, { ...s.inputFocus, paddingRight: '38px' })}
                    onBlur={(e) => Object.assign(e.currentTarget.style, { ...s.input, paddingRight: '38px' })}
                  />
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    style={s.eyeBtn} aria-label={showPassword ? 'Hide' : 'Show'}>
                    {showPassword ? <EyeOff size={13} color="#3a5570" /> : <Eye size={13} color="#3a5570" />}
                  </button>
                </div>
              </div>

              <div style={s.field}>
                <label htmlFor="su-confirm" style={s.label}>Confirm</label>
                <div style={s.inputWrap}>
                  <input
                    id="su-confirm" type={showConfirm ? 'text' : 'password'}
                    autoComplete="new-password" placeholder="Re-enter"
                    value={confirm} onChange={(e) => setConfirm(e.target.value)} required
                    style={{ ...s.input, paddingRight: '38px' }}
                    onFocus={(e) => Object.assign(e.currentTarget.style, { ...s.inputFocus, paddingRight: '38px' })}
                    onBlur={(e) => Object.assign(e.currentTarget.style, { ...s.input, paddingRight: '38px' })}
                  />
                  <button type="button" onClick={() => setShowConfirm(v => !v)}
                    style={s.eyeBtn} aria-label={showConfirm ? 'Hide' : 'Show'}>
                    {showConfirm ? <EyeOff size={13} color="#3a5570" /> : <Eye size={13} color="#3a5570" />}
                  </button>
                </div>
                {confirm.length > 0 && (
                  <p style={{ ...s.hint, color: password === confirm ? '#2a7a50' : '#7a2a2a' }}>
                    {password === confirm ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </p>
                )}
              </div>
            </div>

            <p style={s.terms}>
              By continuing you agree to our{' '}
              <span style={s.termsLink}>Terms of Service</span>{' '}and{' '}
              <span style={s.termsLink}>Privacy Policy</span>.
            </p>

            <button type="submit" disabled={isLoading} style={s.submitBtn}>
              {isLoading
                ? <><span style={s.spinner} />Creating account…</>
                : 'Create free account'}
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
            Have an account?{' '}
            <Link href="/sign-in" style={s.footerLink}>Sign in</Link>
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
    width: '480px',
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

  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '14px',
  },

  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },

  label: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#3a5570',
    letterSpacing: '0.07em',
    textTransform: 'uppercase' as const,
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
    position: 'absolute', right: '11px',
    background: 'none', border: 'none',
    cursor: 'pointer', display: 'flex',
    alignItems: 'center', padding: '2px',
  },

  hint: {
    margin: '4px 0 0',
    fontSize: '11px',
  },

  terms: {
    margin: 0,
    fontSize: '12px',
    color: '#4a6880',
    lineHeight: 1.6,
  },

  termsLink: {
    color: '#7aA8cc',
    cursor: 'pointer',
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
    flex: 1, height: '1px', background: '#1a2e44',
    display: 'block',
  },

  sepTxt: {
    fontSize: '11px', color: '#4a6a88',
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
