'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RequestDetails as RequestDetailsType, RequestStatus, UpdateStatusParams, AssignRequestParams } from '@/types/request';
import requestService from '@/services/requestService';
import Link from 'next/link';
import StatusBadge from '@/components/requests/StatusBadge';
import WhatsappVerification from '@/components/clients/WhatsappVerification';
import clientService from '@/services/clientService';

interface RequestDetailsProps {
    requestId: string;
    onStatusUpdate?: () => void;
}

/**
 * Composant pour afficher les détails d'une demande et permettre des actions
 */
export default function RequestDetails({ requestId, onStatusUpdate }: RequestDetailsProps) {
    const router = useRouter();

    const [request, setRequest] = useState<RequestDetailsType | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // États pour les actions
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [isAssigning, setIsAssigning] = useState(false);
    const [newStatus, setNewStatus] = useState<RequestStatus | ''>('');
    const [statusComment, setStatusComment] = useState('');
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [isClientVerified, setIsClientVerified] = useState(false);
    const [showClientVerification, setShowClientVerification] = useState(false);

    // Charger les détails de la demande
    useEffect(() => {
        const loadRequestDetails = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const response = await requestService.getRequestDetails(requestId);
                setRequest(response.data);
            } catch (err) {
                console.error(`Erreur lors du chargement des détails de la demande ${requestId}:`, err);
                setError("Impossible de charger les détails de la demande. Veuillez réessayer.");
            } finally {
                setIsLoading(false);
            }
        };

        loadRequestDetails();
    }, [requestId]);

    useEffect(() => {
        if (!request?.client.whatsapp_number) return;

        let cancelled = false;
        (async () => {
            try {
                const { data } = await clientService.checkWhatsappNumber(request.client.whatsapp_number);
                if (!cancelled) setIsClientVerified(data.exists);
            } catch {
                if (!cancelled) setIsClientVerified(false);
            }
        })();
        return () => { cancelled = true; };
    }, [request?.client.whatsapp_number]);

    // Mettre à jour le statut d'une demande
    const handleStatusUpdate = async () => {
        if (!newStatus) return;

        try {
            setIsUpdatingStatus(true);

            const params: UpdateStatusParams = {
                status: newStatus as RequestStatus,
                comment: statusComment.trim() || undefined,
            };

            await requestService.updateRequestStatus(requestId, params);

            // Recharger les détails pour refléter les changements
            const response = await requestService.getRequestDetails(requestId);
            setRequest(response.data);

            // Réinitialiser le formulaire
            setNewStatus('');
            setStatusComment('');
            setShowStatusModal(false);

            // Notifier le parent si nécessaire
            if (onStatusUpdate) onStatusUpdate();

        } catch (err) {
            console.error(`Erreur lors de la mise à jour du statut de la demande ${requestId}:`, err);
            alert("Échec de la mise à jour du statut. Veuillez réessayer.");
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    // Assigner une demande
    const handleAssign = async () => {
        try {
            setIsAssigning(true);

            const params: AssignRequestParams = {}; // Assigner à l'admin actuel

            await requestService.assignRequest(requestId, params);

            // Recharger les détails pour refléter les changements
            const response = await requestService.getRequestDetails(requestId);
            setRequest(response.data);

            setShowAssignModal(false);

        } catch (err) {
            console.error(`Erreur lors de l'assignation de la demande ${requestId}:`, err);
            alert("Échec de l'assignation. Veuillez réessayer.");
        } finally {
            setIsAssigning(false);
        }
    };

    // Gérer le retour de la vérification du client
    const handleClientSelected = () => {
        setIsClientVerified(true);
        setShowClientVerification(false);
    };

    useEffect(() => {
        if (isClientVerified !== null) {
            console.log('isClientVerified =>', isClientVerified);
        }
    }, [isClientVerified]);
  

    // Formater une date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

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
                        onClick={() => router.push('/dashboard/requests')}
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

    // Si pas de demande trouvée
    if (!request) {
        return (
            <div className="bg-white rounded-lg shadow overflow-hidden p-6 text-center">
                <p className="text-gray-600 mb-4">Demande non trouvée</p>
                <button
                    onClick={() => router.push('/dashboard/requests')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    Retour à la liste
                </button>
            </div>
        );
    }


    return (
        <div className="space-y-6">
            {/* En-tête avec actions */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex flex-wrap justify-between items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-lg font-medium text-gray-900">
                                Demande #{requestId.substring(0, 8)}
                            </h2>
                            <StatusBadge status={request.status} size="lg" />
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                            Créée le {formatDate(request.created_at)}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {/* Bouton pour s'assigner si non assigné */}
                        {(!request.assigned_admin && (request.permissions.can_modify || request.status === 'en_attente')) && (
                            <button
                                onClick={() => setShowAssignModal(true)}
                                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                M&apos;assigner
                            </button>
                        )}

                        {/* Bouton de mise à jour de statut */}
                        {(request.permissions.can_modify || request.status === 'en_attente') && (
                            <button
                                onClick={() => setShowStatusModal(true)}
                                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Modifier le statut
                            </button>
                        )}

                        {/* Bouton pour créer une facture si pas déjà facturé */}
                        {(request.permissions.can_modify || request.status === 'en_attente') &&
                            !request.invoice &&
                            request.status !== 'en_attente' && (
                                <>
                                    {isClientVerified === true ? (
                                        <Link
                                            href={`/dashboard/requests/${requestId}/invoice/create`}
                                            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        Créer une facture
                                        </Link>
                                    ) : (
                                        <button
                                            onClick={() => setShowClientVerification(true)}
                                            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            Vérifier client et créer facture
                                        </button>
                                    )}
                                </>
                            )}


                    </div>
                </div>

                {/* Contenu principal */}
                <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Colonne principale - Information de la demande */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Description */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
                            <div className="bg-gray-50 rounded-md p-4 text-gray-800">
                                {request.description || "Aucune description fournie."}
                            </div>
                        </div>

                        {/* Liens produits */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-2">Liens produits</h3>
                            {request.product_links.length > 0 ? (
                                <div className="bg-gray-50 rounded-md overflow-hidden">
                                    <ul className="divide-y divide-gray-200">
                                        {request.product_links.map((link) => (
                                            <li key={link.id} className="p-4">
                                                <div className="flex items-start">
                                                    <div className="flex-shrink-0 pt-0.5">
                                                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                                        </svg>
                                                    </div>
                                                    <div className="ml-3 flex-1">
                                                        <a
                                                            href={link.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm font-medium text-blue-600 hover:text-blue-800 break-all"
                                                        >
                                                            {link.url}
                                                        </a>
                                                        {link.note && (
                                                            <p className="mt-1 text-sm text-gray-500">
                                                                {link.note}
                                                            </p>
                                                        )}
                                                        <p className="mt-1 text-xs text-gray-400">
                                                            Ajouté le {formatDate(link.created_at)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ) : (
                                <div className="bg-gray-50 rounded-md p-4 text-gray-500 text-sm">
                                    Aucun lien produit fourni.
                                </div>
                            )}
                        </div>

                        {/* Facture associée */}
                        {request.invoice && (
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-2">Facture associée</h3>
                                <div className="bg-gray-50 rounded-md p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                Facture #{request.invoice.id.substring(0, 8)}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                Créée le {formatDate(request.invoice.created_at)}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <div className="text-lg font-semibold text-gray-900">
                                                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(request.invoice.total_amount)}
                                            </div>
                                            <div className="mt-1">
                                                <StatusBadge
                                                    status={request.invoice.status === 'en_attente'
                                                        ? 'en_attente'
                                                        : request.invoice.status === 'payé'
                                                            ? 'payé'
                                                            : 'annulé'}
                                                    size="sm"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Liens vers les détails et actions de facture */}
                                    <div className="mt-4 flex gap-2">
                                        <Link
                                            href={`/dashboard/invoices/${request.invoice.id}`}
                                            className="text-sm text-blue-600 hover:text-blue-800"
                                        >
                                            Voir les détails
                                        </Link>
                                        {request.invoice.status === 'en_attente' && (
                                            <Link
                                                href={`/dashboard/invoices/${request.invoice.id}/payment/create`}
                                                className="text-sm text-green-600 hover:text-green-800 ml-4"
                                            >
                                                Enregistrer un paiement
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Historique des statuts */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-2">Historique</h3>
                            {request.status_history.length > 0 ? (
                                <div className="bg-gray-50 rounded-md p-4">
                                    <ol className="relative border-l border-gray-300">
                                        {request.status_history.map((entry) => (
                                            <li key={entry.id} className="mb-6 ml-6">
                                                <span className="absolute flex items-center justify-center w-6 h-6 rounded-full -left-3 ring-8 ring-gray-50 bg-white">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                    </svg>
                                                </span>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <StatusBadge status={entry.new_status} size="sm" />
                                                    <span className="text-xs text-gray-500">
                                                        {formatDate(entry.created_at)}
                                                    </span>
                                                </div>
                                                <p className="text-sm font-normal text-gray-700">
                                                    Statut changé par <span className="font-medium">{entry.admin.name}</span> de{' '}
                                                    <StatusBadge status={entry.previous_status} size="sm" /> à{' '}
                                                    <StatusBadge status={entry.new_status} size="sm" />
                                                </p>
                                                {entry.comment && (
                                                    <p className="mt-1 text-sm text-gray-600 italic">
                                                        -- {entry.comment} --
                                                    </p>
                                                )}
                                            </li>
                                        ))}
                                    </ol>
                                </div>
                            ) : (
                                <div className="bg-gray-50 rounded-md p-4 text-gray-500 text-sm">
                                    Aucun historique de statut disponible.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Colonne latérale - Infos client et admin */}
                    <div className="space-y-6">
                        {/* Informations client */}
                        <div className="bg-gray-50 rounded-md p-4">
                            <h3 className="text-sm font-medium text-gray-700 mb-3">Informations client</h3>
                            <div className="space-y-2">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{request.client.full_name}</p>
                                    <p className="text-sm text-gray-600">{request.client.whatsapp_number}</p>
                                </div>
                                {request.client.email && (
                                    <p className="text-sm text-gray-600">
                                        <span className="block font-medium text-xs text-gray-500">Email</span>
                                        <a href={`mailto:${request.client.email}`} className="text-blue-600 hover:text-blue-800">
                                            {request.client.email}
                                        </a>
                                    </p>
                                )}
                                {request.client.adresse && (
                                    <p className="text-sm text-gray-600">
                                        <span className="block font-medium text-xs text-gray-500">Adresse</span>
                                        {request.client.adresse}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Information sur l'administrateur assigné */}
                        <div className="bg-gray-50 rounded-md p-4">
                            <h3 className="text-sm font-medium text-gray-700 mb-3">
                                {request.assigned_admin ? 'Administrateur assigné' : 'Assignation'}
                            </h3>
                            {request.assigned_admin ? (
                                <div className="space-y-2">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{request.assigned_admin.name}</p>
                                        <p className="text-sm text-gray-600">
                                            <a href={`mailto:${request.assigned_admin.email}`} className="text-blue-600 hover:text-blue-800">
                                                {request.assigned_admin.email}
                                            </a>
                                        </p>
                                    </div>
                                    {request.assigned_admin.is_current_admin && (
                                        <p className="mt-2 text-xs text-gray-500">
                                            Vous êtes assigné à cette demande.
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="text-sm text-gray-600">
                                    <p>Cette demande n&apos;est pas encore assignée à un administrateur.</p>
                                    {request.permissions.can_modify && (
                                        <button
                                            onClick={() => setShowAssignModal(true)}
                                            className="mt-2 inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                            </svg>
                                            M&apos;assigner cette demande
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal pour vérification du client avant de créer une facture */}
            {showClientVerification && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
                        <div className="p-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Enregistrement du client</h3>
                        </div>
                        <div className="p-4">
                            <p className="text-gray-600 mb-4">
                                Avant de créer une facture, veuillez enregistrer les informations du client.
                            </p>

                            {/* Passer isClientRegistered=false pour indiquer qu'on sait déjà que le client n'est pas enregistré */}
                            <WhatsappVerification
                                defaultNumber={request.client.whatsapp_number}
                                onClientSelected={handleClientSelected}
                                onClientRegistered={handleClientSelected}
                                isClientRegistered={false}
                            />
                        </div>
                        <div className="p-4 border-t border-gray-200 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => setShowClientVerification(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal pour mettre à jour le statut */}
            {showStatusModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
                        <div className="p-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Modifier le statut</h3>
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nouveau statut
                                </label>
                                <select
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value as RequestStatus | '')}
                                    className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Sélectionner un statut</option>
                                    <option value="en_attente">En attente</option>
                                    <option value="en_traitement">En traitement</option>
                                    <option value="facturé">Facturé</option>
                                    <option value="payé">Payé</option>
                                    <option value="commandé">Commandé</option>
                                    <option value="expédié">Expédié</option>
                                    <option value="livré">Livré</option>
                                    <option value="annulé">Annulé</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Commentaire (optionnel)
                                </label>
                                <textarea
                                    value={statusComment}
                                    onChange={(e) => setStatusComment(e.target.value)}
                                    rows={3}
                                    className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Ajoutez un commentaire expliquant ce changement de statut..."
                                />
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-200 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => setShowStatusModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                            >
                                Annuler
                            </button>
                            <button
                                type="button"
                                onClick={handleStatusUpdate}
                                disabled={!newStatus || isUpdatingStatus}
                                className={`px-4 py-2 rounded-md text-sm text-white ${isUpdatingStatus || !newStatus
                                        ? 'bg-blue-400 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700'
                                    }`}
                            >
                                {isUpdatingStatus ? 'Mise à jour...' : 'Mettre à jour'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal pour confirmer l'assignation */}
            {showAssignModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
                        <div className="p-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Assigner la demande</h3>
                        </div>
                        <div className="p-4">
                            <p className="text-gray-700">
                                Voulez-vous vous assigner cette demande ?
                                Vous serez responsable de son suivi et de son traitement.
                            </p>
                        </div>
                        <div className="p-4 border-t border-gray-200 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => setShowAssignModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                            >
                                Annuler
                            </button>
                            <button
                                type="button"
                                onClick={handleAssign}
                                disabled={isAssigning}
                                className={`px-4 py-2 rounded-md text-sm text-white ${isAssigning
                                        ? 'bg-blue-400 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700'
                                    }`}
                            >
                                {isAssigning ? 'Assignation...' : 'M\'assigner'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}