'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import InvoiceDetails from '@/components/invoices/InvoiceDetails';

/**
 * Page de détails d'une facture spécifique
 */
export default function InvoiceDetailsPage() {
    const params = useParams();
    const invoiceId = params.id as string;

    // État pour savoir si la page doit être actualisée
    const [refreshKey, setRefreshKey] = useState(0);

    // Fonction pour forcer le rechargement du composant
    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1);
    };

    return (
        <div className="space-y-6">
            {/* En-tête de la page */}
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Détails de la facture</h1>
                <p className="text-sm md:text-base text-gray-500">
                    Consultez et gérez les détails de cette facture
                </p>
            </div>

            {/* Barre d'actions */}
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-2 text-sm">
                    <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
                        Administration
                    </Link>
                    <span className="text-gray-500">/</span>
                    <Link href="/dashboard/invoices" className="text-gray-500 hover:text-gray-700">
                        Factures
                    </Link>
                    <span className="text-gray-500">/</span>
                    <span className="text-gray-900 font-medium">
                        #{invoiceId.substring(0, 8)}
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
                                d="M10 19l-7-7m0 0l7-7m-7 7h18"
                            />
                        </svg>
                        Retour à la liste
                    </Link>
                </div>
            </div>

            {/* Détails de la facture */}
            <div key={refreshKey}>
                <InvoiceDetails
                    invoiceId={invoiceId}
                />
            </div>

            {/* Section d'aide au bas de la page */}
            <div className="mt-12 bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                        Gestion des factures
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-2">
                                Comprendre cette facture
                            </h3>
                            <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5">
                                <li>Le statut <strong>En attente</strong> indique que la facture n&apos;a pas encore été entièrement payée</li>
                                <li>Le statut <strong>Payée</strong> indique que la facture a été intégralement réglée</li>
                                <li>La barre de progression indique le pourcentage du montant total qui a été payé</li>
                                <li>Une facture peut recevoir plusieurs paiements partiels jusqu&apos;à atteindre le montant total</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-2">
                                Actions possibles
                            </h3>
                            <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5">
                                <li>Cliquez sur <strong>Enregistrer un paiement</strong> pour ajouter un nouveau paiement à la facture</li>
                                <li>Cliquez sur <strong>Imprimer la facture</strong> pour obtenir une version imprimable</li>
                                <li>Utilisez <strong>Voir la demande</strong> pour consulter la demande client associée</li>
                                <li>Consultez les détails des paiements déjà effectués dans la section &quot;Paiements enregistrés&quot;</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}