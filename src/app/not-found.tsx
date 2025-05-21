// src/app/not-found.tsx
import Link from 'next/link';

/**
 * Page 404 globale pour tout le site
 * Cette page s'affiche lorsque l'utilisateur accède à une route qui n'existe pas
 */
export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
            <div className="text-center max-w-md">
                <div className="flex justify-center mb-8">
                    {/* Logo stylisé */}
                    <div className="flex items-center space-x-2">
                        <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-red-600"></div>
                            <div className="text-yellow-400 text-lg">★</div>
                        </div>
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center relative overflow-hidden border border-gray-200">
                            <div className="absolute inset-0 flex">
                                <div className="w-1/3 bg-orange-500"></div>
                                <div className="w-1/3 bg-white"></div>
                                <div className="w-1/3 bg-green-600"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <h1 className="text-8xl font-bold text-gray-300 mb-4">404</h1>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Page non trouvée</h2>
                <p className="text-gray-500 mb-8">
                    Désolé, la page que vous recherchez n&apos;existe pas ou a été déplacée.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Retour à l&apos;accueil
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Page précédente
                    </button>
                </div>
            </div>

            <footer className="mt-12 text-sm text-gray-400">
                © {new Date().getFullYear()} Mon Fournisseur 2.0. Tous droits réservés.
            </footer>
        </div>
    );
}