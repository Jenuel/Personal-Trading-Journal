'use client';

import { useState } from 'react';
import { ForexTrade } from '@/types/types';
import { formatCurrency, formatRR } from '@/lib/portfolio-utils';
import { TrendingUp, TrendingDown, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';

interface TradesTableProps {
    trades: ForexTrade[];
    onDelete?: (id: string) => void;
    isDeleting?: boolean;
    currency?: string;
}

type SortKey = 'date' | 'pair' | 'pips' | 'result' | 'rr' | 'lots';
type SortDir = 'asc' | 'desc';

function OutcomeBadge({ outcome }: { outcome?: 'WIN' | 'LOSS' | 'BE' }) {
    if (!outcome) return <span style={{ color: '#7b8fa8', fontSize: 12 }}>—</span>;
    const styles = {
        WIN:  { bg: 'rgba(16,185,129,0.15)', color: '#10b981', border: 'rgba(16,185,129,0.3)' },
        LOSS: { bg: 'rgba(239,68,68,0.15)',  color: '#ef4444', border: 'rgba(239,68,68,0.3)' },
        BE:   { bg: 'rgba(123,143,168,0.15)', color: '#7b8fa8', border: 'rgba(123,143,168,0.3)' },
    };
    const s = styles[outcome];
    return (
        <span style={{
            display: 'inline-block', padding: '2px 8px', borderRadius: 4,
            background: s.bg, color: s.color, border: `1px solid ${s.border}`,
            fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
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
            background: isLong ? 'rgba(0,212,255,0.12)' : 'rgba(245,158,11,0.12)',
            color: isLong ? '#00d4ff' : '#f59e0b',
            border: `1px solid ${isLong ? 'rgba(0,212,255,0.25)' : 'rgba(245,158,11,0.25)'}`,
            fontSize: 11, fontWeight: 700,
        }}>
            {isLong ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {direction}
        </span>
    );
}

function SessionPill({ session }: { session?: string }) {
    if (!session) return <span style={{ color: '#7b8fa8', fontSize: 12 }}>—</span>;
    const styles: Record<string, { bg: string; color: string }> = {
        LONDON:   { bg: 'rgba(99,179,237,0.15)', color: '#63b3ed' },
        NEW_YORK: { bg: 'rgba(0,212,255,0.12)',  color: '#00d4ff' },
        TOKYO:    { bg: 'rgba(252,211,77,0.12)', color: '#fcd34d' },
        SYDNEY:   { bg: 'rgba(16,185,129,0.10)', color: '#10b981' },
        OVERLAP:  { bg: 'rgba(167,139,250,0.12)', color: '#a78bfa' },
    };
    const labels: Record<string, string> = {
        LONDON: 'LON', NEW_YORK: 'NY', TOKYO: 'TKY', SYDNEY: 'SYD', OVERLAP: 'OVL',
    };
    const s = styles[session] ?? { bg: 'rgba(123,143,168,0.15)', color: '#7b8fa8' };
    return (
        <span style={{
            display: 'inline-block', padding: '2px 7px', borderRadius: 4,
            background: s.bg, color: s.color,
            border: `1px solid ${s.color}40`,
            fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase',
        }}>
            {labels[session] ?? session}
        </span>
    );
}

const TH: React.CSSProperties = {
    background: '#1a2030',
    borderBottom: '1px solid #2a3347',
    padding: '10px 12px',
    textAlign: 'left',
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: '#7b8fa8',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    cursor: 'pointer',
};

const TD: React.CSSProperties = {
    padding: '10px 12px',
    fontSize: 13,
    borderBottom: '1px solid rgba(42,51,71,0.5)',
};

export function TradesTable({ trades, onDelete, isDeleting, currency = 'USD' }: TradesTableProps) {
    const [sortKey, setSortKey] = useState<SortKey>('date');
    const [sortDir, setSortDir] = useState<SortDir>('desc');
    const [filterOutcome, setFilterOutcome] = useState<'ALL' | 'WIN' | 'LOSS' | 'BE'>('ALL');

    if (!trades || trades.length === 0) {
        return (
            <div style={{
                borderRadius: 12, padding: 48, textAlign: 'center',
                border: '1px dashed #2a3347', background: '#141824',
            }}>
                <p style={{ color: '#7b8fa8', fontSize: 14, margin: 0 }}>
                    No trades recorded yet. Log your first FOREX trade to get started.
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
                ? <ChevronUp size={11} style={{ color: '#00d4ff', marginLeft: 3 }} />
                : <ChevronDown size={11} style={{ color: '#00d4ff', marginLeft: 3 }} />;

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

    const filterBtnStyle = (f: string): React.CSSProperties => ({
        padding: '4px 12px', borderRadius: 6, border: '1px solid #2a3347',
        fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
        background: filterOutcome === f
            ? f === 'WIN' ? 'rgba(16,185,129,0.2)' : f === 'LOSS' ? 'rgba(239,68,68,0.2)' : '#1e2636'
            : 'transparent',
        color: filterOutcome === f
            ? f === 'WIN' ? '#10b981' : f === 'LOSS' ? '#ef4444' : '#e2e8f0'
            : '#7b8fa8',
    });

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <span style={{ color: '#7b8fa8', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Filter:
                </span>
                {(['ALL', 'WIN', 'LOSS', 'BE'] as const).map(f => (
                    <button key={f} onClick={() => setFilterOutcome(f)} style={filterBtnStyle(f)}>
                        {f}
                    </button>
                ))}
                <span style={{ marginLeft: 'auto', color: '#7b8fa8', fontSize: 12 }}>
                    {sorted.length} trade{sorted.length !== 1 ? 's' : ''}
                </span>
            </div>

            <div style={{ borderRadius: 12, border: '1px solid #2a3347', overflow: 'hidden' }}>
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
                                    ...(onDelete ? [{ key: null, label: '' }] : []),
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
                                    trade.outcome === 'WIN'  ? 'rgba(16,185,129,0.05)' :
                                    trade.outcome === 'LOSS' ? 'rgba(239,68,68,0.05)'  :
                                    trade.outcome === 'BE'   ? 'rgba(123,143,168,0.03)' : 'transparent';
                                const pipColor = (trade.pips ?? 0) >= 0 ? '#10b981' : '#ef4444';
                                const plColor  = (trade.result ?? 0) >= 0 ? '#10b981' : '#ef4444';
                                const rrColor  = (trade.rr ?? 0) >= 0 ? '#00d4ff' : '#ef4444';
                                const isJPY = trade.pair.includes('JPY');
                                const dec = isJPY ? 3 : 5;

                                return (
                                    <tr key={trade.id} style={{ background: rowBg }}>
                                        <td style={{ ...TD, color: '#7b8fa8', fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
                                            {new Date(trade.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
                                        </td>
                                        <td style={TD}>
                                            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, fontSize: 13, color: '#e2e8f0' }}>
                                                {trade.pair}
                                            </span>
                                        </td>
                                        <td style={TD}><DirectionBadge direction={trade.direction} /></td>
                                        <td style={{ ...TD, textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", color: '#e2e8f0' }}>
                                            {trade.lots.toFixed(2)}
                                        </td>
                                        <td style={{ ...TD, textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#7b8fa8' }}>
                                            {trade.entryPrice.toFixed(dec)}
                                        </td>
                                        <td style={{ ...TD, textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#7b8fa8' }}>
                                            {trade.exitPrice ? trade.exitPrice.toFixed(dec) : '—'}
                                        </td>
                                        <td style={{ ...TD, textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#ef4444', opacity: 0.8 }}>
                                            {trade.stopLoss ? trade.stopLoss.toFixed(dec) : '—'}
                                        </td>
                                        <td style={{ ...TD, textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#10b981', opacity: 0.8 }}>
                                            {trade.takeProfit ? trade.takeProfit.toFixed(dec) : '—'}
                                        </td>
                                        <td style={{ ...TD, textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: trade.pips !== undefined ? pipColor : '#7b8fa8' }}>
                                            {trade.pips !== undefined ? `${trade.pips > 0 ? '+' : ''}${trade.pips.toFixed(1)}` : '—'}
                                        </td>
                                        <td style={{ ...TD, textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: trade.result !== undefined ? plColor : '#7b8fa8' }}>
                                            {trade.result !== undefined
                                                ? `${trade.result >= 0 ? '+' : ''}${formatCurrency(trade.result, currency as 'USD')}`
                                                : '—'}
                                        </td>
                                        <td style={{ ...TD, textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: trade.rr !== undefined ? rrColor : '#7b8fa8' }}>
                                            {trade.rr !== undefined ? formatRR(trade.rr) : '—'}
                                        </td>
                                        <td style={TD}><SessionPill session={trade.session} /></td>
                                        <td style={TD}><OutcomeBadge outcome={trade.outcome} /></td>
                                        {onDelete && (
                                            <td style={{ ...TD, textAlign: 'right' }}>
                                                <button
                                                    onClick={() => onDelete(trade.id)}
                                                    disabled={isDeleting}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', opacity: 0.5, padding: '2px 4px' }}
                                                    onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                                                    onMouseLeave={e => (e.currentTarget.style.opacity = '0.5')}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
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
