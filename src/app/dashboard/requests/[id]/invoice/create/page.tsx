'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import CreateInvoiceForm from '@/components/invoices/CreateInvoiceForm';
import requestService from '@/services/requestService';
import { RequestDetails } from '@/types/request';

/**
 * Page de création d'une facture pour une demande
 */
export default function CreateInvoicePage() {
    const params = useParams();
    const requestId = params.id as string;
    const router = useRouter();

    const [request, setRequest] = useState<RequestDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadRequestDetails = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const response = await requestService.getRequestDetails(requestId);
                setRequest(response.data);

                // Vérifier si la demande peut avoir une facture créée
                // Elle ne doit pas avoir déjà une facture et son statut ne doit pas être 'en_attente'
                if (response.data.invoice) {
                    setError("Cette demande a déjà une facture associée.");
                } else if (response.data.status === 'en_attente') {
                    setError("Une demande en attente ne peut pas être facturée. Veuillez d'abord la mettre en traitement.");
                }
            } catch (err) {
                console.error(`Erreur lors du chargement des détails de la demande ${requestId}:`, err);
                setError("Impossible de charger les détails de la demande. Veuillez réessayer.");
            } finally {
                setIsLoading(false);
            }
        };

        loadRequestDetails();
    }, [requestId]);

    // Fonction appelée après la création réussie d'une facture
    const handleSuccess = () => {
        // Rediriger vers la page de détails de la demande
        router.push(`/dashboard/requests/${requestId}?invoice_created=true`);
    };

    return (
        <div className="space-y-6">
            {/* En-tête de la page */}
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Créer une facture</h1>
                <p className="text-sm md:text-base text-gray-500">
                    Créez une facture pour la demande client
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
                    <Link href={`/dashboard/requests/${requestId}`} className="text-gray-500 hover:text-gray-700">
                        #{requestId.substring(0, 8)}
                    </Link>
                    <span className="text-gray-500">/</span>
                    <span className="text-gray-900 font-medium">
                        Facture
                    </span>
                </div>
                <Link
                    href={`/dashboard/requests/${requestId}`}
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
                    Retour à la demande
                </Link>
            </div>

            {/* Afficher un état de chargement */}
            {isLoading && (
                <div className="bg-white rounded-lg shadow overflow-hidden p-6">
                    <div className="animate-pulse space-y-4">
                        <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                        <div className="space-y-2">
                            {[...Array(4)].map((_, index) => (
                                <div key={index} className="h-4 bg-gray-200 rounded"></div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Afficher un message d'erreur */}
            {!isLoading && error && (
                <div className="bg-white rounded-lg shadow overflow-hidden p-6 text-center">
                    <div className="text-red-500 mb-4">{error}</div>
                    <Link
                        href={`/dashboard/requests/${requestId}`}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-block"
                    >
                        Retour à la demande
                    </Link>
                </div>
            )}

            {/* Afficher le formulaire si la demande est valide */}
            {!isLoading && !error && request && (
                <>
                    {/* Information de la demande */}
                    <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
                        <div className="p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-2">
                                Demande #{requestId.substring(0, 8)}
                            </h2>
                            <div className="text-sm text-gray-500 mb-4">
                                <p>Client: {request.client.full_name} ({request.client.whatsapp_number})</p>
                                <p>Date: {new Date(request.created_at).toLocaleDateString('fr-FR')}</p>
                                <p>Statut: {request.status}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
                                <p className="text-sm text-gray-600">{request.description || "Aucune description fournie."}</p>
                            </div>
                        </div>
                    </div>

                    {/* Formulaire de création de facture */}
                    <CreateInvoiceForm requestId={requestId} onSuccess={handleSuccess} />

                    {/* Guide d'aide */}
                    <div className="mt-12 bg-white rounded-lg shadow overflow-hidden">
                        <div className="p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">
                                Guide de création de facture
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                                        Articles
                                    </h3>
                                    <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5">
                                        <li>Ajoutez au moins un article à la facture</li>
                                        <li>Chaque article doit avoir un nom, un prix unitaire et une quantité</li>
                                        <li>Utilisez le bouton -- Ajouter un article -- pour ajouter plusieurs articles</li>
                                        <li>Le sous-total par article est calculé automatiquement</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                                        Frais additionnels
                                    </h3>
                                    <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5">
                                        <li>Les frais additionnels sont optionnels</li>
                                        <li>Vous pouvez ajouter des frais de livraison, d&apos;emballage, etc.</li>
                                        <li>Sélectionnez un type de frais dans le menu déroulant</li>
                                        <li>Entrez le montant du frais</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}