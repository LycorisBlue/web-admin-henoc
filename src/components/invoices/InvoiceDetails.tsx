'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { InvoiceDetails as InvoiceDetailsType } from '@/types/invoice';
import invoiceService from '@/services/invoiceService';
import { InvoiceStatusBadge, PaymentStatusBadge, formatCurrency, formatDate } from './InvoiceStatusBadge';

interface InvoiceDetailsProps {
    invoiceId: string;
    onStatusUpdate?: () => void;
}

/**
 * Composant pour afficher les détails d'une facture et permettre des actions
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function InvoiceDetails({ invoiceId, onStatusUpdate }: InvoiceDetailsProps) {
    const router = useRouter();

    const [invoice, setInvoice] = useState<InvoiceDetailsType | null>(null);
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
            } catch (err) {
                console.error(`Erreur lors du chargement des détails de la facture ${invoiceId}:`, err);
                setError("Impossible de charger les détails de la facture. Veuillez réessayer.");
            } finally {
                setIsLoading(false);
            }
        };

        loadInvoiceDetails();
    }, [invoiceId]);

    // Afficher l'état de chargement
    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow overflow-hidden p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                    <div className="space-y-2">
                        {[...Array(8)].map((_, index) => (
                            <div key={index} className="h-4 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Afficher un message d'erreur
    if (error) {
        return (
            <div className="bg-white rounded-lg shadow overflow-hidden p-6 text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <div className="flex justify-center gap-2">
                    <button
                        onClick={() => router.push('/dashboard/invoices')}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                        Retour à la liste
                    </button>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    // Si pas de facture trouvée
    if (!invoice) {
        return (
            <div className="bg-white rounded-lg shadow overflow-hidden p-6 text-center">
                <p className="text-gray-600 mb-4">Facture non trouvée</p>
                <button
                    onClick={() => router.push('/dashboard/invoices')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    Retour à la liste
                </button>
            </div>
        );
    }

    // Calcul du progrès du paiement
    const paymentProgress = invoice.payment_info.payment_progress;

    return (
        <div className="space-y-6">
            {/* En-tête avec actions */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex flex-wrap justify-between items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-lg font-medium text-gray-900">
                                Facture #{invoiceId.substring(0, 8)}
                            </h2>
                            <InvoiceStatusBadge status={invoice.status} size="lg" />
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                            Créée le {formatDate(invoice.created_at)}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {/* Bouton pour enregistrer un paiement si la facture est en attente */}
                        {invoice.status === 'en_attente' && (
                            <Link
                                href={`/dashboard/invoices/${invoice.id}/payment/create`}
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Enregistrer un paiement
                            </Link>
                        )}

                        {/* Lien vers la demande associée */}
                        <Link
                            href={`/dashboard/requests/${invoice.request_id}`}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Voir la demande
                        </Link>
                    </div>
                </div>

                {/* Contenu principal */}
                <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Colonne principale - Information de la facture */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Montant et état de paiement */}
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-700">Montant total</h3>
                                    <div className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(invoice.total_amount)}</div>
                                </div>
                                <div className="mt-4 md:mt-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-sm font-medium text-gray-700">État du paiement</h3>
                                        <PaymentStatusBadge
                                            status={invoice.payment_info.payment_status}
                                            showPercentage={invoice.payment_info.payment_progress}
                                        />
                                    </div>
                                    {invoice.payment_info.payment_status !== 'unpaid' && (
                                        <div className="mt-2">
                                            <div className="text-xs text-gray-500 flex justify-between mb-1">
                                                <span>Progression</span>
                                                <span>{paymentProgress}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                <div
                                                    className="bg-blue-600 h-2.5 rounded-full"
                                                    style={{ width: `${paymentProgress}%` }}
                                                ></div>
                                            </div>
                                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                                <span>Payé: {formatCurrency(invoice.payment_info.amount_paid)}</span>
                                                <span>Reste: {formatCurrency(invoice.payment_info.remaining_amount)}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Articles de la facture */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-3">Articles</h3>
                            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Article
                                            </th>
                                            <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Prix unitaire
                                            </th>
                                            <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Quantité
                                            </th>
                                            <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Sous-total
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {invoice.items.map((item) => (
                                            <tr key={item.id}>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                    {item.name}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                                                    {formatCurrency(item.unit_price)}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                                                    {item.quantity}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                                                    {formatCurrency(item.subtotal)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-gray-50">
                                        <tr>
                                            <th colSpan={3} className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                                                Sous-total
                                            </th>
                                            <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                                                {formatCurrency(invoice.totals.items_total)}
                                            </td>
                                        </tr>
                                        {invoice.fees.length > 0 && (
                                            <>
                                                {invoice.fees.map((fee) => (
                                                    <tr key={fee.id}>
                                                        <th colSpan={3} className="px-4 py-3 text-right text-sm font-normal text-gray-500">
                                                            {fee.fee_type.name}
                                                        </th>
                                                        <td className="px-4 py-3 text-right text-sm text-gray-500">
                                                            {formatCurrency(fee.amount)}
                                                        </td>
                                                    </tr>
                                                ))}
                                                <tr>
                                                    <th colSpan={3} className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                                                        Total des frais
                                                    </th>
                                                    <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                                                        {formatCurrency(invoice.totals.fees_total)}
                                                    </td>
                                                </tr>
                                            </>
                                        )}
                                        <tr className="border-t-2 border-gray-300">
                                            <th colSpan={3} className="px-4 py-3 text-right text-sm font-bold text-gray-900">
                                                Total
                                            </th>
                                            <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">
                                                {formatCurrency(invoice.totals.grand_total)}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>

                        {/* Paiements enregistrés */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-3">Paiements enregistrés</h3>
                            {invoice.payments.length > 0 ? (
                                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Date
                                                </th>
                                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Méthode
                                                </th>
                                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Confirmé par
                                                </th>
                                                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Montant
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {invoice.payments.map((payment) => (
                                                <tr key={payment.id}>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                        {formatDate(payment.payment_date)}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                        <span className="capitalize">
                                                            {payment.method.replace('_', ' ')}
                                                        </span>
                                                        {payment.reference && (
                                                            <span className="block text-xs text-gray-400">
                                                                Réf: {payment.reference}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                        {payment.confirmed_by.name}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                                                        {formatCurrency(payment.amount_paid)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-gray-50">
                                            <tr>
                                                <th colSpan={3} className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                                                    Total payé
                                                </th>
                                                <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                                                    {formatCurrency(invoice.payment_info.amount_paid)}
                                                </td>
                                            </tr>
                                            {invoice.payment_info.remaining_amount > 0 && (
                                                <tr>
                                                    <th colSpan={3} className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                                                        Reste à payer
                                                    </th>
                                                    <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                                                        {formatCurrency(invoice.payment_info.remaining_amount)}
                                                    </td>
                                                </tr>
                                            )}
                                        </tfoot>
                                    </table>
                                </div>
                            ) : (
                                <div className="bg-gray-50 p-4 rounded-lg text-gray-500 text-sm">
                                    Aucun paiement enregistré pour cette facture.
                                    {invoice.status === 'en_attente' && (
                                        <div className="mt-2">
                                            <Link
                                                href={`/dashboard/invoices/${invoice.id}/payment/create`}
                                                className="text-blue-600 hover:text-blue-800 font-medium"
                                            >
                                                Enregistrer un paiement
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Colonne latérale - Infos client et demande */}
                    <div className="space-y-6">
                        {/* Informations client */}
                        <div className="bg-gray-50 rounded-md p-4">
                            <h3 className="text-sm font-medium text-gray-700 mb-3">Informations client</h3>
                            <div className="space-y-2">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{invoice.client.full_name}</p>
                                    <p className="text-sm text-gray-600">{invoice.client.whatsapp_number}</p>
                                </div>
                                {invoice.client.email && (
                                    <p className="text-sm text-gray-600">
                                        <span className="block font-medium text-xs text-gray-500">Email</span>
                                        <a href={`mailto:${invoice.client.email}`} className="text-blue-600 hover:text-blue-800">
                                            {invoice.client.email}
                                        </a>
                                    </p>
                                )}
                                {invoice.client.adresse && (
                                    <p className="text-sm text-gray-600">
                                        <span className="block font-medium text-xs text-gray-500">Adresse</span>
                                        {invoice.client.adresse}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Information sur la demande associée */}
                        <div className="bg-gray-50 rounded-md p-4">
                            <h3 className="text-sm font-medium text-gray-700 mb-3">Demande associée</h3>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-gray-500">ID Demande</p>
                                    <p className="text-sm font-medium text-gray-900">#{invoice.request_id.substring(0, 8)}</p>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-gray-500">Status</p>
                                    <div>
                                        <StatusBadge status={invoice.request.status} />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-gray-500">Date création</p>
                                    <p className="text-sm text-gray-900">{formatDate(invoice.request.created_at)}</p>
                                </div>
                                <div className="mt-3">
                                    <Link
                                        href={`/dashboard/requests/${invoice.request_id}`}
                                        className="text-sm text-blue-600 hover:text-blue-800"
                                    >
                                        Voir les détails de la demande
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Information sur l'administrateur */}
                        <div className="bg-gray-50 rounded-md p-4">
                            <h3 className="text-sm font-medium text-gray-700 mb-3">Créée par</h3>
                            <div className="space-y-2">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{invoice.admin.name}</p>
                                    <p className="text-sm text-gray-600">
                                        <a href={`mailto:${invoice.admin.email}`} className="text-blue-600 hover:text-blue-800">
                                            {invoice.admin.email}
                                        </a>
                                    </p>
                                </div>
                                {invoice.admin.is_current_admin && (
                                    <p className="text-xs text-gray-500 mt-2">
                                        Vous êtes l&apos;administrateur qui a créé cette facture.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Actions supplémentaires */}
                        <div className="bg-gray-50 rounded-md p-4">
                            <h3 className="text-sm font-medium text-gray-700 mb-3">Actions</h3>
                            <div className="space-y-2">
                                {invoice.status === 'en_attente' && (
                                    <Link
                                        href={`/dashboard/invoices/${invoice.id}/payment/create`}
                                        className="flex items-center gap-2 text-sm text-green-600 hover:text-green-800 font-medium"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        Enregistrer un paiement
                                    </Link>
                                )}
                                <button
                                    onClick={() => window.print()}
                                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                    </svg>
                                    Imprimer la facture
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Composant pour afficher le statut d'une demande
function StatusBadge({ status }: { status: string }) {
    const getColor = () => {
        switch (status) {
            case 'en_attente':
                return 'bg-yellow-100 text-yellow-800';
            case 'en_traitement':
                return 'bg-blue-100 text-blue-800';
            case 'facturé':
                return 'bg-green-100 text-green-800';
            case 'payé':
                return 'bg-purple-100 text-purple-800';
            case 'commandé':
                return 'bg-indigo-100 text-indigo-800';
            case 'expédié':
                return 'bg-pink-100 text-pink-800';
            case 'livré':
                return 'bg-teal-100 text-teal-800';
            case 'annulé':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getLabel = () => {
        switch (status) {
            case 'en_attente':
                return 'En attente';
            case 'en_traitement':
                return 'En traitement';
            case 'facturé':
                return 'Facturé';
            case 'payé':
                return 'Payé';
            case 'commandé':
                return 'Commandé';
            case 'expédié':
                return 'Expédié';
            case 'livré':
                return 'Livré';
            case 'annulé':
                return 'Annulé';
            default:
                return status;
        }
    };

    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getColor()}`}>
            {getLabel()}
        </span>
    );
}