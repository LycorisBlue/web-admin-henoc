/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import visualizationService, { PaymentsByMethodData } from '@/services/visualizationService';

/**
 * Composant qui affiche les paiements par méthode sous forme de graphique en barres
 */
export default function PaymentsByMethodChart() {
    const [data, setData] = useState<PaymentsByMethodData[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [displayMode, setDisplayMode] = useState<'count' | 'amount'>('amount');

    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                const paymentsByMethod = await visualizationService.getPaymentsByMethod();
                setData(paymentsByMethod);
                setIsLoading(false);
            } catch (error) {
                console.error('Erreur lors du chargement des données de paiement:', error);
                setError(error instanceof Error ? error.message : 'Erreur inconnue');
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    // Format des nombres
    const formatNumber = (value: number) => {
        return new Intl.NumberFormat('fr-FR').format(value);
    };

    // Format des montants
    const formatAmount = (value: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF',
            maximumFractionDigits: 0,
        }).format(value);
    };

    // Format personnalisé pour l'infobulle
    const customTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 shadow-md rounded-md border border-gray-200">
                    <p className="font-medium text-sm">{label}</p>
                    <p className="text-xs text-gray-500">
                        {displayMode === 'amount'
                            ? `Montant: ${formatAmount(payload[0].value)}`
                            : `Nombre: ${formatNumber(payload[0].value)}`}
                    </p>
                </div>
            );
        }
        return null;
    };

    // Changer le mode d'affichage (nombre ou montant)
    const toggleDisplayMode = () => {
        setDisplayMode(displayMode === 'amount' ? 'count' : 'amount');
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
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium text-gray-700">
                    {displayMode === 'amount' ? 'Montant des paiements par méthode' : 'Nombre de paiements par méthode'}
                </h3>
                <button
                    onClick={toggleDisplayMode}
                    className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                >
                    {displayMode === 'amount' ? 'Voir le nombre' : 'Voir le montant'}
                </button>
            </div>
            <ResponsiveContainer width="100%" height="85%">
                <BarChart
                    data={data}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="method" tick={{ fontSize: 12 }} />
                    <YAxis
                        tickFormatter={value => displayMode === 'amount'
                            ? `${Math.round(value / 1000)}k`
                            : formatNumber(value)
                        }
                        tick={{ fontSize: 12 }}
                    />
                    <Tooltip content={customTooltip} />
                    <Bar
                        dataKey={displayMode === 'amount' ? 'amount' : 'count'}
                        fill="#3B82F6"
                        radius={[4, 4, 0, 0]}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}