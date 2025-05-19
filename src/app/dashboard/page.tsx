'use client';

import StatsSummary from '@/components/dashboard/StatsSummary';
import RecentActivities from '@/components/dashboard/RecentActivities';
import RequestsByStatusChart from '@/components/dashboard/RequestsByStatusChart';
import PaymentsByMethodChart from '@/components/dashboard/PaymentsByMethodChart';
import ActivityTimeSeriesChart from '@/components/dashboard/ActivityTimeSeriesChart';

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            {/* En-tête */}
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Tableau de bord</h1>
                <p className="text-sm md:text-base text-gray-500">Gérez les demandes, factures et paiements</p>
            </div>

            {/* Barre d'actions */}
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500">Administration</span>
                    <span className="text-gray-500">/</span>
                    <span className="text-gray-900 font-medium">Tableau de bord</span>
                </div>
                <div className="flex gap-2">
                    <button className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Exporter
                    </button>
                    <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Créer une demande
                    </button>
                </div>
            </div>

            {/* Résumé statistique */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Résumé statistique</h2>
                <StatsSummary />
            </div>

            {/* Visualisations */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Visualisations</h2>

                {/* Graphique des 7 derniers jours */}
                <div className="mb-6">
                    <ActivityTimeSeriesChart />
                </div>

                {/* Graphiques en 2 colonnes pour écrans plus grands */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Demandes par statut */}
                    <RequestsByStatusChart />

                    {/* Paiements par méthode */}
                    <PaymentsByMethodChart />
                </div>
            </div>

            {/* Activité récente */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Activité récente</h2>
                <RecentActivities />
            </div>
        </div>
    );
}