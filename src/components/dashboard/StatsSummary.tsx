'use client';

import { useState, useEffect } from 'react';
import dashboardService from '@/services/dashboardService';

/**
 * Composant affichant une carte de statistique individuelle
 */
const StatCard = ({
    title,
    value,
    icon,
    color,
    isLoading,
    error,
    suffix = '',
    prefix = ''
}: {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    color: string;
    isLoading: boolean;
    error: string | null;
    suffix?: string;
    prefix?: string;
}) => {
    // Rendu différent selon l'état (chargement, erreur, données)
    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="animate-pulse flex items-center space-x-2 h-8">
                    <div className="bg-gray-200 h-8 w-16 rounded"></div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="text-red-500 text-sm">
                    Erreur de chargement
                </div>
            );
        }

        return (
            <div className="text-2xl font-bold text-gray-800">
                {prefix}{value}{suffix}
            </div>
        );
    };

    return (
        <div className={`bg-white rounded-xl border p-6 hover:shadow-md transition-shadow`}>
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${color} text-white`}>
                    {icon}
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

/**
 * Composant de résumé des statistiques pour le tableau de bord
 */
export default function StatsSummary() {
    // États pour les différentes statistiques
    const [pendingRequests, setPendingRequests] = useState<number>(0);
    const [pendingRequestsLoading, setPendingRequestsLoading] = useState<boolean>(true);
    const [pendingRequestsError, setPendingRequestsError] = useState<string | null>(null);

    const [unpaidInvoices, setUnpaidInvoices] = useState<number>(0);
    const [unpaidInvoicesLoading, setUnpaidInvoicesLoading] = useState<boolean>(true);
    const [unpaidInvoicesError, setUnpaidInvoicesError] = useState<string | null>(null);

    const [recentPayments, setRecentPayments] = useState<{ totalAmount: number; count: number }>({ totalAmount: 0, count: 0 });
    const [recentPaymentsLoading, setRecentPaymentsLoading] = useState<boolean>(true);
    const [recentPaymentsError, setRecentPaymentsError] = useState<string | null>(null);

    // Chargement des données au montage du composant
    useEffect(() => {
        const loadStats = async () => {
            try {
                // Demandes en attente
                setPendingRequestsLoading(true);
                const pendingRequestsCount = await dashboardService.getPendingRequestsCount();
                setPendingRequests(pendingRequestsCount);
                setPendingRequestsLoading(false);
            } catch (error) {
                setPendingRequestsError(error instanceof Error ? error.message : 'Erreur inconnue');
                setPendingRequestsLoading(false);
            }

            try {
                // Factures impayées
                setUnpaidInvoicesLoading(true);
                const unpaidInvoicesCount = await dashboardService.getUnpaidInvoicesCount();
                setUnpaidInvoices(unpaidInvoicesCount);
                setUnpaidInvoicesLoading(false);
            } catch (error) {
                setUnpaidInvoicesError(error instanceof Error ? error.message : 'Erreur inconnue');
                setUnpaidInvoicesLoading(false);
            }

            try {
                // Paiements récents
                setRecentPaymentsLoading(true);
                const paymentsStats = await dashboardService.getRecentPaymentsStats();
                setRecentPayments(paymentsStats);
                setRecentPaymentsLoading(false);
            } catch (error) {
                setRecentPaymentsError(error instanceof Error ? error.message : 'Erreur inconnue');
                setRecentPaymentsLoading(false);
            }
        };

        loadStats();
    }, []);

    // Formatage du montant en devise
    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF',
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Carte des demandes en attente */}
            <StatCard
                title="Demandes en attente"
                value={pendingRequests}
                icon={
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                }
                color="bg-blue-600"
                isLoading={pendingRequestsLoading}
                error={pendingRequestsError}
            />

            {/* Carte des factures impayées */}
            <StatCard
                title="Factures impayées"
                value={unpaidInvoices}
                icon={
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                }
                color="bg-yellow-500"
                isLoading={unpaidInvoicesLoading}
                error={unpaidInvoicesError}
            />

            {/* Carte des paiements du mois */}
            <StatCard
                title="Paiements du mois"
                value={formatCurrency(recentPayments.totalAmount)}
                icon={
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                }
                color="bg-green-500"
                isLoading={recentPaymentsLoading}
                error={recentPaymentsError}
            />
        </div>
    );
}