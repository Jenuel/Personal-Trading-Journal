'use client';

import React from 'react';
import { ScrollText, TrendingUp, Target, Zap } from 'lucide-react';

const FEATURES = [
  { icon: ScrollText, label: 'Log every trade',    detail: 'Capture entries, exits & notes in seconds' },
  { icon: TrendingUp, label: 'Measure your edge',  detail: 'Real win rate, profit factor & R:R' },
  { icon: Target,     label: 'Break it down',      detail: 'Pair, session, setup & more' },
  { icon: Zap,        label: 'Build discipline',   detail: 'Patterns you can act on, not guess at' },
];

export function AuthBrandPanel() {
  return (
    <div style={s.panel}>

      <div style={s.logo}>
        <div style={s.logoMark}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <polyline points="1,12 5,7 8,9 11,4 15,6"
              stroke="#c8d8ec" strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span style={s.logoWord}>FX Journal</span>
      </div>

      <div style={s.inner}>

        <div style={s.headlineBlock}>
          <p style={s.overline}>For serious traders</p>
          <h1 style={s.h1}>
            The journal that<br />
            <em style={s.h1Em}>sharpens your edge.</em>
          </h1>
          <p style={s.body}>
            Stop trading on instinct alone. Every trade you log becomes
            data. Every data point becomes clarity.
          </p>
        </div>

        <ul style={s.featureList}>
          {FEATURES.map(({ icon: Icon, label, detail }) => (
            <li key={label} style={s.featureItem}>
              <div style={s.iconWrap}>
                <Icon size={14} strokeWidth={1.8} color="#5a7896" />
              </div>
              <div>
                <p style={s.featureLabel}>{label}</p>
                <p style={s.featureDetail}>{detail}</p>
              </div>
            </li>
          ))}
        </ul>

        <div style={s.byline}>
          <div style={s.bylineDash} />
          <p style={s.bylineText}>Built for independent FOREX traders</p>
        </div>

      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  panel: {
    position: 'relative',
    flex: '0 0 45%',
    height: '100%',
    background: 'linear-gradient(160deg, #050a14 0%, #071020 55%, #091525 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '52px',
    overflow: 'hidden',
  },

  /* Absolute so the logo does not shift the vertically centred content block */
  logo: {
    position: 'absolute',
    top: '36px',
    left: '52px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },

  logoMark: {
    width: '28px',
    height: '28px',
    borderRadius: '7px',
    background: 'rgba(200,216,236,0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  logoWord: {
    fontFamily: 'var(--fx-font-sans)',
    fontWeight: 600,
    fontSize: '14px',
    color: '#8fa8c4',
    letterSpacing: '0.01em',
  },

  inner: {
    width: '100%',
    maxWidth: '340px',
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
  },

  headlineBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },

  overline: {
    margin: 0,
    fontSize: '10px',
    fontWeight: 600,
    letterSpacing: '0.14em',
    textTransform: 'uppercase' as const,
    color: '#3a5c7a',
  },

  h1: {
    margin: 0,
    fontFamily: 'var(--fx-font-sans)',
    fontWeight: 800,
    fontSize: '32px',
    lineHeight: 1.2,
    color: '#c8ddef',
    letterSpacing: '-0.03em',
    fontStyle: 'normal',
  },

  h1Em: {
    fontStyle: 'italic',
    fontWeight: 700,
    color: '#8ab0cc',
  },

  body: {
    margin: 0,
    fontSize: '13.5px',
    color: '#3d5a72',
    lineHeight: 1.75,
  },

  featureList: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },

  featureItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '13px',
  },

  iconWrap: {
    marginTop: '2px',
    width: '28px',
    height: '28px',
    borderRadius: '7px',
    background: 'rgba(90,120,150,0.12)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  featureLabel: {
    margin: '0 0 2px',
    fontSize: '13px',
    fontWeight: 600,
    color: '#7a9ab8',
    letterSpacing: '-0.01em',
  },

  featureDetail: {
    margin: 0,
    fontSize: '12px',
    color: '#2e4560',
    lineHeight: 1.5,
  },

  byline: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },

  bylineDash: {
    width: '20px',
    height: '1px',
    background: '#1e3048',
    flexShrink: 0,
  },

  bylineText: {
    margin: 0,
    fontSize: '11px',
    color: '#1e3048',
    letterSpacing: '0.04em',
  },
};
