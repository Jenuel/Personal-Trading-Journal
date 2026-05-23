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
import { Portfolio } from '@/types/types';

interface PortfolioDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    portfolio?: Portfolio;
    onSubmit: (data: {
        name: string;
        description?: string;
        initialBalance: number;
    }) => void;
    isLoading?: boolean;
}

export function PortfolioDialog({
    open,
    onOpenChange,
    portfolio,
    onSubmit,
    isLoading,
}: PortfolioDialogProps) {
    const [formData, setFormData] = useState({
        name: portfolio?.name || '',
        description: portfolio?.description || '',
        initialBalance: portfolio?.initialBalance || 0,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        setFormData({ name: '', description: '', initialBalance: 0 });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {portfolio ? 'Edit Portfolio' : 'Create Portfolio'}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="name">Portfolio Name</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                            }
                            placeholder="e.g., My Trading Account"
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                            placeholder="Add notes about this portfolio"
                            className="resize-none"
                            rows={3}
                        />
                    </div>
                    <div>
                        <Label htmlFor="initialBalance">Initial Balance</Label>
                        <Input
                            id="initialBalance"
                            type="number"
                            step="0.01"
                            value={formData.initialBalance}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    initialBalance: parseFloat(e.target.value) || 0,
                                })
                            }
                            placeholder="0.00"
                            required
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
                            {portfolio ? 'Update' : 'Create'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
