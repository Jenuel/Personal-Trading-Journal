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
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {formData.type === 'DEPOSIT' ? 'Deposit Funds' : 'Withdraw Funds'}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="type">Type</Label>
                        <Select
                            value={formData.type}
                            onValueChange={(value) =>
                                setFormData({ ...formData, type: value as 'DEPOSIT' | 'WITHDRAWAL' })
                            }
                        >
                            <SelectTrigger id="type">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="DEPOSIT">Deposit</SelectItem>
                                <SelectItem value="WITHDRAWAL">Withdrawal</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="amount">Amount</Label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            value={formData.amount}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    amount: parseFloat(e.target.value) || 0,
                                })
                            }
                            placeholder="0.00"
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="date">Date</Label>
                        <Input
                            id="date"
                            type="date"
                            value={formData.date}
                            onChange={(e) =>
                                setFormData({ ...formData, date: e.target.value })
                            }
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) =>
                                setFormData({ ...formData, notes: e.target.value })
                            }
                            placeholder="Add notes about this transaction"
                            className="resize-none"
                            rows={3}
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {formData.type === 'DEPOSIT' ? 'Deposit' : 'Withdraw'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
