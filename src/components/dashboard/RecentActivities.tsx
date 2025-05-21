'use client';

import { useState, useEffect } from 'react';
import dashboardService, { Activity, ActivityType } from '@/services/dashboardService';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Composant pour afficher les activités récentes
 */
export default function RecentActivities() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadActivities = async () => {
            try {
                setIsLoading(true);
                const data = await dashboardService.getRecentActivities(5);
                setActivities(data);
                setIsLoading(false);
            } catch (error) {
                console.error('Erreur lors du chargement des activités:', error);
                setError(error instanceof Error ? error.message : 'Erreur inconnue');
                setIsLoading(false);
            }
        };

        loadActivities();
    }, []);

    // Fonction pour formater la date
    const formatDate = (dateString: string): string => {
        try {
            return format(parseISO(dateString), 'dd MMM yyyy', { locale: fr });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            return dateString;
        }
    };

    // Fonction pour déterminer la couleur du badge selon le type d'activité
    const getBadgeColor = (type: ActivityType): string => {
        switch (type) {
            case 'request':
                return 'bg-blue-100 text-blue-800';
            case 'invoice':
                return 'bg-green-100 text-green-800';
            case 'payment':
                return 'bg-purple-100 text-purple-800';
            case 'status_change':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Fonction pour afficher le type d'activité en français
    const getTypeLabel = (type: ActivityType): string => {
        switch (type) {
            case 'request':
                return 'Demande';
            case 'invoice':
                return 'Facture';
            case 'payment':
                return 'Paiement';
            case 'status_change':
                return 'Changement';
            default:
                return type;
        }
    };

    // Fonction pour déterminer la couleur du badge de statut
    const getStatusBadgeColor = (status: string): string => {
        switch (status.toLowerCase()) {
            case 'en_attente':
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'payé':
            case 'paid':
            case 'completed':
            case 'success':
                return 'bg-green-100 text-green-800';
            case 'en_traitement':
            case 'processing':
                return 'bg-blue-100 text-blue-800';
            case 'annulé':
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            case 'expédié':
            case 'shipped':
                return 'bg-indigo-100 text-indigo-800';
            case 'livré':
            case 'delivered':
                return 'bg-teal-100 text-teal-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Fonction pour convertir le statut en français lisible
    const getReadableStatus = (status: string): string => {
        switch (status.toLowerCase()) {
            case 'en_attente':
            case 'pending':
                return 'En attente';
            case 'payé':
            case 'paid':
                return 'Payé';
            case 'completed':
                return 'Complété';
            case 'en_traitement':
            case 'processing':
                return 'En traitement';
            case 'annulé':
            case 'cancelled':
                return 'Annulé';
            case 'expédié':
            case 'shipped':
                return 'Expédié';
            case 'livré':
            case 'delivered':
                return 'Livré';
            default:
                return status;
        }
    };

    // Affichage pendant le chargement
    if (isLoading) {
        return (
            <div className="bg-white rounded-xl border overflow-hidden">
                <div className="px-6 py-6">
                    <div className="animate-pulse space-y-6">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="space-y-3">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="grid grid-cols-4 gap-4">
                                    <div className="h-4 bg-gray-200 rounded col-span-1"></div>
                                    <div className="h-4 bg-gray-200 rounded col-span-1"></div>
                                    <div className="h-4 bg-gray-200 rounded col-span-1"></div>
                                    <div className="h-4 bg-gray-200 rounded col-span-1"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Affichage en cas d'erreur
    if (error) {
        return (
            <div className="bg-white rounded-xl border overflow-hidden">
                <div className="px-6 py-6 text-center">
                    <p className="text-red-500">Erreur lors du chargement des activités récentes</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    // Affichage des activités
    return (
        <div className="bg-white rounded-xl border overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Type
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Description
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Statut
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {activities.length > 0 ? (
                            activities.map((activity) => (
                                <tr key={activity.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(activity.date)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getBadgeColor(activity.type)}`}>
                                            {getTypeLabel(activity.type)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {activity.description}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(activity.status)}`}>
                                            {getReadableStatus(activity.status)}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                                    Aucune activité récente à afficher.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-800">
                    Voir toutes les activités →
                </a>
            </div>
        </div>
    );
}