/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import visualizationService, { TimeSeriesDataPoint } from '@/services/visualizationService';

/**
 * Composant qui affiche l'activité des 7 derniers jours sous forme de graphique en ligne
 */
export default function ActivityTimeSeriesChart() {
    const [data, setData] = useState<TimeSeriesDataPoint[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeMetrics, setActiveMetrics] = useState<{
        requests: boolean;
        invoices: boolean;
        payments: boolean;
    }>({
        requests: true,
        invoices: true,
        payments: true
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                const timeSeriesData = await visualizationService.getActivityTimeSeriesData();
                setData(timeSeriesData);
                setIsLoading(false);
            } catch (error) {
                console.error('Erreur lors du chargement des données de série temporelle:', error);
                setError(error instanceof Error ? error.message : 'Erreur inconnue');
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    // Gestion des clics sur la légende pour activer/désactiver les métriques
    const handleLegendClick = (metric: 'requests' | 'invoices' | 'payments') => {
        setActiveMetrics(prev => ({
            ...prev,
            [metric]: !prev[metric]
        }));
    };

    // Format personnalisé pour l'infobulle
    const customTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 shadow-md rounded-md border border-gray-200">
                    <p className="font-medium text-sm">{label}</p>
                    <div className="space-y-1 mt-1">
                        {payload.map((entry: any, index: number) => (
                            <p key={index} className="text-xs" style={{ color: entry.color }}>
                                {entry.name === 'requests' ? 'Demandes' :
                                    entry.name === 'invoices' ? 'Factures' : 'Paiements'}: {entry.value}
                            </p>
                        ))}
                    </div>
                </div>
            );
        }
        return null;
    };

    // Légende personnalisée avec cases à cocher
    const renderLegend = () => {
        return (
            <div className="flex flex-wrap gap-4 justify-center text-xs">
                <button
                    onClick={() => handleLegendClick('requests')}
                    className={`flex items-center gap-1 px-2 py-1 rounded ${activeMetrics.requests ? 'bg-blue-100' : 'bg-gray-100'
                        }`}
                >
                    <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                    <span className={activeMetrics.requests ? 'text-blue-700' : 'text-gray-500'}>
                        Demandes
                    </span>
                </button>
                <button
                    onClick={() => handleLegendClick('invoices')}
                    className={`flex items-center gap-1 px-2 py-1 rounded ${activeMetrics.invoices ? 'bg-green-100' : 'bg-gray-100'
                        }`}
                >
                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                    <span className={activeMetrics.invoices ? 'text-green-700' : 'text-gray-500'}>
                        Factures
                    </span>
                </button>
                <button
                    onClick={() => handleLegendClick('payments')}
                    className={`flex items-center gap-1 px-2 py-1 rounded ${activeMetrics.payments ? 'bg-purple-100' : 'bg-gray-100'
                        }`}
                >
                    <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                    <span className={activeMetrics.payments ? 'text-purple-700' : 'text-gray-500'}>
                        Paiements
                    </span>
                </button>
            </div>
        );
    };

    // Render graphique avec états de chargement et d'erreur
    if (isLoading) {
        return (
            <div className="bg-white rounded-xl border p-6 flex items-center justify-center h-80">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-xl border p-6 flex flex-col items-center justify-center h-80">
                <p className="text-red-500 font-medium mb-2">Erreur de chargement</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Réessayer
                </button>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="bg-white rounded-xl border p-6 flex items-center justify-center h-80">
                <p className="text-gray-500">Aucune donnée disponible</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border p-6 h-80">
            <h3 className="text-sm font-medium text-gray-700 mb-4">
                Activité des 7 derniers jours
            </h3>
            <ResponsiveContainer width="100%" height="80%">
                <LineChart
                    data={data}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="formattedDate" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip content={customTooltip} />

                    {activeMetrics.requests && (
                        <Line
                            type="monotone"
                            dataKey="requests"
                            name="Demandes"
                            stroke="#3B82F6" // blue-500
                            activeDot={{ r: 8 }}
                            strokeWidth={2}
                        />
                    )}

                    {activeMetrics.invoices && (
                        <Line
                            type="monotone"
                            dataKey="invoices"
                            name="Factures"
                            stroke="#10B981" // emerald-500
                            activeDot={{ r: 8 }}
                            strokeWidth={2}
                        />
                    )}

                    {activeMetrics.payments && (
                        <Line
                            type="monotone"
                            dataKey="payments"
                            name="Paiements"
                            stroke="#8B5CF6" // violet-500
                            activeDot={{ r: 8 }}
                            strokeWidth={2}
                        />
                    )}
                </LineChart>
            </ResponsiveContainer>

            {renderLegend()}
        </div>
    );
}