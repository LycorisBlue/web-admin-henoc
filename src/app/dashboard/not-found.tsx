'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

/**
 * Page 404 spécifique au dashboard
 * Cette page s'affiche lorsque l'utilisateur accède à une route du dashboard qui n'existe pas
 */
export default function DashboardNotFound() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Vérifier l'authentification au chargement
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        setIsAuthenticated(!!token);
    }, []);

    // Gestionnaire d'événement pour retourner à la page précédente
    const handleGoBack = () => {
        window.history.back();
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white p-8 shadow-lg rounded-lg max-w-md w-full">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-500 mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>

                    <h1 className="text-xl font-bold text-gray-900 mb-2">Page non trouvée</h1>
                    <p className="text-gray-600 mb-6">
                        La page que vous recherchez n&apos;existe pas ou vous n&apos;avez pas les permissions nécessaires pour y accéder.
                    </p>

                    <div className="space-y-3">
                        <Link
                            href="/dashboard"
                            className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Retour au tableau de bord
                        </Link>

                        {isAuthenticated ? (
                            <button
                                onClick={handleGoBack}
                                className="block w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Page précédente
                            </button>
                        ) : (
                            <Link
                                href="/login"
                                className="block w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Se connecter
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}