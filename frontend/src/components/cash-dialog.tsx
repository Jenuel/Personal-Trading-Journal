'use client';

import { useState } from 'react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface CashDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    portfolioId: string;
    defaultType?: 'DEPOSIT' | 'WITHDRAWAL';
    onSubmit: (data: {
        portfolioId: string;
        type: 'DEPOSIT' | 'WITHDRAWAL';
        amount: number;
        date: string;
        notes?: string;
    }) => void;
    isLoading?: boolean;
}

export function CashDialog({
    open,
    onOpenChange,
    portfolioId,
    defaultType = 'DEPOSIT',
    onSubmit,
    isLoading,
}: CashDialogProps) {
    const [formData, setFormData] = useState({
        type: defaultType as 'DEPOSIT' | 'WITHDRAWAL',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        notes: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            portfolioId,
        });
        setFormData({
            type: defaultType,
            amount: 0,
            date: new Date().toISOString().split('T')[0],
            notes: '',
        });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="max-w-md"
                style={{
                    background: '#0d1524',
                    border: 'none',
                    boxShadow: '0 24px 64px rgba(0, 0, 0, 0.6)',
                }}
            >
                <DialogHeader>
                    <DialogTitle>
                        <span style={{ fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.14em', color: '#3a5c7a', display: 'block', marginBottom: '2px', fontWeight: 600 }}>
                            Cash Transaction
                        </span>
                        <span style={{ fontSize: '17px', fontWeight: 700, color: '#c8ddef' }}>
                            {formData.type === 'DEPOSIT' ? 'Deposit Funds' : 'Withdraw Funds'}
                        </span>
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        {formData.type === 'DEPOSIT' ? 'Record a deposit into your trading account.' : 'Record a withdrawal from your trading account.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label className="text-xs font-semibold" style={{ color: '#4a6080', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            Transaction Type
                        </Label>
                        <div className="mt-1 flex rounded-lg overflow-hidden" style={{ background: '#0b1220' }}>
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, type: 'DEPOSIT' }))}
                                className="flex-1 py-2 text-sm font-bold transition-all"
                                style={{
                                    background: formData.type === 'DEPOSIT' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                                    color: formData.type === 'DEPOSIT' ? '#34d399' : '#4a6080',
                                    border: 'none',
                                }}
                            >
                                Deposit
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, type: 'WITHDRAWAL' }))}
                                className="flex-1 py-2 text-sm font-bold transition-all"
                                style={{
                                    background: formData.type === 'WITHDRAWAL' ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                                    color: formData.type === 'WITHDRAWAL' ? '#f87171' : '#4a6080',
                                    border: 'none',
                                }}
                            >
                                Withdrawal
                            </button>
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="amount" className="text-xs font-semibold" style={{ color: '#4a6080', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            Amount
                        </Label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            value={formData.amount || ''}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    amount: parseFloat(e.target.value) || 0,
                                })
                            }
                            placeholder="0.00"
                            required
                            className="mt-1 font-mono"
                            style={{ background: '#0b1220', border: 'none', color: '#c8ddef' }}
                        />
                    </div>

                    <div>
                        <Label htmlFor="date" className="text-xs font-semibold" style={{ color: '#4a6080', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            Date
                        </Label>
                        <Input
                            id="date"
                            type="date"
                            value={formData.date}
                            onChange={(e) =>
                                setFormData({ ...formData, date: e.target.value })
                            }
                            required
                            className="mt-1"
                            style={{ background: '#0b1220', border: 'none', color: '#c8ddef' }}
                        />
                    </div>

                    <div>
                        <Label htmlFor="notes" className="text-xs font-semibold" style={{ color: '#4a6080', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            Notes
                        </Label>
                        <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) =>
                                setFormData({ ...formData, notes: e.target.value })
                            }
                            placeholder="Add notes about this transaction"
                            className="mt-1 resize-none"
                            rows={3}
                            style={{ background: '#0b1220', border: 'none', color: '#c8ddef' }}
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                            style={{ background: '#111d30', border: 'none', color: '#8fa8c4' }}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading} className="btn-fx" style={{ border: 'none' }}>
                            {formData.type === 'DEPOSIT' ? 'Deposit' : 'Withdraw'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
