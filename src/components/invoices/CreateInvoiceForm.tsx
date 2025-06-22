'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreateInvoiceParams, InvoiceItemCreate, InvoiceFeeCreate, FeeRedistribution, ItemRedistributionDetail } from '@/types/invoice';
import invoiceService from '@/services/invoiceService';
import { formatCurrency } from './InvoiceStatusBadge';
import feeTypeService, { FeeType } from '@/types/feeTypeService';

interface CreateInvoiceFormProps {
    requestId: string;
    onSuccess?: () => void;
}

/**
 * Formulaire de création d'une facture avec système de redistribution des frais
 */
export default function CreateInvoiceForm({ requestId, onSuccess }: CreateInvoiceFormProps) {
    const router = useRouter();

    // État du formulaire pour les articles et frais
    const [items, setItems] = useState<InvoiceItemCreate[]>([
        { name: '', unit_price: 0, quantity: 1 }
    ]);
    const [fees, setFees] = useState<InvoiceFeeCreate[]>([]);

    // État pour la redistribution des frais
    const [feeRedistribution, setFeeRedistribution] = useState<FeeRedistribution>({
        total_amount: 0,
        is_enabled: false,
        distribution_method: 'proportional'
    });

    // État pour le chargement et les erreurs
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [itemErrors, setItemErrors] = useState<(string | null)[]>([null]);

    // État pour les types de frais
    const [feeTypes, setFeeTypes] = useState<FeeType[]>([]);
    const [isFeeTypesLoading, setIsFeeTypesLoading] = useState(true);
    const [feeTypesError, setFeeTypesError] = useState<string | null>(null);

    const loadFeeTypes = async () => {
        try {
            setIsFeeTypesLoading(true);
            setFeeTypesError(null);
            const response = await feeTypeService.getAllFeeTypes();
            setFeeTypes(response || []);
        } catch (err) {
            console.error('Erreur lors du chargement des types de frais:', err);
            setFeeTypesError('Impossible de charger les types de frais. Veuillez réessayer.');
        } finally {
            setIsFeeTypesLoading(false);
        }
    };

    // Chargement des types de frais au montage du composant
    useEffect(() => {
        loadFeeTypes();
    }, []);

    // Fonction pour calculer la redistribution des frais
    const calculateFeeRedistribution = (): ItemRedistributionDetail[] => {
        if (!feeRedistribution.is_enabled || feeRedistribution.total_amount <= 0) {
            return [];
        }

        const validItems = items.filter(item => item.name.trim() && item.unit_price > 0 && item.quantity > 0);
        if (validItems.length === 0) return [];

        const totalOriginalAmount = validItems.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);

        if (totalOriginalAmount === 0) return [];

        return validItems.map((item, index) => {
            const originalSubtotal = item.unit_price * item.quantity;
            const weightPercentage = originalSubtotal / totalOriginalAmount;

            let redistributedAmount = 0;
            if (feeRedistribution.distribution_method === 'proportional') {
                redistributedAmount = feeRedistribution.total_amount * weightPercentage;
            } else {
                redistributedAmount = feeRedistribution.total_amount / validItems.length;
            }

            const newUnitPrice = (originalSubtotal + redistributedAmount) / item.quantity;

            return {
                item_index: index,
                original_subtotal: originalSubtotal,
                redistributed_amount: redistributedAmount,
                new_unit_price: newUnitPrice,
                weight_percentage: weightPercentage * 100
            };
        });
    };

    // Fonction pour obtenir le prix unitaire affiché (avec ou sans redistribution)
    const getDisplayedUnitPrice = (item: InvoiceItemCreate, index: number): number => {
        if (!feeRedistribution.is_enabled) {
            return item.unit_price;
        }

        const redistributionDetails = calculateFeeRedistribution();
        const detail = redistributionDetails.find(d => d.item_index === index);
        return detail ? detail.new_unit_price : item.unit_price;
    };

    // Fonction pour obtenir le montant redistribué pour un article
    const getRedistributedAmount = (index: number): number => {
        if (!feeRedistribution.is_enabled) return 0;
        const redistributionDetails = calculateFeeRedistribution();
        const detail = redistributionDetails.find(d => d.item_index === index);
        return detail ? detail.redistributed_amount : 0;
    };

    // Ajouter un nouvel article
    const addItem = () => {
        setItems([...items, { name: '', unit_price: 0, quantity: 1 }]);
        setItemErrors([...itemErrors, null]);
    };

    const getFeeTypeName = (feeTypeId: string) => {
        const feeType = feeTypes.find(type => type.id === feeTypeId);
        return feeType ? feeType.name : 'Frais inconnu';
    };

    // Supprimer un article
    const removeItem = (index: number) => {
        if (items.length === 1) {
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
            // TypeScript sait que field est 'unit_price' | 'quantity' (tous deux de type number)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (newItems[index] as any)[field] = typeof value === 'string' ? parseFloat(value) || 0 : value;
        } else if (field === 'name') {
            // TypeScript sait que field est 'name' (de type string)
            newItems[index][field] = value as string;
        }
        // Note: on ignore les champs optionnels car ils ne sont pas modifiés directement

        setItems(newItems);

        if (itemErrors[index]) {
            const newErrors = [...itemErrors];
            newErrors[index] = null;
            setItemErrors(newErrors);
        }
    };

    

    // Ajouter un frais
    const addFee = (feeTypeId: string) => {
        const existingFeeIndex = fees.findIndex(fee => fee.fee_type_id === feeTypeId);

        if (existingFeeIndex >= 0) {
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

    // Calculer le sous-total d'un article (avec redistribution si activée)
    const calculateSubtotal = (item: InvoiceItemCreate, index: number) => {
        const displayedPrice = getDisplayedUnitPrice(item, index);
        return displayedPrice * item.quantity;
    };

    // Calculer le total des articles (avec redistribution)
    const calculateItemsTotal = () => {
        return items.reduce((sum, item, index) => sum + calculateSubtotal(item, index), 0);
    };

    // Calculer le total des frais traditionnels
    const calculateFeesTotal = () => {
        return fees.reduce((sum, fee) => sum + fee.amount, 0);
    };

    // Calculer le total général
    const calculateGrandTotal = () => {
        return calculateItemsTotal() + calculateFeesTotal();
    };

    // Calculer le total original (sans redistribution) pour comparaison
    const calculateOriginalItemsTotal = () => {
        return items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
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

        if (items.length === 0) {
            setError('La facture doit contenir au moins un article');
            isValid = false;
        }

        // Validation spécifique à la redistribution
        if (feeRedistribution.is_enabled && feeRedistribution.total_amount <= 0) {
            setError('Le montant à redistribuer doit être supérieur à 0');
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
            // Préparer les articles avec les prix ajustés si redistribution activée
            const finalItems: InvoiceItemCreate[] = items.map((item, index) => {
                if (feeRedistribution.is_enabled) {
                    const redistributionDetails = calculateFeeRedistribution();
                    const detail = redistributionDetails.find(d => d.item_index === index);

                    return {
                        name: item.name,
                        unit_price: detail ? detail.new_unit_price : item.unit_price,
                        quantity: item.quantity,
                        original_unit_price: item.unit_price,
                        redistributed_amount: detail ? detail.redistributed_amount : 0
                    };
                }

                return {
                    name: item.name,
                    unit_price: item.unit_price,
                    quantity: item.quantity
                };
            });

            const invoiceParams: CreateInvoiceParams = {
                items: finalItems,
                fees: fees.length > 0 ? fees : undefined
            };

            await invoiceService.createInvoice(requestId, invoiceParams);

            if (onSuccess) {
                onSuccess();
            } else {
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
                {/* Section de redistribution des frais */}
                <div className="mb-8 bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-medium text-blue-900">Redistribution des frais</h3>
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={feeRedistribution.is_enabled}
                                onChange={(e) => setFeeRedistribution(prev => ({
                                    ...prev,
                                    is_enabled: e.target.checked
                                }))}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-blue-700">Activer la redistribution</span>
                        </label>
                    </div>

                    {feeRedistribution.is_enabled && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-blue-700 mb-1">
                                        Montant total à redistribuer
                                    </label>
                                    <input
                                        type="number"
                                        value={feeRedistribution.total_amount}
                                        onChange={(e) => setFeeRedistribution(prev => ({
                                            ...prev,
                                            total_amount: parseFloat(e.target.value) || 0
                                        }))}
                                        className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        placeholder="0"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-blue-700 mb-1">
                                        Méthode de répartition
                                    </label>
                                    <select
                                        value={feeRedistribution.distribution_method}
                                        onChange={(e) => setFeeRedistribution(prev => ({
                                            ...prev,
                                            distribution_method: e.target.value as 'proportional' | 'equal'
                                        }))}
                                        className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    >
                                        <option value="proportional">Proportionnelle au montant</option>
                                        <option value="equal">Égale sur tous les articles</option>
                                    </select>
                                </div>
                            </div>

                            {feeRedistribution.total_amount > 0 && (
                                <div className="bg-blue-100 p-3 rounded-md">
                                    <p className="text-sm text-blue-800">
                                        <strong>Aperçu :</strong> {formatCurrency(feeRedistribution.total_amount)} seront répartis
                                        {feeRedistribution.distribution_method === 'proportional' ? ' proportionnellement' : ' également'}
                                        sur les articles. Les clients verront directement les prix ajustés.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

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
                                                Prix unitaire {feeRedistribution.is_enabled ? '(original)' : ''}
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

                                {/* Affichage de la redistribution si activée */}
                                {feeRedistribution.is_enabled && feeRedistribution.total_amount > 0 && (
                                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                        <div className="text-sm space-y-1">
                                            <div className="flex justify-between">
                                                <span className="text-yellow-700">Prix unitaire ajusté:</span>
                                                <span className="font-medium text-yellow-800">
                                                    {formatCurrency(getDisplayedUnitPrice(item, index))}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-yellow-700">Frais redistribués:</span>
                                                <span className="text-yellow-800">
                                                    +{formatCurrency(getRedistributedAmount(index))}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Sous-total */}
                                <div className="mt-2 text-right">
                                    <span className="text-sm text-gray-500">Sous-total: </span>
                                    <span className="text-sm font-medium">{formatCurrency(calculateSubtotal(item, index))}</span>
                                    {feeRedistribution.is_enabled && (
                                        <div className="text-xs text-gray-400">
                                            (Original: {formatCurrency(item.unit_price * item.quantity)})
                                        </div>
                                    )}
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

                {/* Section des frais traditionnels */}
                <div className="mb-8">
                    <h3 className="text-base font-medium text-gray-900 mb-4">Frais additionnels traditionnels (optionnel)</h3>
                    <p className="text-sm text-gray-500 mb-4">
                        Ces frais apparaîtront séparément sur la facture et seront stockés en base de données.
                    </p>

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
                            Aucun frais additionnel traditionnel pour le moment.
                        </div>
                    )}

                    {/* Menu pour ajouter un type de frais */}
                    <div className="relative inline-block text-left">
                        <div>
                            {isFeeTypesLoading ? (
                                <div className="flex items-center space-x-2">
                                    <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span className="text-sm text-gray-500">Chargement des types de frais...</span>
                                </div>
                            ) : feeTypesError ? (
                                <div className="flex items-center space-x-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-sm text-red-500">{feeTypesError}</span>
                                    <button
                                        onClick={() => loadFeeTypes()}
                                        className="text-xs text-blue-600 hover:text-blue-800 underline"
                                    >
                                        Réessayer
                                    </button>
                                </div>
                            ) : (
                                <select
                                    onChange={(e) => {
                                        if (e.target.value) {
                                            addFee(e.target.value);
                                            e.target.value = '';
                                        }
                                    }}
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                    disabled={feeTypes.length === 0}
                                >
                                    <option value="">
                                        {feeTypes.length === 0
                                            ? "Aucun type de frais disponible"
                                            : "Ajouter des frais traditionnels..."}
                                    </option>
                                    {feeTypes.map((type) => (
                                        <option
                                            key={type.id}
                                            value={type.id}
                                            disabled={fees.some(fee => fee.fee_type_id === type.id)}
                                        >
                                            {type.name}{type.description ? ` - ${type.description}` : ''}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </div>
                </div>

                {/* Récapitulatif */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <h3 className="text-base font-medium text-gray-900 mb-3">Récapitulatif</h3>

                    <div className="space-y-2">
                        {feeRedistribution.is_enabled && (
                            <>
                                <div className="flex justify-between items-center text-sm text-gray-600">
                                    <span>Total original des articles:</span>
                                    <span>{formatCurrency(calculateOriginalItemsTotal())}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm text-blue-600">
                                    <span>+ Frais redistribués:</span>
                                    <span>{formatCurrency(feeRedistribution.total_amount)}</span>
                                </div>
                            </>
                        )}

                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Total des articles:</span>
                            <span className="text-sm font-medium">{formatCurrency(calculateItemsTotal())}</span>
                        </div>

                        {fees.length > 0 && (
                            <>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">Total des frais traditionnels:</span>
                                    <span className="text-sm font-medium">{formatCurrency(calculateFeesTotal())}</span>
                                </div>
                                <hr className="my-2" />
                            </>
                        )}

                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-900">Montant total:</span>
                            <span className="text-base font-bold text-gray-900">{formatCurrency(calculateGrandTotal())}</span>
                        </div>

                        {feeRedistribution.is_enabled && feeRedistribution.total_amount > 0 && (
                            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                                <p className="text-sm text-green-700">
                                    <strong>Pour le client:</strong> Les frais de {formatCurrency(feeRedistribution.total_amount)} sont
                                    intégrés dans les prix unitaires. Le client verra un total de {formatCurrency(calculateGrandTotal())}
                                    sans frais séparés apparents.
                                </p>
                            </div>
                        )}
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