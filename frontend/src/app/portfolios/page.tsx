'use client';

import { useState } from 'react';
import Nav from '@/components/nav';
import { PortfoliosList } from '@/components/portfolios-list';
import { PortfolioDialog } from '@/components/portfolios-dialog';
import {
    usePortfolios,
    useCreatePortfolio,
    useUpdatePortfolio,
    useDeletePortfolio,
} from '@/hooks/use-portfolios';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus } from 'lucide-react';
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

    const handleSubmit = (data: Parameters<typeof createPortfolio.mutateAsync>[0]) => {
        if (editingPortfolio) {
            updatePortfolio.mutate({
                id: editingPortfolio.id,
                data,
            });
        } else {
            createPortfolio.mutate(data);
        }
        handleCloseDialog();
    };

    if (isLoading) {
        return (
            <div>
                <Nav />
                <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
                    <Skeleton className="h-8 w-32" />
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {[...Array(6)].map((_, i) => (
                            <Skeleton key={i} className="h-64" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Nav />
            <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Portfolios</h1>
                        <p className="text-muted-foreground">
                            Manage your trading accounts and portfolios
                        </p>
                    </div>
                    <Button onClick={() => handleOpenDialog()} size="lg">
                        <Plus className="mr-2 h-4 w-4" />
                        New Portfolio
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
            </main>
        </div>
    );
}
