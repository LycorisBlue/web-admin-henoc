'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import RequestDetails from '@/components/requests/RequestDetails';

/**
 * Page de détails d'une demande spécifique
 */
export default function RequestDetailsPage() {
    const params = useParams();
    const requestId = params.id as string;

    // État pour savoir si la page doit être actualisée
    const [refreshKey, setRefreshKey] = useState(0);

    // Fonction pour forcer le rechargement du composant
    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1);
    };

    // Fonction appelée après la mise à jour du statut
    const handleStatusUpdate = () => {
        // Forcer le rechargement du composant
        handleRefresh();
    };

    return (
        <div className="space-y-6">
            {/* En-tête de la page */}
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Détails de la demande</h1>
                <p className="text-sm md:text-base text-gray-500">
                    Consultez et gérez les détails de cette demande client
                </p>
            </div>

            {/* Barre d'actions */}
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-2 text-sm">
                    <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
                        Administration
                    </Link>
                    <span className="text-gray-500">/</span>
                    <Link href="/dashboard/requests" className="text-gray-500 hover:text-gray-700">
                        Demandes
                    </Link>
                    <span className="text-gray-500">/</span>
                    <span className="text-gray-900 font-medium">
                        #{requestId.substring(0, 8)}
                    </span>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={handleRefresh}
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
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                        </svg>
                        Actualiser
                    </button>
                    <Link
                        href="/dashboard/requests"
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
                                d="M10 19l-7-7m0 0l7-7m-7 7h18"
                            />
                        </svg>
                        Retour à la liste
                    </Link>
                </div>
            </div>

            {/* Détails de la demande */}
            <div key={refreshKey}>
                <RequestDetails
                    requestId={requestId}
                    onStatusUpdate={handleStatusUpdate}
                />
            </div>

            {/* Section d'aide au bas de la page */}
            <div className="mt-12 bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                        Actions possibles
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-2">
                                Gestion de la demande
                            </h3>
                            <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5">
                                <li>Modifiez le statut de la demande pour suivre son avancement</li>
                                <li>Assignez-vous la demande si elle n&apos;est pas encore assignée</li>
                                <li>Consultez tous les détails client et les liens produits</li>
                                <li>Suivez l&apos;historique des changements de statut</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-2">
                                Cycle de traitement
                            </h3>
                            <ol className="text-sm text-gray-600 space-y-2 list-decimal pl-5">
                                <li><strong>En attente</strong> → <strong>En traitement</strong> : Assignez-vous la demande</li>
                                <li><strong>En traitement</strong> → <strong>Facturé</strong> : Créez une facture</li>
                                <li><strong>Facturé</strong> → <strong>Payé</strong> : Enregistrez le paiement</li>
                                <li><strong>Payé</strong> → <strong>Commandé</strong> : Commandez les produits</li>
                                <li><strong>Commandé</strong> → <strong>Expédié</strong> → <strong>Livré</strong> : Suivez la livraison</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}