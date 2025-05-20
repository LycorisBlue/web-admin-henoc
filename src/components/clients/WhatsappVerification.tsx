// src/components/clients/WhatsappVerification.tsx
'use client';

import { useState, useEffect } from 'react';
import clientService from '@/services/clientService';

interface ClientInfo {
    id?: string;
    whatsapp_number: string;
    full_name?: string;
    email?: string;
    adresse?: string;
    created_at?: string;
}

interface WhatsappVerificationProps {
    onClientSelected?: (client: ClientInfo) => void;
    onClientRegistered?: () => void;
    defaultNumber?: string;
    // Ajouter une prop pour indiquer si on sait déjà que le client n'est pas enregistré
    isClientRegistered?: boolean;
}

/**
 * Composant pour vérifier et enregistrer un numéro WhatsApp
 */
export default function WhatsappVerification({
    onClientSelected,
    onClientRegistered,
    defaultNumber = '',
    isClientRegistered = false
}: WhatsappVerificationProps) {
    const [whatsappNumber, setWhatsappNumber] = useState(defaultNumber);
    const [client, setClient] = useState<ClientInfo | null>(null);
    const [isNumberExists, setIsNumberExists] = useState<boolean | null>(isClientRegistered);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<ClientInfo>({
        whatsapp_number: defaultNumber,
        full_name: '',
        email: '',
        adresse: ''
    });

    // Vérifier le numéro WhatsApp
    const handleVerify = async () => {
        if (!whatsappNumber.trim()) {
            setError('Veuillez saisir un numéro WhatsApp');
            return;
        }

        setIsVerifying(true);
        setError(null);

        try {
            const response = await clientService.checkWhatsappNumber(whatsappNumber);
            setIsNumberExists(response.data.exists);

            if (response.data.exists && response.data.client) {
                setClient(response.data.client);
                setFormData({
                    whatsapp_number: response.data.whatsapp_number,
                    full_name: response.data.client.full_name || '',
                    email: response.data.client.email || '',
                    adresse: response.data.client.adresse || ''
                });

                // Notifier le parent si nécessaire
                if (onClientSelected) {
                    onClientSelected(response.data.client);
                }
            } else {
                setClient(null);
                setFormData({
                    whatsapp_number: whatsappNumber,
                    full_name: '',
                    email: '',
                    adresse: ''
                });
            }
        } catch (err) {
            console.error('Erreur lors de la vérification du numéro WhatsApp:', err);
            setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de la vérification');
        } finally {
            setIsVerifying(false);
        }
    };

    // Gérer les changements dans le formulaire
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Enregistrer ou mettre à jour les informations du client
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setIsSubmitting(true);
        setError(null);

        try {
            const response = await clientService.registerClient(formData);
            setClient(response.data.client);
            setIsNumberExists(true);

            // Notifier le parent si nécessaire
            if (onClientSelected) {
                onClientSelected(response.data.client);
            }

            if (onClientRegistered) {
                onClientRegistered();
            }
        } catch (err) {
            console.error('Erreur lors de l\'enregistrement du client:', err);
            setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de l\'enregistrement');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Si on sait déjà que le client n'est pas enregistré, on saute l'étape de vérification
    useEffect(() => {
        if (isClientRegistered === false && defaultNumber) {
            setIsNumberExists(false);
            setFormData(prev => ({
                ...prev,
                whatsapp_number: defaultNumber
            }));
        }
    }, [isClientRegistered, defaultNumber]);

    return (
        <div className="bg-white rounded-lg p-4">
            {/* Vérification du numéro - Afficher uniquement si on ne sait pas encore si le client est enregistré */}
            {isNumberExists === null && (
                <div className="mb-6">
                    <label htmlFor="whatsapp_number" className="block text-sm font-medium text-gray-700 mb-1">
                        Numéro WhatsApp
                    </label>
                    <div className="flex">
                        <input
                            type="text"
                            id="whatsapp_number"
                            value={whatsappNumber}
                            onChange={(e) => setWhatsappNumber(e.target.value)}
                            placeholder="+2250102030405"
                            className="flex-1 rounded-l-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isVerifying}
                        />
                        <button
                            type="button"
                            onClick={handleVerify}
                            disabled={isVerifying || !whatsappNumber.trim()}
                            className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 disabled:bg-blue-300"
                        >
                            {isVerifying ? 'Vérification...' : 'Vérifier'}
                        </button>
                    </div>
                    {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                </div>
            )}

            {/* Afficher les informations du client si trouvé */}
            {isNumberExists === true && client && !isSubmitting && (
                <div className="mb-6 bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="text-sm font-medium text-green-800 mb-2">Client trouvé</h4>
                    <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Nom :</span> {client.full_name || 'Non spécifié'}</p>
                        <p><span className="font-medium">Numéro WhatsApp :</span> {client.whatsapp_number}</p>
                        {client.email && <p><span className="font-medium">Email :</span> {client.email}</p>}
                        {client.adresse && <p><span className="font-medium">Adresse :</span> {client.adresse}</p>}
                    </div>
                </div>
            )}

            {/* Formulaire d'enregistrement ou de mise à jour client */}
            {isNumberExists === false && (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Enregistrer les informations du client
                    </h4>

                    <div>
                        <label htmlFor="form_whatsapp_number" className="block text-sm font-medium text-gray-700 mb-1">
                            Numéro WhatsApp *
                        </label>
                        <input
                            type="text"
                            id="form_whatsapp_number"
                            name="whatsapp_number"
                            value={formData.whatsapp_number}
                            onChange={handleInputChange}
                            required
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                            Nom complet *
                        </label>
                        <input
                            type="text"
                            id="full_name"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleInputChange}
                            required
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="adresse" className="block text-sm font-medium text-gray-700 mb-1">
                            Adresse
                        </label>
                        <textarea
                            id="adresse"
                            name="adresse"
                            value={formData.adresse}
                            onChange={handleInputChange}
                            rows={3}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        ></textarea>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                        >
                            {isSubmitting ? 'Enregistrement...' : 'Enregistrer le client'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}