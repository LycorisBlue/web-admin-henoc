'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreateInvoiceParams, InvoiceItemCreate, InvoiceFeeCreate } from '@/types/invoice';
import invoiceService from '@/services/invoiceService';
import { formatCurrency } from './InvoiceStatusBadge';

interface CreateInvoiceFormProps {
    requestId: string;
    onSuccess?: () => void;
}

/**
 * Formulaire de création d'une facture
 */
export default function CreateInvoiceForm({ requestId, onSuccess }: CreateInvoiceFormProps) {
    const router = useRouter();

    // État du formulaire pour les articles et frais
    const [items, setItems] = useState<InvoiceItemCreate[]>([
        { name: '', unit_price: 0, quantity: 1 }
    ]);
    const [fees, setFees] = useState<InvoiceFeeCreate[]>([]);

    // État pour le chargement et les erreurs
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [itemErrors, setItemErrors] = useState<(string | null)[]>([null]);

    // Types de frais disponibles (à remplacer par une requête API en production)
    const feeTypes = [
        { id: '550e8400-e29b-41d4-a716-446655440010', name: 'Livraison', description: 'Frais de livraison standard' },
        { id: '550e8400-e29b-41d4-a716-446655440011', name: 'Express', description: 'Supplément pour livraison express' },
        { id: '550e8400-e29b-41d4-a716-446655440012', name: 'Emballage', description: 'Frais d\'emballage spécial' },
        { id: '550e8400-e29b-41d4-a716-446655440013', name: 'Assurance', description: 'Assurance pour la commande' },
    ];

    // Ajouter un nouvel article
    const addItem = () => {
        setItems([...items, { name: '', unit_price: 0, quantity: 1 }]);
        setItemErrors([...itemErrors, null]);
    };

    // Supprimer un article
    const removeItem = (index: number) => {
        if (items.length === 1) {
            // Garder au moins un article
            setError('La facture doit contenir au moins un article');
            return;
        }

        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);

        const newErrors = [...itemErrors];
        newErrors.splice(index, 1);
        setItemErrors(newErrors);
    };

    // Mettre à jour un article
    const updateItem = (index: number, field: keyof InvoiceItemCreate, value: string | number) => {
        const newItems = [...items];

        if (field === 'unit_price' || field === 'quantity') {
            // Convertir en nombre
            newItems[index][field] = typeof value === 'string' ? parseFloat(value) || 0 : value;
        } else {
            // Mettre à jour le nom
            newItems[index][field] = value as string;
        }

        setItems(newItems);

        // Réinitialiser l'erreur pour cet article si le champ a été corrigé
        if (itemErrors[index]) {
            const newErrors = [...itemErrors];
            newErrors[index] = null;
            setItemErrors(newErrors);
        }
    };

    // Ajouter un frais
    const addFee = (feeTypeId: string) => {
        // Vérifier si ce type de frais existe déjà
        const existingFeeIndex = fees.findIndex(fee => fee.fee_type_id === feeTypeId);

        if (existingFeeIndex >= 0) {
            // Le frais existe déjà, ne pas l'ajouter en double
            setError('Ce type de frais est déjà ajouté à la facture');
            return;
        }

        setFees([...fees, { fee_type_id: feeTypeId, amount: 0 }]);
    };

    // Supprimer un frais
    const removeFee = (index: number) => {
        const newFees = [...fees];
        newFees.splice(index, 1);
        setFees(newFees);
    };

    // Mettre à jour un frais
    const updateFee = (index: number, amount: number) => {
        const newFees = [...fees];
        newFees[index].amount = amount;
        setFees(newFees);
    };

    // Calculer le sous-total d'un article
    const calculateSubtotal = (item: InvoiceItemCreate) => {
        return item.unit_price * item.quantity;
    };

    // Calculer le total des articles
    const calculateItemsTotal = () => {
        return items.reduce((sum, item) => sum + calculateSubtotal(item), 0);
    };

    // Calculer le total des frais
    const calculateFeesTotal = () => {
        return fees.reduce((sum, fee) => sum + fee.amount, 0);
    };

    // Calculer le total général
    const calculateGrandTotal = () => {
        return calculateItemsTotal() + calculateFeesTotal();
    };

    // Récupérer le nom d'un type de frais
    const getFeeTypeName = (feeTypeId: string) => {
        const feeType = feeTypes.find(type => type.id === feeTypeId);
        return feeType ? feeType.name : 'Frais inconnu';
    };

    // Valider le formulaire
    const validateForm = (): boolean => {
        let isValid = true;
        const newItemErrors = items.map(item => {
            if (!item.name.trim()) {
                isValid = false;
                return 'Le nom de l\'article est requis';
            }
            if (item.unit_price <= 0) {
                isValid = false;
                return 'Le prix unitaire doit être supérieur à 0';
            }
            if (item.quantity <= 0) {
                isValid = false;
                return 'La quantité doit être supérieure à 0';
            }
            return null;
        });

        setItemErrors(newItemErrors);

        // Vérifier qu'il y a au moins un article
        if (items.length === 0) {
            setError('La facture doit contenir au moins un article');
            isValid = false;
        }

        return isValid;
    };

    // Soumettre le formulaire
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const invoiceParams: CreateInvoiceParams = {
                items,
                fees: fees.length > 0 ? fees : undefined
            };

            await invoiceService.createInvoice(requestId, invoiceParams);

            // Rediriger ou notifier du succès
            if (onSuccess) {
                onSuccess();
            } else {
                // Rediriger vers la page de la demande
                router.push(`/dashboard/requests/${requestId}`);
            }
        } catch (err) {
            console.error(`Erreur lors de la création de la facture pour la demande ${requestId}:`, err);

            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Une erreur est survenue lors de la création de la facture. Veuillez réessayer.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Création d&apos;une facture</h2>
                <p className="mt-1 text-sm text-gray-500">
                    Ajoutez les articles et frais pour générer une facture pour cette demande.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
                {/* Section des articles */}
                <div className="mb-8">
                    <h3 className="text-base font-medium text-gray-900 mb-4">Articles</h3>

                    <div className="space-y-4">
                        {items.map((item, index) => (
                            <div key={index} className="p-4 border border-gray-200 rounded-lg relative">
                                {/* Bouton de suppression */}
                                <button
                                    type="button"
                                    onClick={() => removeItem(index)}
                                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                                    {/* Nom */}
                                    <div className="col-span-3 md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nom de l&apos;article
                                        </label>
                                        <input
                                            type="text"
                                            value={item.name}
                                            onChange={(e) => updateItem(index, 'name', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            placeholder="ex: Smartphone XYZ 128Go"
                                            required
                                        />
                                    </div>

                                    <div className="flex gap-2">
                                        {/* Prix unitaire */}
                                        <div className="flex-1">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Prix unitaire
                                            </label>
                                            <input
                                                type="number"
                                                value={item.unit_price}
                                                onChange={(e) => updateItem(index, 'unit_price', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                placeholder="0"
                                                min="0"
                                                step="0.01"
                                                required
                                            />
                                        </div>

                                        {/* Quantité */}
                                        <div className="w-24">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Qté
                                            </label>
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                placeholder="1"
                                                min="1"
                                                step="1"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Sous-total */}
                                <div className="mt-2 text-right">
                                    <span className="text-sm text-gray-500">Sous-total: </span>
                                    <span className="text-sm font-medium">{formatCurrency(calculateSubtotal(item))}</span>
                                </div>

                                {/* Afficher l'erreur pour cet article si présente */}
                                {itemErrors[index] && (
                                    <div className="mt-2 text-red-500 text-sm">
                                        {itemErrors[index]}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Bouton pour ajouter un article */}
                    <button
                        type="button"
                        onClick={addItem}
                        className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Ajouter un article
                    </button>
                </div>

                {/* Section des frais */}
                <div className="mb-8">
                    <h3 className="text-base font-medium text-gray-900 mb-4">Frais additionnels (optionnel)</h3>

                    {fees.length > 0 ? (
                        <div className="space-y-4 mb-4">
                            {fees.map((fee, index) => (
                                <div key={index} className="p-4 border border-gray-200 rounded-lg relative">
                                    {/* Bouton de suppression */}
                                    <button
                                        type="button"
                                        onClick={() => removeFee(index)}
                                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Type de frais */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Type de frais
                                            </label>
                                            <div className="text-sm text-gray-900 py-2">
                                                {getFeeTypeName(fee.fee_type_id)}
                                            </div>
                                        </div>

                                        {/* Montant */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Montant
                                            </label>
                                            <input
                                                type="number"
                                                value={fee.amount}
                                                onChange={(e) => updateFee(index, parseFloat(e.target.value) || 0)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                placeholder="0"
                                                min="0"
                                                step="0.01"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-sm text-gray-500 mb-4">
                            Aucun frais additionnel pour le moment.
                        </div>
                    )}

                    {/* Menu pour ajouter un type de frais */}
                    <div className="relative inline-block text-left">
                        <div>
                            <select
                                onChange={(e) => {
                                    if (e.target.value) {
                                        addFee(e.target.value);
                                        e.target.value = ''; // Réinitialiser la sélection
                                    }
                                }}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            >
                                <option value="">Ajouter des frais...</option>
                                {feeTypes.map((type) => (
                                    <option
                                        key={type.id}
                                        value={type.id}
                                        disabled={fees.some(fee => fee.fee_type_id === type.id)}
                                    >
                                        {type.name} - {type.description}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Récapitulatif */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <h3 className="text-base font-medium text-gray-900 mb-3">Récapitulatif</h3>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Total des articles:</span>
                            <span className="text-sm font-medium">{formatCurrency(calculateItemsTotal())}</span>
                        </div>

                        {fees.length > 0 && (
                            <>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">Total des frais:</span>
                                    <span className="text-sm font-medium">{formatCurrency(calculateFeesTotal())}</span>
                                </div>
                                <hr className="my-2" />
                            </>
                        )}

                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-900">Montant total:</span>
                            <span className="text-base font-bold text-gray-900">{formatCurrency(calculateGrandTotal())}</span>
                        </div>
                    </div>
                </div>

                {/* Afficher l'erreur globale si présente */}
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

                {/* Boutons d'action */}
                <div className="flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => router.push(`/dashboard/requests/${requestId}`)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        disabled={isSubmitting}
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 rounded-md text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Création en cours...' : 'Créer la facture'}
                    </button>
                </div>
            </form>
        </div>
    );
}