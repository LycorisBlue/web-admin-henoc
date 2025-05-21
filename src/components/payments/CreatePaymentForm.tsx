'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { InvoiceDetails } from '@/types/invoice';
import { formatCurrency } from '@/components/invoices/InvoiceStatusBadge';
import invoiceService from '@/services/invoiceService';

// Types pour les méthodes de paiement disponibles
type PaymentMethod = 'wave' | 'momo' | 'orange_money' | 'zeepay' | 'cash';

// Configuration des méthodes de paiement
const paymentMethods: Record<PaymentMethod, { label: string; icon: string }> = {
    'wave': {
        label: 'Wave',
        icon: '🌊' // Utiliser une icône réelle ou un SVG dans une implémentation complète
    },
    'momo': {
        label: 'Mobile Money',
        icon: '📱'
    },
    'orange_money': {
        label: 'Orange Money',
        icon: '🍊'
    },
    'zeepay': {
        label: 'Zeepay',
        icon: '💸'
    },
    'cash': {
        label: 'Espèces',
        icon: '💰'
    }
};

interface CreatePaymentFormProps {
    invoiceId: string;
    invoice: InvoiceDetails;
    onSuccess?: () => void;
}

/**
 * Formulaire de création d'un paiement pour une facture
 */
export default function CreatePaymentForm({ invoiceId, invoice, onSuccess }: CreatePaymentFormProps) {
    const router = useRouter();

    // États du formulaire
    const [amount, setAmount] = useState<number>(invoice.payment_info.remaining_amount);
    const [method, setMethod] = useState<PaymentMethod>('cash');
    const [paymentDate, setPaymentDate] = useState<string>(
        new Date().toISOString().split('T')[0]
    );
    const [reference, setReference] = useState<string>('');

    // État pour le chargement et les erreurs
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Vérifier si le montant est valide (pas zéro et pas supérieur au montant restant)
    const isAmountValid = amount > 0 && amount <= invoice.payment_info.remaining_amount;

    // Gérer la soumission du formulaire
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isAmountValid) {
            setError('Le montant du paiement doit être positif et ne pas dépasser le solde restant.');
            return;
        }

        setIsSubmitting(true);
        setError(null);
        setSuccessMessage(null);

        try {
            // Adapter le format de la date pour l'API
            const formattedPaymentDate = new Date(paymentDate);
            formattedPaymentDate.setHours(12, 0, 0, 0); // Midi pour éviter les problèmes de fuseau horaire

            const paymentData = {
                amount_paid: amount,
                method,
                payment_date: formattedPaymentDate.toISOString(),
                reference: reference.trim() || undefined
            };

            const response = await invoiceService.createPayment(invoiceId, paymentData);

            // Afficher un message de succès
            setSuccessMessage(`Paiement de ${formatCurrency(amount)} enregistré avec succès.`);

            // Réinitialiser le formulaire
            if (response.data.invoice.is_fully_paid) {
                setAmount(0);
            } else {
                setAmount(response.data.invoice.remaining_amount);
            }
            setReference('');

            // Attendre un court délai puis rediriger ou notifier le parent
            setTimeout(() => {
                if (onSuccess) {
                    onSuccess();
                } else {
                    router.push(`/dashboard/invoices/${invoiceId}?payment_success=true`);
                }
            }, 1500);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error(`Erreur lors de l'enregistrement du paiement:`, err);

            // Gérer les différents types d'erreurs de l'API
            if (err.status === 400) {
                if (err.data?.errorType === 'PAYMENT_EXCEEDS_REMAINING') {
                    setError(`Le montant du paiement (${formatCurrency(amount)}) excède le solde restant (${formatCurrency(err.data.remaining_amount)}).`);
                } else if (err.data?.errorType === 'INVALID_PAYMENT_AMOUNT') {
                    setError('Le montant du paiement doit être positif.');
                } else if (err.data?.errorType === 'INVALID_PAYMENT_METHOD') {
                    setError('Méthode de paiement invalide.');
                } else if (err.data?.errorType === 'INVOICE_CANCELLED') {
                    setError('Impossible d\'ajouter un paiement à une facture annulée.');
                } else {
                    setError(err.message || 'Une erreur est survenue lors de l\'enregistrement du paiement.');
                }
            } else {
                setError('Une erreur est survenue lors de l\'enregistrement du paiement. Veuillez réessayer.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Enregistrer un paiement</h2>
                <p className="mt-1 text-sm text-gray-500">
                    Saisissez les informations du paiement pour cette facture.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
                {/* Résumé de la facture */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Montant total:</span>
                        <span className="text-sm font-medium">{formatCurrency(invoice.total_amount)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Déjà payé:</span>
                        <span className="text-sm font-medium">{formatCurrency(invoice.payment_info.amount_paid)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900">Reste à payer:</span>
                        <span className="text-base font-bold text-gray-900">{formatCurrency(invoice.payment_info.remaining_amount)}</span>
                    </div>
                </div>

                {/* Message de succès */}
                {successMessage && (
                    <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-green-700">
                                    {successMessage}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Message d'erreur */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
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
                )}

                <div className="space-y-6">
                    {/* Montant du paiement */}
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                            Montant du paiement *
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 sm:text-sm">XOF</span>
                            </div>
                            <input
                                type="number"
                                id="amount"
                                name="amount"
                                value={amount}
                                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                                className={`block w-full pl-12 pr-12 py-3 border ${!isAmountValid && amount !== 0 ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 sm:text-sm`}
                                placeholder="0"
                                min="0"
                                step="0.01"
                                max={invoice.payment_info.remaining_amount}
                                required
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                <button
                                    type="button"
                                    onClick={() => setAmount(invoice.payment_info.remaining_amount)}
                                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    Max
                                </button>
                            </div>
                        </div>
                        {!isAmountValid && amount !== 0 && (
                            <p className="mt-2 text-sm text-red-600">
                                Le montant doit être positif et ne pas dépasser {formatCurrency(invoice.payment_info.remaining_amount)}.
                            </p>
                        )}
                    </div>

                    {/* Méthode de paiement */}
                    <div>
                        <label htmlFor="payment-method" className="block text-sm font-medium text-gray-700 mb-1">
                            Méthode de paiement *
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            {Object.entries(paymentMethods).map(([key, { label, icon }]) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setMethod(key as PaymentMethod)}
                                    className={`border rounded-md p-3 flex flex-col items-center justify-center ${method === key
                                            ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-200'
                                            : 'border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    <span className="text-xl mb-1">{icon}</span>
                                    <span className={`text-sm ${method === key ? 'font-medium text-blue-700' : 'text-gray-700'}`}>
                                        {label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Date de paiement */}
                    <div>
                        <label htmlFor="payment-date" className="block text-sm font-medium text-gray-700 mb-1">
                            Date du paiement *
                        </label>
                        <input
                            type="date"
                            id="payment-date"
                            name="payment-date"
                            value={paymentDate}
                            onChange={(e) => setPaymentDate(e.target.value)}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            required
                        />
                    </div>

                    {/* Référence (optionnel) */}
                    <div>
                        <label htmlFor="reference" className="block text-sm font-medium text-gray-700 mb-1">
                            Référence (optionnel)
                        </label>
                        <input
                            type="text"
                            id="reference"
                            name="reference"
                            value={reference}
                            onChange={(e) => setReference(e.target.value)}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="ex: TRX123456789"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Numéro de transaction, référence du reçu, etc.
                        </p>
                    </div>
                </div>

                {/* Boutons d'action */}
                <div className="mt-8 flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        disabled={isSubmitting}
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        className={`px-4 py-2 rounded-md text-sm font-medium text-white ${isSubmitting
                                ? 'bg-blue-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                            }`}
                        disabled={isSubmitting || !isAmountValid}
                    >
                        {isSubmitting ? 'Enregistrement...' : 'Enregistrer le paiement'}
                    </button>
                </div>
            </form>
        </div>
    );
}