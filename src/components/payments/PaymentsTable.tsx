'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import paymentService, { Payment, PaymentsFilterParams, PaginationInfo } from '@/services/paymentService';
import { formatCurrency } from '@/components/invoices/InvoiceStatusBadge';
import React from 'react';

/**
 * Tableau des paiements avec filtres et pagination
 */
export default function PaymentsTable() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const router = useRouter();

    // État pour stocker les paiements
    const [payments, setPayments] = useState<Payment[]>([]);
    const [pagination, setPagination] = useState<PaginationInfo>({
        total_items: 0,
        total_pages: 0,
        current_page: 1,
        items_per_page: 10,
        has_next_page: false,
        has_previous_page: false
    });

    // État pour les filtres
    const [filters, setFilters] = useState<PaymentsFilterParams>({
        page: 1,
        limit: 10,
        sort_by: 'payment_date',
        sort_order: 'DESC'
    });

    // État pour le chargement et les erreurs
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Charger les paiements au montage et lorsque les filtres changent
    useEffect(() => {
        const loadPayments = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const response = await paymentService.getPayments(filters);
                setPayments(response.data.payments);
                setPagination(response.data.pagination);
            } catch (err) {
                console.error('Erreur lors du chargement des paiements:', err);
                setError('Impossible de charger les paiements. Veuillez réessayer.');
            } finally {
                setIsLoading(false);
            }
        };

        loadPayments();
    }, [filters]);

    // Changer de page
    const handlePageChange = (newPage: number) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    // Mettre à jour les filtres de méthode
    const handleMethodFilter = (method: string | undefined) => {
        setFilters(prev => ({ ...prev, method, page: 1 })); // Réinitialiser à la première page
    };

    // Mettre à jour les filtres de période
    const handleDateRangeFilter = (range: 'today' | 'week' | 'month' | 'year' | 'all') => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let dateFrom: string | undefined;

        switch (range) {
            case 'today':
                dateFrom = today.toISOString().split('T')[0];
                break;
            case 'week':
                const lastWeek = new Date(today);
                lastWeek.setDate(lastWeek.getDate() - 7);
                dateFrom = lastWeek.toISOString().split('T')[0];
                break;
            case 'month':
                const lastMonth = new Date(today);
                lastMonth.setMonth(lastMonth.getMonth() - 1);
                dateFrom = lastMonth.toISOString().split('T')[0];
                break;
            case 'year':
                const lastYear = new Date(today);
                lastYear.setFullYear(lastYear.getFullYear() - 1);
                dateFrom = lastYear.toISOString().split('T')[0];
                break;
            case 'all':
                dateFrom = undefined;
                break;
        }

        setFilters(prev => ({
            ...prev,
            date_from: dateFrom,
            page: 1
        }));
    };

    // Changer le tri
    const handleSortChange = (sortBy: 'payment_date' | 'amount_paid' | 'created_at') => {
        setFilters(prev => ({
            ...prev,
            sort_by: sortBy,
            // Inverser l'ordre si on clique sur la même colonne
            sort_order: prev.sort_by === sortBy && prev.sort_order === 'DESC' ? 'ASC' : 'DESC',
            page: 1
        }));
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

    // Obtenir la couleur d'une méthode de paiement
    const getMethodColor = (method: string): string => {
        const colorMap: Record<string, string> = {
            'wave': 'bg-blue-100 text-blue-800',
            'momo': 'bg-yellow-100 text-yellow-800',
            'orange_money': 'bg-orange-100 text-orange-800',
            'zeepay': 'bg-indigo-100 text-indigo-800',
            'cash': 'bg-green-100 text-green-800'
        };

        return colorMap[method] || 'bg-gray-100 text-gray-800';
    };

    // Obtenir le libellé d'une méthode de paiement
    const getMethodLabel = (method: string): string => {
        return paymentService.formatPaymentMethod(method);
    };

    // Afficher un état de chargement
    if (isLoading && payments.length === 0) {
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
                    {/* Filtre par méthode de paiement */}
                    <select
                        value={filters.method || ''}
                        onChange={(e) => handleMethodFilter(e.target.value || undefined)}
                        className="rounded-md border border-gray-300 py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Toutes les méthodes</option>
                        <option value="wave">Wave</option>
                        <option value="momo">Mobile Money</option>
                        <option value="orange_money">Orange Money</option>
                        <option value="zeepay">Zeepay</option>
                        <option value="cash">Espèces</option>
                    </select>

                    {/* Filtre par période */}
                    <select
                        value={filters.date_from ?
                            (new Date().toISOString().split('T')[0] === filters.date_from ? 'today' :
                                new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0] <= filters.date_from ? 'week' :
                                    new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0] <= filters.date_from ? 'month' :
                                        new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split('T')[0] <= filters.date_from ? 'year' : 'all')
                            : 'all'}
                        onChange={(e) => handleDateRangeFilter(e.target.value as 'today' | 'week' | 'month' | 'year' | 'all')}
                        className="rounded-md border border-gray-300 py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">Toutes les périodes</option>
                        <option value="today">Aujourd&apos;hui</option>
                        <option value="week">7 derniers jours</option>
                        <option value="month">30 derniers jours</option>
                        <option value="year">Dernière année</option>
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
                                onClick={() => handleSortChange('payment_date')}
                            >
                                <div className="flex items-center">
                                    Date
                                    {filters.sort_by === 'payment_date' && (
                                        <span className="ml-1">
                                            {filters.sort_order === 'DESC' ? '↓' : '↑'}
                                        </span>
                                    )}
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Facture
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Client
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Méthode
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                onClick={() => handleSortChange('amount_paid')}
                            >
                                <div className="flex items-center">
                                    Montant
                                    {filters.sort_by === 'amount_paid' && (
                                        <span className="ml-1">
                                            {filters.sort_order === 'DESC' ? '↓' : '↑'}
                                        </span>
                                    )}
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Confirmé par
                            </th>
                            <th scope="col" className="relative px-6 py-3">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {payments.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-16 text-center text-gray-500">
                                    Aucun paiement trouvé.
                                </td>
                            </tr>
                        ) : (
                            payments.map((payment) => (
                                <tr key={payment.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatDate(payment.payment_date)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <Link
                                            href={`/dashboard/invoices/${payment.invoice_id}`}
                                            className="text-blue-600 hover:text-blue-800 hover:underline"
                                        >
                                            #{payment.invoice_id.substring(0, 8)}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {payment.client?.full_name || 'N/A'}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {payment.client?.whatsapp_number || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getMethodColor(payment.method)}`}>
                                            {getMethodLabel(payment.method)}
                                        </span>
                                        {payment.reference && (
                                            <div className="text-xs text-gray-500 mt-1">
                                                Réf: {payment.reference}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {formatCurrency(payment.amount_paid)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {payment.confirmed_by.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link
                                            href={`/dashboard/invoices/${payment.invoice_id}`}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            Voir la facture
                                        </Link>
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