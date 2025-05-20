// src/components/requests/AssignedRequestsTable.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import StatusBadge from './StatusBadge';
import assignedRequestService from '@/services/assignedRequestService';
import { RequestSummary, RequestsFilterParams, RequestStatus, PaginationInfo } from '@/types/request';

/**
 * Tableau des demandes assignées à l'administrateur connecté
 */
export default function AssignedRequestsTable() {
    // État pour stocker les demandes
    const [requests, setRequests] = useState<RequestSummary[]>([]);
    const [pagination, setPagination] = useState<PaginationInfo>({
        total_items: 0,
        total_pages: 0,
        current_page: 1,
        items_per_page: 10,
        has_next_page: false,
        has_previous_page: false
    });

    // État pour les filtres
    const [filters, setFilters] = useState<RequestsFilterParams>({
        page: 1,
        limit: 5, // Limité à 5 pour une vue condensée
        sort_by: 'created_at',
        sort_order: 'DESC'
    });

    // État pour le chargement et les erreurs
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Charger les demandes au montage et lorsque les filtres changent
    useEffect(() => {
        const loadRequests = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const response = await assignedRequestService.getAssignedRequests(filters);
                setRequests(response.data.requests);
                setPagination(response.data.pagination);
            } catch (err) {
                console.error('Erreur lors du chargement des demandes assignées:', err);
                setError('Impossible de charger les demandes assignées. Veuillez réessayer.');
            } finally {
                setIsLoading(false);
            }
        };

        loadRequests();
    }, [filters]);

    // Mettre à jour les filtres de statut
    const handleStatusFilter = (status: RequestStatus | undefined) => {
        setFilters(prev => ({ ...prev, status, page: 1 }));
    };

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

    // Afficher un état de chargement
    if (isLoading && requests.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                    <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="space-y-2">
                            {[...Array(3)].map((_, index) => (
                                <div key={index} className="h-4 bg-gray-200 rounded"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Afficher un message d'erreur
    if (error) {
        return (
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6 text-center">
                    <p className="text-red-500 mb-4">{error}</p>
                    <button
                        onClick={() => setFilters({ ...filters })} // Recharger avec les mêmes filtres
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    // Si aucune demande assignée
    if (requests.length === 0 && !isLoading) {
        return (
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6 text-center">
                    <p className="text-gray-500">Aucune demande ne vous est assignée actuellement.</p>
                    <p className="text-sm text-gray-500 mt-2">
                        Vous pouvez vous assigner des demandes depuis la liste complète ci-dessous.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Mes demandes assignées</h3>
                <div className="flex items-center gap-2">
                    <select
                        value={filters.status || ''}
                        onChange={(e) => handleStatusFilter(e.target.value as RequestStatus || undefined)}
                        className="rounded-md border border-gray-300 py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Tous les statuts</option>
                        <option value="en_attente">En attente</option>
                        <option value="en_traitement">En traitement</option>
                        <option value="facturé">Facturé</option>
                        <option value="payé">Payé</option>
                        <option value="commandé">Commandé</option>
                        <option value="expédié">Expédié</option>
                        <option value="livré">Livré</option>
                        <option value="annulé">Annulé</option>
                    </select>
                    <Link
                        href="/dashboard/requests/assigned"
                        className="text-sm text-blue-600 hover:text-blue-800"
                    >
                        Voir tout
                    </Link>
                </div>
            </div>

            {/* Tableau */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Statut
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Client
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Dernière mise à jour
                            </th>
                            <th scope="col" className="relative px-6 py-3">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {requests.map((request) => (
                            <tr key={request.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {formatDate(request.created_at)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <StatusBadge status={request.status} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {request.client.full_name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {request.client.whatsapp_number}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatDate(request.updated_at)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link
                                        href={`/dashboard/requests/${request.id}`}
                                        className="text-blue-600 hover:text-blue-900"
                                    >
                                        Voir
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {pagination.total_pages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
                    <div className="flex justify-between w-full">
                        <div>
                            <p className="text-sm text-gray-700">
                                Affichage de {pagination.current_page * pagination.items_per_page - pagination.items_per_page + 1}-
                                {Math.min(pagination.current_page * pagination.items_per_page, pagination.total_items)} sur {pagination.total_items}
                            </p>
                        </div>
                        <div>
                            <Link href="/dashboard/requests/assigned" className="text-sm text-blue-600 hover:underline">
                                Voir toutes mes demandes →
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}