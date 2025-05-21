/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, JSXElementConstructor, ReactElement, ReactNode, ReactPortal } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import visualizationService, { RequestsByStatusData } from '@/services/visualizationService';

/**
 * Composant qui affiche la répartition des demandes par statut sous forme de graphique en donut
 */
export default function RequestsByStatusChart() {
    const [data, setData] = useState<RequestsByStatusData[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                const requestsByStatus = await visualizationService.getRequestsByStatus();
                console.log('Données de statut des demandes:', requestsByStatus);
                setData(requestsByStatus);
                setIsLoading(false);
            } catch (error) {
                console.error('Erreur lors du chargement des données de statut:', error);
                setError(error instanceof Error ? error.message : 'Erreur inconnue');
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    // Format personnalisé pour l'infobulle
    const customTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 shadow-md rounded-md border border-gray-200">
                    <p className="font-medium text-sm">{payload[0].name}: {payload[0].value}</p>
                    <p className="text-xs text-gray-500">
                        {Math.round(payload[0].percent * 100)}% des demandes
                    </p>
                </div>
            );
        }
        return null;
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
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="count"
                        nameKey="status"
                        label={({ percent }: { percent: any }) => `${Math.round(percent * 100)}%`}
                        labelLine={false}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip content={customTooltip} />
                    <Legend
                        layout="vertical"
                        verticalAlign="middle"
                        align="right"
                        formatter={(value: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined, entry: any, index: any) => <span className="text-sm text-gray-700">{value}</span>}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}