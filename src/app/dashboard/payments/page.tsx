'use client';

import { useState, useEffect, useCallback } from 'react';  // Ajout de useEffect
import Link from 'next/link';
import PaymentsTable from '@/components/payments/PaymentsTable';
import paymentService from '@/services/paymentService';
import { formatCurrency } from '@/components/invoices/InvoiceStatusBadge';

/**
 * Page principale des paiements
 */
export default function PaymentsPage() {
    // État pour suivre si la liste est en train d'être actualisée
    const [isRefreshing, setIsRefreshing] = useState(false);

    // États pour les statistiques
    const [stats, setStats] = useState<{
        totalAmount: number;
        totalCount: number;
        methodBreakdown: Record<string, { count: number; total: number }>;
    } | null>(null);

    const [statsLoading, setStatsLoading] = useState(true);
    const [statsError, setStatsError] = useState<string | null>(null);
    const [statsPeriod, setStatsPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');

    // Charger les statistiques au montage du composant
    const loadStats = useCallback(async () => {
        try {
            setStatsLoading(true);
            setStatsError(null);

            const data = await paymentService.getPaymentStats(statsPeriod);
            setStats(data);
        } catch (error) {
            console.error('Erreur lors du chargement des statistiques:', error);
            setStatsError('Impossible de charger les statistiques. Veuillez réessayer.');
        } finally {
            setStatsLoading(false);
        }
    }, [statsPeriod]); // Dépendance à statsPeriod

    // Maintenant ajoutons loadStats comme dépendance du useEffect
    useEffect(() => {
        loadStats();
    }, [loadStats]);  // Ajout de loadStats comme dépendance

    // Fonction pour actualiser la liste des paiements
    const handleRefresh = async () => {
        setIsRefreshing(true);

        // Recharger également les statistiques
        await loadStats();

        // Simuler un délai pour l'actualisation
        setTimeout(() => {
            setIsRefreshing(false);
            window.location.reload();
        }, 1000);
    };


    // Charger les statistiques lors du changement de période
    const handlePeriodChange = async (period: 'day' | 'week' | 'month' | 'year') => {
        setStatsPeriod(period);

        try {
            setStatsLoading(true);
            setStatsError(null);

            const data = await paymentService.getPaymentStats(period);
            console.log('Statistiques pour période', period, ':', data);  // Log pour le débogage
            setStats(data);
        } catch (error) {
            console.error('Erreur lors du chargement des statistiques:', error);
            setStatsError('Impossible de charger les statistiques. Veuillez réessayer.');
        } finally {
            setStatsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* En-tête de la page */}
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Paiements</h1>
                <p className="text-sm md:text-base text-gray-500">
                    Consultez l&apos;historique des paiements et leurs statistiques
                </p>
            </div>

            {/* Barre d'actions */}
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500">Administration</span>
                    <span className="text-gray-500">/</span>
                    <span className="text-gray-900 font-medium">Paiements</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                        </svg>
                        {isRefreshing ? 'Actualisation...' : 'Actualiser'}
                    </button>

                    <Link
                        href="/dashboard/invoices"
                        className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                        Voir les factures
                    </Link>
                </div>
            </div>

            {/* Statistiques de paiement */}
            <div className="mb-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Statistiques des paiements</h2>

                    {/* Sélecteur de période */}
                    <div className="mt-2 md:mt-0 flex items-center gap-2">
                        <span className="text-sm text-gray-500">Période:</span>
                        <div className="inline-flex rounded-md shadow-sm">
                            <button
                                onClick={() => handlePeriodChange('day')}
                                className={`px-3 py-1 text-sm font-medium rounded-l-md border ${statsPeriod === 'day'
                                        ? 'bg-blue-50 text-blue-700 border-blue-300'
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                Aujourd&apos;hui
                            </button>
                            <button
                                onClick={() => handlePeriodChange('week')}
                                className={`px-3 py-1 text-sm font-medium border-t border-b ${statsPeriod === 'week'
                                        ? 'bg-blue-50 text-blue-700 border-blue-300'
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                Semaine
                            </button>
                            <button
                                onClick={() => handlePeriodChange('month')}
                                className={`px-3 py-1 text-sm font-medium border-t border-b ${statsPeriod === 'month'
                                        ? 'bg-blue-50 text-blue-700 border-blue-300'
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                Mois
                            </button>
                            <button
                                onClick={() => handlePeriodChange('year')}
                                className={`px-3 py-1 text-sm font-medium rounded-r-md border ${statsPeriod === 'year'
                                        ? 'bg-blue-50 text-blue-700 border-blue-300'
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                Année
                            </button>
                        </div>
                    </div>
                </div>

                {/* Cartes des statistiques */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Montant total des paiements */}
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                        {statsLoading ? (
                            <div className="animate-pulse flex flex-col">
                                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                                <div className="h-8 bg-gray-200 rounded w-2/3"></div>
                            </div>
                        ) : statsError ? (
                            <div className="text-sm text-red-500">
                                {statsError}
                                <button
                                    onClick={loadStats}
                                    className="block mt-2 text-blue-600 hover:text-blue-800"
                                >
                                    Réessayer
                                </button>
                            </div>
                        ) : (
                            <>
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Montant total</h3>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatCurrency(stats?.totalAmount || 0)}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    {statsPeriod === 'day' ? "Aujourd'hui" :
                                        statsPeriod === 'week' ? "Cette semaine" :
                                            statsPeriod === 'month' ? "Ce mois-ci" : "Cette année"}
                                </p>
                            </>
                        )}
                    </div>

                    {/* Nombre de paiements */}
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                        {statsLoading ? (
                            <div className="animate-pulse flex flex-col">
                                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                            </div>
                        ) : statsError ? (
                            <div className="text-sm text-red-500">
                                {statsError}
                            </div>
                        ) : (
                            <>
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Nombre de paiements</h3>
                                <p className="text-2xl font-bold text-gray-900">
                                    {stats?.totalCount || 0}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    {statsPeriod === 'day' ? "Aujourd'hui" :
                                        statsPeriod === 'week' ? "Cette semaine" :
                                            statsPeriod === 'month' ? "Ce mois-ci" : "Cette année"}
                                </p>
                            </>
                        )}
                    </div>

                    {/* Méthode la plus utilisée */}
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                        {statsLoading ? (
                            <div className="animate-pulse flex flex-col">
                                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        ) : statsError ? (
                            <div className="text-sm text-red-500">
                                {statsError}
                            </div>
                        ) : (
                            <>
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Méthode la plus utilisée</h3>
                                {stats && Object.keys(stats.methodBreakdown).length > 0 ? (
                                    (() => {
                                        // Trouver la méthode la plus utilisée
                                        const topMethod = Object.entries(stats.methodBreakdown)
                                            .sort((a, b) => b[1].count - a[1].count)[0];

                                        if (topMethod) {
                                            return (
                                                <>
                                                    <p className="text-xl font-bold text-gray-900">
                                                        {paymentService.formatPaymentMethod(topMethod[0])}
                                                    </p>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        {topMethod[1].count} paiement{topMethod[1].count > 1 ? 's' : ''} ({formatCurrency(topMethod[1].total)})
                                                    </p>
                                                </>
                                            );
                                        }

                                        return <p className="text-sm text-gray-500">Aucune donnée disponible</p>;
                                    })()
                                ) : (
                                    <p className="text-sm text-gray-500">Aucune donnée disponible</p>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Titre de section pour tous les paiements */}
            <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Historique des paiements</h2>
                <p className="text-sm text-gray-500 mt-1">
                    Liste complète de tous les paiements enregistrés
                </p>
            </div>

            {/* Tableau des paiements */}
            <PaymentsTable />

            {/* Section d'aide */}
            <div className="mt-12 bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                        Gestion des paiements
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-2">
                                Comprendre cette page
                            </h3>
                            <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5">
                                <li>Les statistiques affichent une vue d&apos;ensemble des paiements pour la période sélectionnée</li>
                                <li>Le tableau liste tous les paiements avec leurs détails (date, client, méthode, montant)</li>
                                <li>Vous pouvez filtrer les paiements par méthode ou période dans le tableau</li>
                                <li>Cliquez sur le numéro de facture ou -- Voir la facture -- pour accéder aux détails de la facture associée</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-2">
                                Méthodes de paiement
                            </h3>
                            <ul className="text-sm text-gray-600 space-y-2">
                                <li><span className="inline-block w-3 h-3 rounded-full bg-blue-500 mr-2"></span><strong>Wave</strong> - Paiements mobiles via Wave</li>
                                <li><span className="inline-block w-3 h-3 rounded-full bg-yellow-500 mr-2"></span><strong>Mobile Money</strong> - MTN Mobile Money</li>
                                <li><span className="inline-block w-3 h-3 rounded-full bg-orange-500 mr-2"></span><strong>Orange Money</strong> - Paiements via Orange Money</li>
                                <li><span className="inline-block w-3 h-3 rounded-full bg-indigo-500 mr-2"></span><strong>Zeepay</strong> - Transferts via Zeepay</li>
                                <li><span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2"></span><strong>Espèces</strong> - Paiements en espèces</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}