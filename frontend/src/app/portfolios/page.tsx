'use client';

import { useState } from 'react';
import { PortfoliosList } from '@/components/portfolios-list';
import { PortfolioDialog, PortfolioFormData } from '@/components/portfolios-dialog';
import {
    usePortfolios,
    useCreatePortfolio,
    useUpdatePortfolio,
    useDeletePortfolio,
} from '@/hooks/use-portfolios';
import { Button } from '@/components/ui/button';
import { Plus, Briefcase } from 'lucide-react';
import { Portfolio } from '@/types/types';

export default function PortfoliosPage() {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingPortfolio, setEditingPortfolio] = useState<Portfolio | undefined>();
    const { data: portfolios, isLoading } = usePortfolios();
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

    if (isLoading) {
        return (
            <div className="page-container space-y-8">
                <div className="h-8 w-40 rounded-lg animate-pulse" style={{ background: '#0d1524' }} />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-56 rounded-xl animate-pulse" style={{ background: '#0d1524' }} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="page-container space-y-8">
            <div className="flex items-center justify-between animate-slide-up">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Briefcase size={14} style={{ color: '#3a5c7a' }} />
                        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#3a5c7a', letterSpacing: '0.14em' }}>
                            Accounts
                        </span>
                    </div>
                    <h1 className="text-3xl font-bold" style={{ color: '#c8ddef', letterSpacing: '-0.02em' }}>
                        Trading Accounts
                    </h1>
                    <p className="mt-1 text-sm" style={{ color: '#4a6080' }}>
                        Manage your brokers, live accounts, demo accounts, and prop firm challenges.
                    </p>
                </div>
                <Button
                    onClick={() => handleOpenDialog()}
                    className="btn-fx"
                    style={{ border: 'none', gap: '6px' }}
                >
                    <Plus size={16} />
                    New Account
                </Button>
            </div>

            <PortfoliosList
                portfolios={portfolios || []}
                onEdit={handleOpenDialog}
                onDelete={(id) => deletePortfolio.mutate(id)}
                isDeleting={deletePortfolio.isPending}
            />

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
