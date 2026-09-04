'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Portfolio, AccountCurrency, AccountType } from '@/types/types';

const CURRENCIES: AccountCurrency[] = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD'];
const ACCOUNT_TYPES: { value: AccountType; label: string }[] = [
    { value: 'LIVE', label: '🟢 Live' },
    { value: 'DEMO', label: '⚪ Demo' },
    { value: 'PROP', label: '🟡 Prop Firm' },
];

export interface PortfolioFormData {
    name: string;
    description?: string;
    initialBalance: number;
    currency: AccountCurrency;
    broker?: string;
    accountType: AccountType;
}

interface PortfolioDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    portfolio?: Portfolio;
    onSubmit: (data: PortfolioFormData) => void;
    isLoading?: boolean;
}

export function PortfolioDialog({
    open,
    onOpenChange,
    portfolio,
    onSubmit,
    isLoading,
}: PortfolioDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="max-w-md"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
                <DialogHeader>
                    <DialogTitle style={{ color: 'var(--foreground)', fontSize: '16px', fontWeight: 700 }}>
                        {portfolio ? 'Edit Account' : 'New Trading Account'}
                    </DialogTitle>
                </DialogHeader>

                {/* Radix unmounts DialogContent when closed, so the form remounts
                    with fresh state on each open — no reset effect needed. */}
                <PortfolioForm
                    portfolio={portfolio}
                    onSubmit={onSubmit}
                    onClose={() => onOpenChange(false)}
                    isLoading={isLoading}
                />
            </DialogContent>
        </Dialog>
    );
}

interface PortfolioFormProps {
    portfolio?: Portfolio;
    onSubmit: (data: PortfolioFormData) => void;
    onClose: () => void;
    isLoading?: boolean;
}

function PortfolioForm({ portfolio, onSubmit, onClose, isLoading }: PortfolioFormProps) {
    const [form, setForm] = useState({
        name: portfolio?.name || '',
        description: portfolio?.description || '',
        initialBalance: portfolio?.initialBalance || 10000,
        currency: portfolio?.currency || ('USD' as AccountCurrency),
        broker: portfolio?.broker || '',
        accountType: portfolio?.accountType || ('LIVE' as AccountType),
    });

    const isEdit = !!portfolio;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            name: form.name,
            description: form.description || undefined,
            initialBalance: form.initialBalance,
            currency: form.currency,
            broker: form.broker || undefined,
            accountType: form.accountType,
        });
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="name" className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Account Name
                </Label>
                <Input
                    id="name"
                    value={form.name}
                    onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. IC Markets Live"
                    required
                    className="mt-1"
                    style={{ background: 'var(--input)', borderColor: 'var(--border)' }}
                />
            </div>

            <div>
                <Label className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Account Type
                </Label>
                <div className="mt-1 flex gap-2">
                    {ACCOUNT_TYPES.map(t => (
                        <button
                            key={t.value}
                            type="button"
                            onClick={() => setForm(prev => ({ ...prev, accountType: t.value }))}
                            className="flex-1 py-2 px-3 rounded-lg border text-sm font-semibold transition-all"
                            style={{
                                background: form.accountType === t.value ? 'var(--primary)' : 'var(--input)',
                                color: form.accountType === t.value ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                                borderColor: form.accountType === t.value ? 'var(--primary)' : 'var(--border)',
                            }}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <Label htmlFor="broker" className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        Broker
                    </Label>
                    <Input
                        id="broker"
                        value={form.broker}
                        onChange={e => setForm(prev => ({ ...prev, broker: e.target.value }))}
                        placeholder="e.g. IC Markets"
                        className="mt-1"
                        style={{ background: 'var(--input)', borderColor: 'var(--border)' }}
                    />
                </div>
                <div>
                    <Label className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        Currency
                    </Label>
                    <Select
                        value={form.currency}
                        onValueChange={v => setForm(prev => ({ ...prev, currency: v as AccountCurrency }))}
                    >
                        <SelectTrigger className="mt-1" style={{ background: 'var(--input)', borderColor: 'var(--border)' }}>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent style={{ background: 'var(--popover)', borderColor: 'var(--border)' }}>
                            {CURRENCIES.map(c => (
                                <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div>
                <Label htmlFor="initialBalance" className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Initial Balance ({form.currency})
                </Label>
                <Input
                    id="initialBalance"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.initialBalance}
                    onChange={e => setForm(prev => ({ ...prev, initialBalance: parseFloat(e.target.value) || 0 }))}
                    className="mt-1 font-mono"
                    placeholder="10000.00"
                    required
                    disabled={isEdit}
                    style={{ background: 'var(--input)', borderColor: 'var(--border)' }}
                />
                {isEdit && (
                    <p className="mt-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        Initial balance cannot be changed after creation.
                    </p>
                )}
            </div>

            <div>
                <Label htmlFor="description" className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Notes (optional)
                </Label>
                <Textarea
                    id="description"
                    value={form.description}
                    onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Account notes, goals, strategy..."
                    className="mt-1 resize-none"
                    rows={2}
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
                    {isEdit ? 'Update Account' : 'Create Account'}
                </Button>
            </DialogFooter>
        </form>
    );
}
