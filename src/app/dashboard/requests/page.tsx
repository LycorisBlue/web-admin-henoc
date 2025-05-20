'use client';

import { useState } from 'react';
import Link from 'next/link';
import RequestsTable from '@/components/requests/RequestsTable';

/**
 * Page principale des demandes clients
 */
export default function RequestsPage() {
    // État pour suivre si la liste est en train d'être actualisée
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Fonction pour actualiser la liste des demandes
    const handleRefresh = async () => {
        setIsRefreshing(true);

        // Simuler un délai pour l'actualisation
        // Dans un cas réel, vous pourriez avoir un mécanisme pour forcer le rerendu du tableau
        setTimeout(() => {
            setIsRefreshing(false);

            // Cette approche d'actualisation est simple pour la démonstration
            // Dans une application réelle, vous pourriez utiliser un mécanisme de
            // cache plus sophistiqué comme SWR, React Query, ou un état global
            window.location.reload();
        }, 1000);
    };

    return (
        <div className="space-y-6">
            {/* En-tête de la page */}
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Demandes clients</h1>
                <p className="text-sm md:text-base text-gray-500">
                    Gérez toutes les demandes des clients, leurs statuts et assignations
                </p>
            </div>

            {/* Barre d'actions */}
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500">Administration</span>
                    <span className="text-gray-500">/</span>
                    <span className="text-gray-900 font-medium">Demandes</span>
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
                        href="/dashboard/requests/create"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                        </svg>
                        Créer une demande
                    </Link>
                </div>
            </div>

            {/* Tableau des demandes */}
            <RequestsTable />

            {/* Section d'aide */}
            <div className="mt-12 bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                        Gestion des demandes clients
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-2">
                                Comment utiliser cette page
                            </h3>
                            <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5">
                                <li>Utilisez les filtres pour retrouver facilement les demandes par statut ou assignation</li>
                                <li>Cliquez sur les entêtes de colonnes pour trier les résultats</li>
                                <li>Cliquez sur -- Voir -- pour consulter les détails d&apos;une demande</li>
                                <li>Utilisez le bouton -- Créer une demande -- pour enregistrer une nouvelle demande client</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-2">
                                Statuts des demandes
                            </h3>
                            <div className="text-sm text-gray-600 space-y-2">
                                <div className="flex items-center">
                                    <span className="inline-block w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>
                                    <span><strong>En attente</strong> - Nouvelle demande non traitée</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                                    <span><strong>En traitement</strong> - Demande prise en charge</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                                    <span><strong>Facturé</strong> - Facture créée mais non payée</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="inline-block w-3 h-3 rounded-full bg-purple-500 mr-2"></span>
                                    <span><strong>Payé</strong> - Facture payée, à commander</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="inline-block w-3 h-3 rounded-full bg-indigo-500 mr-2"></span>
                                    <span><strong>Commandé</strong> - Produits commandés</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}