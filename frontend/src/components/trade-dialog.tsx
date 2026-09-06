'use client';

import { useState, useMemo } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    ForexTrade,
    MAJOR_PAIRS,
    MINOR_PAIRS,
    EXOTIC_PAIRS,
    FxSession,
    TradeDirection,
    TradeOutcome,
} from '@/types/types';
import { calculatePips, estimatePL, formatPips } from '@/lib/portfolio-utils';
import { TrendingUp, TrendingDown, ChevronDown } from 'lucide-react';

const SESSIONS: { value: FxSession; label: string; color: string }[] = [
    { value: 'LONDON', label: 'London', color: 'session-london' },
    { value: 'NEW_YORK', label: 'New York', color: 'session-ny' },
    { value: 'TOKYO', label: 'Tokyo', color: 'session-tokyo' },
    { value: 'SYDNEY', label: 'Sydney', color: 'session-sydney' },
    { value: 'OVERLAP', label: 'Overlap', color: 'session-overlap' },
];

const QUICK_SETUPS = [
    'Break & Retest', 'ICT Order Block', 'Demand/Supply Zone',
    'London Open Grab', 'NY Reversal', 'H&S Pattern',
    'Double Top/Bottom', 'Breakout', 'Trend Continuation',
];

interface TradeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    portfolioId: string;
    onSubmit: (data: Omit<ForexTrade, 'id' | 'createdAt'>) => void;
    isLoading?: boolean;
    editTrade?: ForexTrade;
}

interface TradeFormState {
    pair: string;
    direction: TradeDirection;
    lots: number;
    entryPrice: number;
    exitPrice?: number;
    stopLoss?: number;
    takeProfit?: number;
    session?: FxSession;
    setup: string;
    date: string;
    notes: string;
}

function buildInitialForm(editTrade?: ForexTrade): TradeFormState {
    return {
        pair: editTrade?.pair ?? 'EURUSD',
        direction: editTrade?.direction ?? 'LONG',
        lots: editTrade?.lots ?? 0.1,
        entryPrice: editTrade?.entryPrice ?? 0,
        exitPrice: editTrade?.exitPrice,
        stopLoss: editTrade?.stopLoss,
        takeProfit: editTrade?.takeProfit,
        session: editTrade?.session,
        setup: editTrade?.setup ?? '',
        date: (editTrade?.date ?? new Date().toISOString()).split('T')[0],
        notes: editTrade?.notes ?? '',
    };
}

export function TradeDialog({
    open,
    onOpenChange,
    portfolioId,
    onSubmit,
    isLoading,
    editTrade,
}: TradeDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="max-w-lg"
                style={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                }}
            >
                <DialogHeader>
                    <DialogTitle style={{ color: 'var(--foreground)', fontSize: '16px', fontWeight: 700 }}>
                        {editTrade ? 'Edit Trade' : 'Log FOREX Trade'}
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        {editTrade ? 'Edit the details of your existing trade.' : 'Log a new FOREX trade into your journal.'}
                    </DialogDescription>
                </DialogHeader>

                {/* Radix unmounts DialogContent when closed, so the form remounts
                    with fresh state on each open — no reset effect needed. */}
                <TradeForm
                    portfolioId={portfolioId}
                    editTrade={editTrade}
                    onSubmit={onSubmit}
                    onClose={() => onOpenChange(false)}
                    isLoading={isLoading}
                />
            </DialogContent>
        </Dialog>
    );
}

interface TradeFormProps {
    portfolioId: string;
    editTrade?: ForexTrade;
    onSubmit: (data: Omit<ForexTrade, 'id' | 'createdAt'>) => void;
    onClose: () => void;
    isLoading?: boolean;
}

function TradeForm({ portfolioId, editTrade, onSubmit, onClose, isLoading }: TradeFormProps) {
    const [form, setForm] = useState(() => buildInitialForm(editTrade));
    const [pairSearch, setPairSearch] = useState('');
    const [pairOpen, setPairOpen] = useState(false);

    const calc = useMemo(() => {
        if (!form.entryPrice || !form.exitPrice || form.exitPrice <= 0) return null;

        const pips = calculatePips(form.pair, form.direction, form.entryPrice, form.exitPrice);
        const result = estimatePL(form.pair, form.lots, pips);

        let rr: number | undefined;
        if (form.stopLoss && form.takeProfit) {
            const slPips = calculatePips(form.pair, form.direction, form.entryPrice, form.stopLoss);
            const tpPips = calculatePips(form.pair, form.direction, form.entryPrice, form.takeProfit);
            if (slPips !== 0) rr = Math.abs(tpPips / slPips);
        }

        const outcome: TradeOutcome = pips > 0.5 ? 'WIN' : pips < -0.5 ? 'LOSS' : 'BE';

        return { pips, result, rr, outcome };
    }, [form.entryPrice, form.exitPrice, form.stopLoss, form.takeProfit, form.lots, form.pair, form.direction]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            portfolioId,
            pair: form.pair,
            direction: form.direction,
            lots: form.lots,
            entryPrice: form.entryPrice,
            exitPrice: form.exitPrice,
            stopLoss: form.stopLoss,
            takeProfit: form.takeProfit,
            pips: calc?.pips,
            result: calc?.result,
            rr: calc?.rr,
            outcome: calc?.outcome,
            session: form.session,
            setup: form.setup || undefined,
            date: form.date,
            notes: form.notes || undefined,
        });
        onClose();
    };

    const allPairs = [
        ...MAJOR_PAIRS.map(p => ({ pair: p, group: 'Majors' })),
        ...MINOR_PAIRS.map(p => ({ pair: p, group: 'Minors' })),
        ...EXOTIC_PAIRS.map(p => ({ pair: p, group: 'Exotics' })),
    ];

    const filteredPairs = pairSearch
        ? allPairs.filter(p => p.pair.toLowerCase().includes(pairSearch.toLowerCase()))
        : allPairs;

    const isLong = form.direction === 'LONG';

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                    <Label className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        Pair
                    </Label>
                    <button
                        type="button"
                        onClick={() => setPairOpen(!pairOpen)}
                        className="mt-1 w-full flex items-center justify-between px-3 py-2 rounded-lg border text-sm font-mono font-bold"
                        style={{ background: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                    >
                        {form.pair}
                        <ChevronDown size={14} />
                    </button>
                    {pairOpen && (
                        <div
                            className="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg border overflow-hidden"
                            style={{ background: 'var(--popover)', borderColor: 'var(--border)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
                        >
                            <div className="p-2 border-b" style={{ borderColor: 'var(--border)' }}>
                                <input
                                    autoFocus
                                    value={pairSearch}
                                    onChange={e => setPairSearch(e.target.value)}
                                    placeholder="Search pairs..."
                                    className="w-full px-2 py-1 text-sm rounded"
                                    style={{ background: 'var(--input)', border: '1px solid var(--border)', color: 'var(--foreground)', outline: 'none' }}
                                />
                            </div>
                            <div className="max-h-48 overflow-y-auto">
                                {filteredPairs.map(({ pair, group }) => (
                                    <button
                                        key={pair}
                                        type="button"
                                        onClick={() => { setForm(prev => ({ ...prev, pair })); setPairOpen(false); setPairSearch(''); }}
                                        className="w-full text-left px-3 py-2 text-sm font-mono hover:bg-muted/50 flex justify-between items-center"
                                        style={{
                                            background: form.pair === pair ? 'var(--accent)' : undefined,
                                            color: form.pair === pair ? 'var(--accent-foreground)' : 'var(--foreground)',
                                        }}
                                    >
                                        {pair}
                                        <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{group}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div>
                    <Label className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        Direction
                    </Label>
                    <div className="mt-1 flex rounded-lg overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
                        <button
                            type="button"
                            onClick={() => setForm(prev => ({ ...prev, direction: 'LONG' }))}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-bold transition-all"
                            style={{
                                background: isLong ? 'oklch(0.72 0.19 155 / 0.2)' : 'var(--input)',
                                color: isLong ? 'var(--fx-profit)' : 'var(--muted-foreground)',
                                borderRight: '1px solid var(--border)',
                            }}
                        >
                            <TrendingUp size={14} />
                            LONG
                        </button>
                        <button
                            type="button"
                            onClick={() => setForm(prev => ({ ...prev, direction: 'SHORT' }))}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-bold transition-all"
                            style={{
                                background: !isLong ? 'oklch(0.65 0.22 25 / 0.2)' : 'var(--input)',
                                color: !isLong ? 'var(--fx-loss)' : 'var(--muted-foreground)',
                            }}
                        >
                            <TrendingDown size={14} />
                            SHORT
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <Label htmlFor="lots" className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        Lots
                    </Label>
                    <Input
                        id="lots"
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={form.lots}
                        onChange={e => setForm(prev => ({ ...prev, lots: parseFloat(e.target.value) || 0.01 }))}
                        className="mt-1 font-mono"
                        placeholder="0.10"
                        required
                        style={{ background: 'var(--input)', borderColor: 'var(--border)' }}
                    />
                </div>
                <div>
                    <Label htmlFor="date" className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        Date
                    </Label>
                    <Input
                        id="date"
                        type="date"
                        value={form.date}
                        onChange={e => setForm(prev => ({ ...prev, date: e.target.value }))}
                        className="mt-1"
                        required
                        style={{ background: 'var(--input)', borderColor: 'var(--border)' }}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <Label htmlFor="entryPrice" className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        Entry Price
                    </Label>
                    <Input
                        id="entryPrice"
                        type="number"
                        step="0.00001"
                        value={form.entryPrice || ''}
                        onChange={e => setForm(prev => ({ ...prev, entryPrice: parseFloat(e.target.value) || 0 }))}
                        className="mt-1 font-mono"
                        placeholder="1.08450"
                        required
                        style={{ background: 'var(--input)', borderColor: 'var(--border)' }}
                    />
                </div>
                <div>
                    <Label htmlFor="exitPrice" className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        Exit Price
                    </Label>
                    <Input
                        id="exitPrice"
                        type="number"
                        step="0.00001"
                        value={form.exitPrice || ''}
                        onChange={e => setForm(prev => ({ ...prev, exitPrice: parseFloat(e.target.value) || undefined }))}
                        className="mt-1 font-mono"
                        placeholder="1.09120"
                        style={{ background: 'var(--input)', borderColor: 'var(--border)' }}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <Label htmlFor="stopLoss" className="text-xs font-semibold" style={{ color: 'var(--fx-loss)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        Stop Loss
                    </Label>
                    <Input
                        id="stopLoss"
                        type="number"
                        step="0.00001"
                        value={form.stopLoss || ''}
                        onChange={e => setForm(prev => ({ ...prev, stopLoss: parseFloat(e.target.value) || undefined }))}
                        className="mt-1 font-mono"
                        placeholder="1.08100"
                        style={{ background: 'var(--input)', borderColor: 'oklch(0.65 0.22 25 / 0.4)' }}
                    />
                </div>
                <div>
                    <Label htmlFor="takeProfit" className="text-xs font-semibold" style={{ color: 'var(--fx-profit)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        Take Profit
                    </Label>
                    <Input
                        id="takeProfit"
                        type="number"
                        step="0.00001"
                        value={form.takeProfit || ''}
                        onChange={e => setForm(prev => ({ ...prev, takeProfit: parseFloat(e.target.value) || undefined }))}
                        className="mt-1 font-mono"
                        placeholder="1.09200"
                        style={{ background: 'var(--input)', borderColor: 'oklch(0.72 0.19 155 / 0.4)' }}
                    />
                </div>
            </div>

            {calc && (
                <div
                    className="rounded-lg px-4 py-3 text-sm animate-slide-up"
                    style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
                >
                    <p className="text-xs font-semibold mb-2" style={{ color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        Auto-Calculated
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Pips</p>
                            <p className="font-mono font-bold text-sm" style={{ color: calc.pips >= 0 ? 'var(--fx-profit)' : 'var(--fx-loss)' }}>
                                {formatPips(calc.pips)}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Est. P&L</p>
                            <p className="font-mono font-bold text-sm" style={{ color: calc.result >= 0 ? 'var(--fx-profit)' : 'var(--fx-loss)' }}>
                                {`$${calc.result.toFixed(2)}`}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>R:R</p>
                            <p className="font-mono font-bold text-sm" style={{ color: 'var(--fx-accent)' }}>
                                {calc.rr !== undefined ? `${calc.rr.toFixed(2)}R` : '—'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div>
                <Label className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Session
                </Label>
                <div className="mt-2 flex flex-wrap gap-2">
                    {SESSIONS.map(s => (
                        <button
                            key={s.value}
                            type="button"
                            onClick={() => setForm(prev => ({
                                ...prev,
                                session: prev.session === s.value ? undefined : s.value,
                            }))}
                            className={`session-pill ${s.color} cursor-pointer transition-all`}
                            style={{
                                opacity: form.session && form.session !== s.value ? 0.4 : 1,
                                fontWeight: form.session === s.value ? 700 : 600,
                            }}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <Label htmlFor="setup" className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Setup / Strategy
                </Label>
                <Input
                    id="setup"
                    value={form.setup}
                    onChange={e => setForm(prev => ({ ...prev, setup: e.target.value }))}
                    placeholder="e.g. Break & Retest, ICT Order Block..."
                    className="mt-1"
                    style={{ background: 'var(--input)', borderColor: 'var(--border)' }}
                />
                <div className="mt-1.5 flex flex-wrap gap-1">
                    {QUICK_SETUPS.slice(0, 5).map(s => (
                        <button
                            key={s}
                            type="button"
                            onClick={() => setForm(prev => ({ ...prev, setup: s }))}
                            className="text-xs px-2 py-0.5 rounded"
                            style={{
                                background: form.setup === s ? 'var(--primary)' : 'var(--muted)',
                                color: form.setup === s ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                                border: '1px solid var(--border)',
                            }}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <Label htmlFor="notes" className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Notes
                </Label>
                <Textarea
                    id="notes"
                    value={form.notes}
                    onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Trade reasoning, market context, mistakes..."
                    className="mt-1 resize-none"
                    rows={3}
                    style={{ background: 'var(--input)', borderColor: 'var(--border)' }}
                />
            </div>

            <DialogFooter>
                <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={isLoading}
                    style={{ borderColor: 'var(--border)' }}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="btn-fx"
                    style={{ border: 'none' }}
                >
                    {editTrade ? 'Update Trade' : 'Log Trade'}
                </Button>
            </DialogFooter>
        </form>
    );
}
