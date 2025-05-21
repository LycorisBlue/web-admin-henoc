'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import CreatePaymentForm from '@/components/payments/CreatePaymentForm';
import invoiceService from '@/services/invoiceService';
import { InvoiceDetails } from '@/types/invoice';
import { InvoiceStatusBadge, formatCurrency } from '@/components/invoices/InvoiceStatusBadge';

/**
 * Page de création d'un paiement pour une facture
 */
export default function CreatePaymentPage() {
    const params = useParams();
    const router = useRouter();
    const invoiceId = params.id as string;

    // États pour la facture
    const [invoice, setInvoice] = useState<InvoiceDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Charger les détails de la facture
    useEffect(() => {
        const loadInvoiceDetails = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const response = await invoiceService.getInvoiceDetails(invoiceId);
                setInvoice(response.data);

                // Vérifier si la facture peut recevoir des paiements
                if (response.data.status !== 'en_attente') {
                    setError(`Cette facture est marquée comme "${response.data.status}" et ne peut pas recevoir de paiement.`);
                } else if (response.data.payment_info.remaining_amount <= 0) {
                    setError('Cette facture est déjà entièrement payée.');
                }
            } catch (err) {
                console.error(`Erreur lors du chargement des détails de la facture ${invoiceId}:`, err);
                setError("Impossible de charger les détails de la facture. Veuillez réessayer.");
            } finally {
                setIsLoading(false);
            }
        };

        loadInvoiceDetails();
    }, [invoiceId]);

    // Fonction appelée après la création réussie d'un paiement
    const handleSuccess = () => {
        // Rediriger vers la page de détails de la facture
        router.push(`/dashboard/invoices/${invoiceId}?payment_success=true`);
    };

    return (
        <div className="space-y-6">
            {/* En-tête de la page */}
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Enregistrer un paiement</h1>
                <p className="text-sm md:text-base text-gray-500">
                    Enregistrez un paiement pour la facture sélectionnée
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
                    <Link href={`/dashboard/invoices/${invoiceId}`} className="text-gray-500 hover:text-gray-700">
                        #{invoiceId.substring(0, 8)}
                    </Link>
                    <span className="text-gray-500">/</span>
                    <span className="text-gray-900 font-medium">
                        Paiement
                    </span>
                </div>
                <Link
                    href={`/dashboard/invoices/${invoiceId}`}
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
                    Retour à la facture
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
                <div className="bg-white rounded-lg shadow overflow-hidden p-6">
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">
                                    {error}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="text-center mt-4">
                        <Link
                            href={`/dashboard/invoices/${invoiceId}`}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Retour à la facture
                        </Link>
                    </div>
                </div>
            )}

            {/* Afficher le formulaire si la facture est valide */}
            {!isLoading && !error && invoice && (
                <>
                    {/* Information de la facture */}
                    <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
                        <div className="p-6">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                <div>
                                    <h2 className="text-lg font-medium text-gray-900">
                                        Facture #{invoiceId.substring(0, 8)}
                                    </h2>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Créée le {new Date(invoice.created_at).toLocaleDateString('fr-FR')}
                                    </p>
                                </div>
                                <div className="mt-2 md:mt-0 flex items-center">
                                    <InvoiceStatusBadge status={invoice.status} size="lg" />
                                    <span className="ml-2 text-sm text-gray-500">
                                        {formatCurrency(invoice.total_amount)}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-4 border-t border-gray-200 pt-4">
                                <h3 className="text-sm font-medium text-gray-700 mb-2">Client</h3>
                                <p className="text-sm text-gray-900">{invoice.client.full_name}</p>
                                <p className="text-sm text-gray-500">{invoice.client.whatsapp_number}</p>
                                {invoice.client.email && (
                                    <p className="text-sm text-gray-500">{invoice.client.email}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Formulaire de création de paiement */}
                    <CreatePaymentForm
                        invoiceId={invoiceId}
                        invoice={invoice}
                        onSuccess={handleSuccess}
                    />
                </>
            )}
        </div>
    );
}