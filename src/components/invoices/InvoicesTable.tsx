'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { InvoiceStatusBadge, PaymentStatusBadge, formatCurrency, formatDate } from './InvoiceStatusBadge';
import invoiceService from '@/services/invoiceService';
import { InvoiceSummary, InvoicesFilterParams, InvoiceStatus, PaymentStatus, PaginationInfo } from '@/types/invoice';
import React from 'react';

/**
 * Tableau des factures avec filtres et pagination
 */
export default function InvoicesTable() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const router = useRouter();

    // État pour stocker les factures
    const [invoices, setInvoices] = useState<InvoiceSummary[]>([]);
    const [pagination, setPagination] = useState<PaginationInfo>({
        total_items: 0,
        total_pages: 0,
        current_page: 1,
        items_per_page: 10,
        has_next_page: false,
        has_previous_page: false
    });

    // État pour les filtres
    const [filters, setFilters] = useState<InvoicesFilterParams>({
        page: 1,
        limit: 10,
        sort_by: 'created_at',
        sort_order: 'DESC'
    });

    // État pour le chargement et les erreurs
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Charger les factures au montage et lorsque les filtres changent
    useEffect(() => {
        const loadInvoices = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const response = await invoiceService.getInvoices(filters);
                setInvoices(response.data.invoices);
                setPagination(response.data.pagination);
            } catch (err) {
                console.error('Erreur lors du chargement des factures:', err);
                setError('Impossible de charger les factures. Veuillez réessayer.');
            } finally {
                setIsLoading(false);
            }
        };

        loadInvoices();
    }, [filters]);

    // Changer de page
    const handlePageChange = (newPage: number) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    // Mettre à jour les filtres de statut
    const handleStatusFilter = (status: InvoiceStatus | undefined) => {
        setFilters(prev => ({ ...prev, status, page: 1 })); // Réinitialiser à la première page
    };

    // Mettre à jour les filtres de statut de paiement
    const handlePaymentStatusFilter = (paymentStatus: PaymentStatus | undefined) => {
        setFilters(prev => ({ ...prev, payment_status: paymentStatus, page: 1 }));
    };

    // Changer le tri
    const handleSortChange = (sortBy: 'created_at' | 'total_amount' | 'status') => {
        setFilters(prev => ({
            ...prev,
            sort_by: sortBy,
            // Inverser l'ordre si on clique sur la même colonne
            sort_order: prev.sort_by === sortBy && prev.sort_order === 'DESC' ? 'ASC' : 'DESC',
            page: 1
        }));
    };

    // Afficher un état de chargement
    if (isLoading && invoices.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                    <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="space-y-2">
                            {[...Array(5)].map((_, index) => (
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

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Filtres */}
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                    {/* Filtre par statut */}
                    <select
                        value={filters.status || ''}
                        onChange={(e) => handleStatusFilter(e.target.value as InvoiceStatus || undefined)}
                        className="rounded-md border border-gray-300 py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Tous les statuts</option>
                        <option value="en_attente">En attente</option>
                        <option value="payé">Payée</option>
                        <option value="annulé">Annulée</option>
                    </select>

                    {/* Filtre par statut de paiement */}
                    <select
                        value={filters.payment_status || ''}
                        onChange={(e) => handlePaymentStatusFilter(e.target.value as PaymentStatus || undefined)}
                        className="rounded-md border border-gray-300 py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Tous les paiements</option>
                        <option value="paid">Payé intégralement</option>
                        <option value="partial">Partiellement payé</option>
                        <option value="unpaid">Non payé</option>
                    </select>
                </div>

                {/* Contrôle de pagination */}
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500">
                        {pagination.total_items} résultat{pagination.total_items > 1 ? 's' : ''}
                    </span>
                    <select
                        value={filters.limit}
                        onChange={(e) => setFilters(prev => ({ ...prev, limit: Number(e.target.value), page: 1 }))}
                        className="rounded-md border border-gray-300 py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="10">10 par page</option>
                        <option value="25">25 par page</option>
                        <option value="50">50 par page</option>
                    </select>
                </div>
            </div>

            {/* Tableau */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                onClick={() => handleSortChange('created_at')}
                            >
                                <div className="flex items-center">
                                    Date
                                    {filters.sort_by === 'created_at' && (
                                        <span className="ml-1">
                                            {filters.sort_order === 'DESC' ? '↓' : '↑'}
                                        </span>
                                    )}
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Client
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                onClick={() => handleSortChange('total_amount')}
                            >
                                <div className="flex items-center">
                                    Montant
                                    {filters.sort_by === 'total_amount' && (
                                        <span className="ml-1">
                                            {filters.sort_order === 'DESC' ? '↓' : '↑'}
                                        </span>
                                    )}
                                </div>
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                onClick={() => handleSortChange('status')}
                            >
                                <div className="flex items-center">
                                    Statut
                                    {filters.sort_by === 'status' && (
                                        <span className="ml-1">
                                            {filters.sort_order === 'DESC' ? '↓' : '↑'}
                                        </span>
                                    )}
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Paiement
                            </th>
                            <th scope="col" className="relative px-6 py-3">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {invoices.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-16 text-center text-gray-500">
                                    Aucune facture trouvée.
                                </td>
                            </tr>
                        ) : (
                            invoices.map((invoice) => (
                                <tr key={invoice.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatDate(invoice.created_at)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {invoice.client.full_name}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {invoice.client.whatsapp_number}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {formatCurrency(invoice.total_amount)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <InvoiceStatusBadge status={invoice.status} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col gap-1">
                                            <PaymentStatusBadge
                                                status={invoice.payment_status}
                                                showPercentage={Math.round((invoice.amount_paid / invoice.total_amount) * 100)}
                                            />
                                            {invoice.payment_status !== 'paid' && invoice.payment_status !== 'unpaid' && (
                                                <div className="text-xs text-gray-500">
                                                    {formatCurrency(invoice.amount_paid)} / {formatCurrency(invoice.total_amount)}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            <Link
                                                href={`/dashboard/invoices/${invoice.id}`}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                Détails
                                            </Link>
                                            {invoice.status === 'en_attente' && (
                                                <Link
                                                    href={`/dashboard/invoices/${invoice.id}/payment/create`}
                                                    className="text-green-600 hover:text-green-900"
                                                >
                                                    Payer
                                                </Link>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination.total_pages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Affichage de{' '}
                                <span className="font-medium">{(pagination.current_page - 1) * pagination.items_per_page + 1}</span>
                                {' '}à{' '}
                                <span className="font-medium">
                                    {Math.min(pagination.current_page * pagination.items_per_page, pagination.total_items)}
                                </span>{' '}
                                sur <span className="font-medium">{pagination.total_items}</span> résultats
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                <button
                                    onClick={() => handlePageChange(pagination.current_page - 1)}
                                    disabled={!pagination.has_previous_page}
                                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${pagination.has_previous_page
                                        ? 'text-gray-500 hover:bg-gray-50'
                                        : 'text-gray-300 cursor-not-allowed'
                                        }`}
                                >
                                    <span className="sr-only">Précédent</span>
                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </button>

                                {/* Pages numérotées - Montre jusqu'à 5 pages autour de la page actuelle */}
                                {Array.from({ length: pagination.total_pages }, (_, i) => i + 1)
                                    .filter(page => {
                                        // Affiche toujours la première page, la dernière page, et les pages autour de la page actuelle
                                        return (
                                            page === 1 ||
                                            page === pagination.total_pages ||
                                            Math.abs(page - pagination.current_page) <= 2
                                        );
                                    })
                                    .map((page, index, array) => {
                                        // Ajouter des ellipses si nécessaire
                                        const prevPage = array[index - 1];
                                        const showEllipsisBefore = prevPage && prevPage !== page - 1;

                                        return (
                                            <React.Fragment key={page}>
                                                {showEllipsisBefore && (
                                                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                                        ...
                                                    </span>
                                                )}
                                                <button
                                                    onClick={() => handlePageChange(page)}
                                                    className={`relative inline-flex items-center px-4 py-2 border ${page === pagination.current_page
                                                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                        } text-sm font-medium`}
                                                >
                                                    {page}
                                                </button>
                                            </React.Fragment>
                                        );
                                    })}

                                <button
                                    onClick={() => handlePageChange(pagination.current_page + 1)}
                                    disabled={!pagination.has_next_page}
                                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${pagination.has_next_page
                                        ? 'text-gray-500 hover:bg-gray-50'
                                        : 'text-gray-300 cursor-not-allowed'
                                        }`}
                                >
                                    <span className="sr-only">Suivant</span>
                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}