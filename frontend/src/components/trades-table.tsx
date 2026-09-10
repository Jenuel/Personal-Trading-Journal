'use client';

import { useState } from 'react';
import { ForexTrade } from '@/types/types';
import { formatCurrency, formatRR } from '@/lib/portfolio-utils';
import { TrendingUp, TrendingDown, ChevronUp, ChevronDown, Trash2, Pencil } from 'lucide-react';

interface TradesTableProps {
    trades: ForexTrade[];
    onDelete?: (id: string) => void;
    onEdit?: (trade: ForexTrade) => void;
    isDeleting?: boolean;
    currency?: string;
    accountName?: string;
}

type SortKey = 'date' | 'pair' | 'pips' | 'result' | 'rr' | 'lots';
type SortDir = 'asc' | 'desc';

function OutcomeBadge({ outcome }: { outcome?: 'WIN' | 'LOSS' | 'BE' }) {
    if (!outcome) return <span style={{ color: '#4a6080', fontSize: 12 }}>—</span>;
    const styles = {
        WIN:  { bg: 'rgba(16,185,129,0.12)', color: '#10b981' },
        LOSS: { bg: 'rgba(239,68,68,0.12)',  color: '#ef4444' },
        BE:   { bg: 'rgba(90,120,150,0.12)', color: '#7a9ab8' },
    };
    const s = styles[outcome];
    return (
        <span style={{
            display: 'inline-block', padding: '2px 8px', borderRadius: 4,
            background: s.bg, color: s.color,
            fontSize: 10.5, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
        }}>
            {outcome}
        </span>
    );
}

function DirectionBadge({ direction }: { direction: 'LONG' | 'SHORT' }) {
    const isLong = direction === 'LONG';
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 3,
            padding: '2px 8px', borderRadius: 4,
            background: isLong ? 'rgba(122,168,204,0.12)' : 'rgba(245,158,11,0.12)',
            color: isLong ? '#8ab0cc' : '#f59e0b',
            fontSize: 10.5, fontWeight: 700,
        }}>
            {isLong ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {direction}
        </span>
    );
}

function SessionPill({ session }: { session?: string }) {
    if (!session) return <span style={{ color: '#4a6080', fontSize: 12 }}>—</span>;
    const styles: Record<string, { bg: string; color: string }> = {
        LONDON:   { bg: 'rgba(122,168,204,0.12)', color: '#8ab0cc' },
        NEW_YORK: { bg: 'rgba(138,176,204,0.15)', color: '#c8ddef' },
        TOKYO:    { bg: 'rgba(252,211,77,0.12)',  color: '#fcd34d' },
        SYDNEY:   { bg: 'rgba(16,185,129,0.10)',  color: '#10b981' },
        OVERLAP:  { bg: 'rgba(167,139,250,0.12)', color: '#a78bfa' },
    };
    const labels: Record<string, string> = {
        LONDON: 'LON', NEW_YORK: 'NY', TOKYO: 'TKY', SYDNEY: 'SYD', OVERLAP: 'OVL',
    };
    const s = styles[session] ?? { bg: 'rgba(90,120,150,0.12)', color: '#7a9ab8' };
    return (
        <span style={{
            display: 'inline-block', padding: '2px 7px', borderRadius: 4,
            background: s.bg, color: s.color,
            fontSize: 10.5, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase',
        }}>
            {labels[session] ?? session}
        </span>
    );
}

const TH: React.CSSProperties = {
    background: '#111d30',
    borderBottom: '1px solid rgba(74, 96, 128, 0.10)',
    padding: '10px 12px',
    textAlign: 'left',
    fontSize: '10.5px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.09em',
    color: '#4a6080',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    cursor: 'pointer',
};

const TD: React.CSSProperties = {
    padding: '10px 12px',
    fontSize: 13,
    borderBottom: '1px solid rgba(200, 216, 236, 0.04)',
};

export function TradesTable({ trades, onDelete, onEdit, isDeleting, currency = 'USD', accountName }: TradesTableProps) {
    const [sortKey, setSortKey] = useState<SortKey>('date');
    const [sortDir, setSortDir] = useState<SortDir>('desc');
    const [filterOutcome, setFilterOutcome] = useState<'ALL' | 'WIN' | 'LOSS' | 'BE'>('ALL');

    if (!trades || trades.length === 0) {
        return (
            <div style={{
                borderRadius: 12, padding: '52px 32px', textAlign: 'center',
                background: '#0d1524',
            }}>
                <div style={{
                    width: 44, height: 44, borderRadius: 10,
                    background: 'rgba(90, 120, 150, 0.10)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 14px',
                }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5a7896" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 3l18 18M10.5 10.677a2 2 0 0 0 2.823 2.823" />
                        <path d="M13.843 13.625A3.5 3.5 0 0 0 9.35 9.137m-1.357 5.07A8 8 0 0 0 12 20c4.418 0 8-3.582 8-8a8 8 0 0 0-.136-1.499" />
                        <path d="M6.5 6.343A8 8 0 0 0 4 12c0 4.418 3.582 8 8 8" />
                    </svg>
                </div>
                <p style={{ color: '#c8ddef', fontSize: 14, fontWeight: 600, margin: '0 0 6px' }}>
                    {accountName ? `No trades for ${accountName} yet` : 'No trades recorded yet'}
                </p>
                <p style={{ color: '#4a6080', fontSize: 13, margin: 0 }}>
                    Log your first trade to start tracking your performance.
                </p>
            </div>
        );
    }

    const handleSort = (key: SortKey) => {
        if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortKey(key); setSortDir('desc'); }
    };

    const SortIcon = ({ k }: { k: SortKey }) =>
        sortKey !== k
            ? <ChevronUp size={11} style={{ opacity: 0.3, marginLeft: 3 }} />
            : sortDir === 'asc'
                ? <ChevronUp size={11} style={{ color: '#7aA8cc', marginLeft: 3 }} />
                : <ChevronDown size={11} style={{ color: '#7aA8cc', marginLeft: 3 }} />;

    const filtered = filterOutcome === 'ALL' ? trades : trades.filter(t => t.outcome === filterOutcome);

    const sorted = [...filtered].sort((a, b) => {
        let av = 0, bv = 0;
        if (sortKey === 'date') { av = new Date(a.date).getTime(); bv = new Date(b.date).getTime(); }
        else if (sortKey === 'pair') return sortDir === 'asc' ? a.pair.localeCompare(b.pair) : b.pair.localeCompare(a.pair);
        else if (sortKey === 'pips') { av = a.pips ?? 0; bv = b.pips ?? 0; }
        else if (sortKey === 'result') { av = a.result ?? 0; bv = b.result ?? 0; }
        else if (sortKey === 'rr') { av = a.rr ?? 0; bv = b.rr ?? 0; }
        else if (sortKey === 'lots') { av = a.lots; bv = b.lots; }
        return sortDir === 'asc' ? av - bv : bv - av;
    });

    const filterBtnStyle = (f: string): React.CSSProperties => {
        const isActive = filterOutcome === f;
        let bg = 'transparent';
        let color = '#4a6080';
        if (isActive) {
            if (f === 'WIN') { bg = 'rgba(16,185,129,0.15)'; color = '#10b981'; }
            else if (f === 'LOSS') { bg = 'rgba(239,68,68,0.15)'; color = '#ef4444'; }
            else if (f === 'BE') { bg = 'rgba(90,120,150,0.15)'; color = '#7a9ab8'; }
            else { bg = '#1a2d47'; color = '#c8ddef'; }
        }
        return {
            padding: '4px 12px', borderRadius: 6, border: 'none',
            fontSize: 11.5, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
            background: bg, color,
        };
    };

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <span style={{ color: '#3a5c7a', fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                    Filter:
                </span>
                {(['ALL', 'WIN', 'LOSS', 'BE'] as const).map(f => (
                    <button key={f} onClick={() => setFilterOutcome(f)} style={filterBtnStyle(f)}>
                        {f}
                    </button>
                ))}
                <span style={{ marginLeft: 'auto', color: '#4a6080', fontSize: 12 }}>
                    {sorted.length} trade{sorted.length !== 1 ? 's' : ''}
                </span>
            </div>

            <div style={{ borderRadius: 12, overflow: 'hidden', background: '#0d1524' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                {[
                                    { key: 'date', label: 'Date' },
                                    { key: 'pair', label: 'Pair' },
                                    { key: null, label: 'Dir.' },
                                    { key: 'lots', label: 'Lots' },
                                    { key: null, label: 'Entry' },
                                    { key: null, label: 'Exit' },
                                    { key: null, label: 'SL' },
                                    { key: null, label: 'TP' },
                                    { key: 'pips', label: 'Pips' },
                                    { key: 'result', label: 'P&L' },
                                    { key: 'rr', label: 'R:R' },
                                    { key: null, label: 'Session' },
                                    { key: null, label: 'Outcome' },
                                    ...(onDelete || onEdit ? [{ key: null, label: '' }] : []),
                                ].map(({ key, label }, i) => (
                                    <th
                                        key={i}
                                        style={{ ...TH, textAlign: ['Lots','Entry','Exit','SL','TP','Pips','P&L','R:R'].includes(label) ? 'right' : 'left' }}
                                        onClick={key ? () => handleSort(key as SortKey) : undefined}
                                    >
                                        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                                            {label}
                                            {key && <SortIcon k={key as SortKey} />}
                                        </span>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {sorted.map((trade) => {
                                const rowBg =
                                    trade.outcome === 'WIN'  ? 'rgba(16,185,129,0.04)' :
                                    trade.outcome === 'LOSS' ? 'rgba(239,68,68,0.04)'  :
                                    trade.outcome === 'BE'   ? 'rgba(90,120,150,0.03)' : 'transparent';
                                const pipColor = (trade.pips ?? 0) >= 0 ? '#10b981' : '#ef4444';
                                const plColor  = (trade.result ?? 0) >= 0 ? '#10b981' : '#ef4444';
                                const rrColor  = (trade.rr ?? 0) >= 0 ? '#7aA8cc' : '#ef4444';
                                const isJPY = trade.pair.includes('JPY');
                                const dec = isJPY ? 3 : 5;

                                return (
                                    <tr key={trade.id} style={{ background: rowBg }}>
                                        <td style={{ ...TD, color: '#4a6080', fontFamily: 'var(--fx-font-mono)', fontSize: 12 }}>
                                            {new Date(trade.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
                                        </td>
                                        <td style={TD}>
                                            <span style={{ fontFamily: 'var(--fx-font-mono)', fontWeight: 600, fontSize: 13, color: '#c8ddef' }}>
                                                {trade.pair}
                                            </span>
                                        </td>
                                        <td style={TD}><DirectionBadge direction={trade.direction} /></td>
                                        <td style={{ ...TD, textAlign: 'right', fontFamily: 'var(--fx-font-mono)', color: '#c8ddef' }}>
                                            {trade.lots.toFixed(2)}
                                        </td>
                                        <td style={{ ...TD, textAlign: 'right', fontFamily: 'var(--fx-font-mono)', fontSize: 12, color: '#4a6080' }}>
                                            {trade.entryPrice.toFixed(dec)}
                                        </td>
                                        <td style={{ ...TD, textAlign: 'right', fontFamily: 'var(--fx-font-mono)', fontSize: 12, color: '#4a6080' }}>
                                            {trade.exitPrice ? trade.exitPrice.toFixed(dec) : '—'}
                                        </td>
                                        <td style={{ ...TD, textAlign: 'right', fontFamily: 'var(--fx-font-mono)', fontSize: 12, color: '#ef4444', opacity: 0.8 }}>
                                            {trade.stopLoss ? trade.stopLoss.toFixed(dec) : '—'}
                                        </td>
                                        <td style={{ ...TD, textAlign: 'right', fontFamily: 'var(--fx-font-mono)', fontSize: 12, color: '#10b981', opacity: 0.8 }}>
                                            {trade.takeProfit ? trade.takeProfit.toFixed(dec) : '—'}
                                        </td>
                                        <td style={{ ...TD, textAlign: 'right', fontFamily: 'var(--fx-font-mono)', fontWeight: 700, color: trade.pips !== undefined ? pipColor : '#4a6080' }}>
                                            {trade.pips !== undefined ? `${trade.pips > 0 ? '+' : ''}${trade.pips.toFixed(1)}` : '—'}
                                        </td>
                                        <td style={{ ...TD, textAlign: 'right', fontFamily: 'var(--fx-font-mono)', fontWeight: 700, color: trade.result !== undefined ? plColor : '#4a6080' }}>
                                            {trade.result !== undefined
                                                ? `${trade.result >= 0 ? '+' : ''}${formatCurrency(trade.result, currency as 'USD')}`
                                                : '—'}
                                        </td>
                                        <td style={{ ...TD, textAlign: 'right', fontFamily: 'var(--fx-font-mono)', fontWeight: 700, color: trade.rr !== undefined ? rrColor : '#4a6080' }}>
                                            {trade.rr !== undefined ? formatRR(trade.rr) : '—'}
                                        </td>
                                        <td style={TD}><SessionPill session={trade.session} /></td>
                                        <td style={TD}><OutcomeBadge outcome={trade.outcome} /></td>
                                        {(onDelete || onEdit) && (
                                            <td style={{ ...TD, textAlign: 'right' }}>
                                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                                    {onEdit && (
                                                        <button
                                                            onClick={() => onEdit(trade)}
                                                            disabled={isDeleting}
                                                            title="Edit trade"
                                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7aA8cc', opacity: 0.6, padding: '2px 4px' }}
                                                            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                                                            onMouseLeave={e => (e.currentTarget.style.opacity = '0.6')}
                                                        >
                                                            <Pencil size={13} />
                                                        </button>
                                                    )}
                                                    {onDelete && (
                                                        <button
                                                            onClick={() => onDelete(trade.id)}
                                                            disabled={isDeleting}
                                                            title="Delete trade"
                                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', opacity: 0.6, padding: '2px 4px' }}
                                                            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                                                            onMouseLeave={e => (e.currentTarget.style.opacity = '0.6')}
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
