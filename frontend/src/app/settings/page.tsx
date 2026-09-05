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
    LIVE: { bg: 'rgba(16,185,129,0.14)', color: '#10b981' },
    DEMO: { bg: 'rgba(123,143,168,0.14)', color: '#7b8fa8' },
    PROP: { bg: 'rgba(245,158,11,0.14)', color: '#f59e0b' },
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
            background: '#141824',
            border: '1px solid #2a3347',
            borderRadius: 12,
            padding: '16px 20px',
            transition: 'border-color 0.2s',
        }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = '#3a4560')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = '#2a3347')}
        >
            {/* Color dot */}
            <div style={{
                width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                background: typeStyle.color,
                boxShadow: `0 0 6px ${typeStyle.color}80`,
            }} />

            {/* Account info */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {portfolio.name}
                    </span>
                    <span style={{
                        fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 4,
                        background: typeStyle.bg, color: typeStyle.color,
                        textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0,
                    }}>
                        {portfolio.accountType}
                    </span>
                </div>
                <p style={{ color: '#7b8fa8', fontSize: 12, margin: 0 }}>
                    {portfolio.broker ?? '—'} · {portfolio.currency} · {tradeCount} trade{tradeCount !== 1 ? 's' : ''}
                </p>
            </div>

            {/* Balance */}
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ color: '#e2e8f0', fontFamily: 'var(--fx-font-mono)', fontWeight: 700, fontSize: 15, margin: '0 0 2px' }}>
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
            <div style={{ display: 'flex', gap: 4, flexShrink: 0, marginLeft: 8 }}>
                <button
                    onClick={() => onEdit(portfolio)}
                    title="Edit account"
                    style={{
                        background: 'rgba(0,212,255,0.07)', border: '1px solid rgba(0,212,255,0.15)',
                        borderRadius: 7, cursor: 'pointer', color: '#00d4ff',
                        padding: '7px 9px', transition: 'all 0.15s', display: 'flex', alignItems: 'center',
                    }}
                    onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,212,255,0.15)';
                    }}
                    onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,212,255,0.07)';
                    }}
                >
                    <Pencil size={14} />
                </button>
                <button
                    onClick={() => onDelete(portfolio.id)}
                    disabled={isDeleting}
                    title="Delete account"
                    style={{
                        background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.15)',
                        borderRadius: 7, cursor: 'pointer', color: '#ef4444',
                        padding: '7px 9px', transition: 'all 0.15s', display: 'flex', alignItems: 'center',
                        opacity: isDeleting ? 0.5 : 1,
                    }}
                    onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.15)';
                    }}
                    onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.07)';
                    }}
                >
                    <Trash2 size={14} />
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
                        <Settings size={14} style={{ color: 'var(--fx-accent)' }} />
                        <span style={{
                            color: 'var(--fx-accent)', fontSize: 11, fontWeight: 600,
                            textTransform: 'uppercase', letterSpacing: '0.12em',
                        }}>
                            Settings
                        </span>
                    </div>
                    <h1 style={{ color: 'var(--foreground)', fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
                        Manage Accounts
                    </h1>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginTop: 3 }}>
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
                            <div key={i} style={{ height: 74, borderRadius: 12, background: 'var(--muted)', animation: 'pulse 1.5s infinite' }} />
                        ))}
                    </div>
                ) : portfolios.length === 0 ? (
                    <div style={{
                        borderRadius: 16, padding: '64px 32px', textAlign: 'center',
                        border: '2px dashed #2a3347', background: '#141824',
                    }}>
                        <Wallet size={36} style={{ color: '#2a3347', margin: '0 auto 12px' }} />
                        <p style={{ color: '#7b8fa8', fontSize: 14, margin: '0 0 16px' }}>
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
