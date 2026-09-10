'use client';

import { useState } from 'react';
import { PortfolioDialog, PortfolioFormData } from '@/components/portfolios-dialog';
import {
    usePortfolios,
    useCreatePortfolio,
    useUpdatePortfolio,
    useDeletePortfolio,
} from '@/hooks/use-portfolios';
import { Button } from '@/components/ui/button';
import {
    Plus, Settings, Pencil, Trash2,
    TrendingUp, TrendingDown, Wallet,
} from 'lucide-react';
import { Portfolio } from '@/types/types';
import { formatCurrency, calculatePortfolioGain } from '@/lib/portfolio-utils';

const ACCOUNT_TYPE_STYLE: Record<string, { bg: string; color: string }> = {
    LIVE: { bg: 'rgba(16,185,129,0.12)', color: '#10b981' },
    DEMO: { bg: 'rgba(90,120,150,0.12)', color: '#7a9ab8' },
    PROP: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
};

function AccountRow({ portfolio, onEdit, onDelete, isDeleting }: {
    portfolio: Portfolio;
    onEdit: (p: Portfolio) => void;
    onDelete: (id: string) => void;
    isDeleting: boolean;
}) {
    const { gain, gainPercent } = calculatePortfolioGain(portfolio);
    const isProfit = gain >= 0;
    const typeStyle = ACCOUNT_TYPE_STYLE[portfolio.accountType] ?? ACCOUNT_TYPE_STYLE.DEMO;
    const tradeCount = portfolio.trades?.length ?? 0;

    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 16,
            background: '#0d1524',
            borderRadius: 12,
            padding: '16px 20px',
            transition: 'background 0.15s',
        }}
            onMouseEnter={e => (e.currentTarget.style.background = '#111d30')}
            onMouseLeave={e => (e.currentTarget.style.background = '#0d1524')}
        >
            {/* Color dot */}
            <div style={{
                width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                background: typeStyle.color,
            }} />

            {/* Account info */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span style={{ color: '#c8ddef', fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {portfolio.name}
                    </span>
                    <span style={{
                        fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                        background: typeStyle.bg, color: typeStyle.color,
                        textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0,
                    }}>
                        {portfolio.accountType}
                    </span>
                </div>
                <p style={{ color: '#4a6080', fontSize: 12, margin: 0 }}>
                    {portfolio.broker ?? '—'} · {portfolio.currency} · {tradeCount} trade{tradeCount !== 1 ? 's' : ''}
                </p>
            </div>

            {/* Balance */}
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ color: '#c8ddef', fontFamily: 'var(--fx-font-mono)', fontWeight: 700, fontSize: 15, margin: '0 0 2px' }}>
                    {formatCurrency(portfolio.currentBalance, portfolio.currency)}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                    {isProfit
                        ? <TrendingUp size={11} color="#10b981" />
                        : <TrendingDown size={11} color="#ef4444" />
                    }
                    <span style={{
                        fontFamily: 'var(--fx-font-mono)', fontSize: 12,
                        color: isProfit ? '#10b981' : '#ef4444',
                    }}>
                        {gain >= 0 ? '+' : ''}{formatCurrency(gain, portfolio.currency)}
                        <span style={{ opacity: 0.7, marginLeft: 4 }}>
                            ({gainPercent >= 0 ? '+' : ''}{gainPercent.toFixed(1)}%)
                        </span>
                    </span>
                </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 6, flexShrink: 0, marginLeft: 8 }}>
                <button
                    onClick={() => onEdit(portfolio)}
                    title="Edit account"
                    style={{
                        background: '#1a2d47', border: 'none',
                        borderRadius: 7, cursor: 'pointer', color: '#c8d8ec',
                        padding: '7px 10px', transition: 'all 0.15s', display: 'flex', alignItems: 'center',
                    }}
                    onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = '#223b5d';
                    }}
                    onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = '#1a2d47';
                    }}
                >
                    <Pencil size={13} />
                </button>
                <button
                    onClick={() => onDelete(portfolio.id)}
                    disabled={isDeleting}
                    title="Delete account"
                    style={{
                        background: 'rgba(239,68,68,0.10)', border: 'none',
                        borderRadius: 7, cursor: 'pointer', color: '#ef4444',
                        padding: '7px 10px', transition: 'all 0.15s', display: 'flex', alignItems: 'center',
                        opacity: isDeleting ? 0.5 : 1,
                    }}
                    onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.18)';
                    }}
                    onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.10)';
                    }}
                >
                    <Trash2 size={13} />
                </button>
            </div>
        </div>
    );
}

export default function SettingsPage() {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingPortfolio, setEditingPortfolio] = useState<Portfolio | undefined>();

    const { data: portfolios = [], isLoading } = usePortfolios();
    const createPortfolio = useCreatePortfolio();
    const updatePortfolio = useUpdatePortfolio();
    const deletePortfolio = useDeletePortfolio();

    const handleOpenDialog = (portfolio?: Portfolio) => {
        setEditingPortfolio(portfolio);
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setEditingPortfolio(undefined);
        setDialogOpen(false);
    };

    const handleSubmit = (data: PortfolioFormData) => {
        if (editingPortfolio) {
            updatePortfolio.mutate({ id: editingPortfolio.id, data });
        } else {
            createPortfolio.mutate(data);
        }
        handleCloseDialog();
    };

    return (
        <div className="page-container space-y-8">

            {/* ─── Header ──────────────────────────────────────────────────── */}
            <div className="animate-slide-up" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <Settings size={14} color="#3a5c7a" />
                        <span style={{
                            color: '#3a5c7a', fontSize: 11, fontWeight: 600,
                            textTransform: 'uppercase', letterSpacing: '0.14em',
                        }}>
                            Settings
                        </span>
                    </div>
                    <h1 style={{ color: '#c8ddef', fontSize: 28, fontWeight: 800, letterSpacing: '-0.025em', margin: 0 }}>
                        Manage Accounts
                    </h1>
                    <p style={{ color: '#4a6080', fontSize: 13, marginTop: 3 }}>
                        Add, edit, or remove your trading accounts.
                    </p>
                </div>
                <Button
                    onClick={() => handleOpenDialog()}
                    className="btn-fx"
                    style={{ border: 'none', gap: 6, flexShrink: 0, marginTop: 4 }}
                >
                    <Plus size={15} />
                    New Account
                </Button>
            </div>

            {/* ─── Account List ─────────────────────────────────────────────── */}
            <div className="animate-slide-up stagger-1">
                {isLoading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {[1, 2, 3].map(i => (
                            <div key={i} style={{ height: 74, borderRadius: 12, background: '#0d1524', animation: 'pulse 1.5s infinite' }} />
                        ))}
                    </div>
                ) : portfolios.length === 0 ? (
                    <div style={{
                        borderRadius: 16, padding: '64px 32px', textAlign: 'center',
                        background: '#0d1524',
                    }}>
                        <Wallet size={36} style={{ color: '#3a5c7a', margin: '0 auto 12px' }} />
                        <p style={{ color: '#4a6080', fontSize: 14, margin: '0 0 16px' }}>
                            No trading accounts yet.
                        </p>
                        <Button onClick={() => handleOpenDialog()} className="btn-fx" style={{ border: 'none', gap: 6 }}>
                            <Plus size={15} /> Create your first account
                        </Button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {portfolios.map(p => (
                            <AccountRow
                                key={p.id}
                                portfolio={p}
                                onEdit={handleOpenDialog}
                                onDelete={(id) => deletePortfolio.mutate(id)}
                                isDeleting={deletePortfolio.isPending}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* ─── Dialog ──────────────────────────────────────────────────── */}
            <PortfolioDialog
                open={dialogOpen}
                onOpenChange={handleCloseDialog}
                portfolio={editingPortfolio}
                onSubmit={handleSubmit}
                isLoading={createPortfolio.isPending || updatePortfolio.isPending}
            />
        </div>
    );
}
