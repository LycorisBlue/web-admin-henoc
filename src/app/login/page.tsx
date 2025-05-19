/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import authService from '@/services/authService';

// Types pour les erreurs de formulaire
interface FormErrors {
    email?: string;
    password?: string;
    general?: string;
}

export default function LoginPage() {
    const router = useRouter();

    // État du formulaire
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<FormErrors>({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Validation du formulaire
    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};
        let isValid = true;

        if (!email.trim()) {
            newErrors.email = "L'email est requis";
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = "Format d'email invalide";
            isValid = false;
        }

        if (!password) {
            newErrors.password = "Le mot de passe est requis";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    // Soumission du formulaire
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setErrors({});

        try {
            // Appel du service d'authentification
            const response = await authService.login({ email, password });

            // Sauvegarde des tokens
            const { accessToken, refreshToken, role } = response.data;
            localStorage.setItem('accessToken', accessToken);
            if (refreshToken) {
                localStorage.setItem('refreshToken', refreshToken);
            }
            localStorage.setItem('userRole', role);

            // Redirection vers le dashboard
            router.push('/dashboard');
        } catch (error: any) {
            console.error('Erreur de connexion:', error);

            // Traitement des erreurs de l'API
            if (error.status === 401) {
                if (error.data?.errorType === 'INVALID_EMAIL') {
                    setErrors({ email: 'Email non reconnu' });
                } else if (error.data?.errorType === 'INVALID_PASSWORD') {
                    setErrors({ password: 'Mot de passe incorrect' });
                } else {
                    setErrors({ general: 'Identifiants invalides' });
                }
            } else if (error.status === 429) {
                setErrors({ general: 'Trop de tentatives. Veuillez réessayer plus tard.' });
            } else {
                setErrors({ general: 'Une erreur est survenue. Veuillez réessayer.' });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
                <div className="flex flex-col items-center">
                    <div className="mb-6 text-center">
                        {/* Logo Mon Fournisseur 2.0 - remplacer par votre propre import */}
                        <div className="w-64 h-16 relative flex items-center justify-center">
                            <div className="flex items-center">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center relative overflow-hidden mr-1">
                                        {/* Drapeau chinois stylisé */}
                                        <div className="absolute inset-0 bg-red-600"></div>
                                        <div className="text-yellow-400 text-xs">★</div>
                                    </div>
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center relative overflow-hidden ml-1">
                                        {/* Drapeau ivoirien stylisé */}
                                        <div className="absolute inset-0 flex">
                                            <div className="w-1/3 bg-orange-500"></div>
                                            <div className="w-1/3 bg-white"></div>
                                            <div className="w-1/3 bg-green-600"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-2xl font-bold ml-2">
                                    <span>Mon</span>
                                    <br />
                                    <span>Fournisseur</span>
                                    <span className="text-[#FF8C1A]">2.0</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900">
                        Espace Administration
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Connectez-vous pour gérer les commandes et factures
                    </p>
                </div>

                {errors.general && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
                        <p className="font-medium">Erreur</p>
                        <p>{errors.general}</p>
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md space-y-6">
                        {/* Champ Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Adresse email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`appearance-none rounded-lg relative block w-full px-4 py-3 border ${errors.email ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300'
                                    } placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#E94E1B] focus:border-[#E94E1B] transition duration-150 ease-in-out sm:text-sm`}
                                placeholder="admin@example.com"
                                disabled={isLoading}
                            />
                            {errors.email && (
                                <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                            )}
                        </div>

                        {/* Champ Mot de passe */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Mot de passe
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={`appearance-none rounded-lg relative block w-full px-4 py-3 border ${errors.password ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300'
                                        } placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#E94E1B] focus:border-[#E94E1B] transition duration-150 ease-in-out sm:text-sm`}
                                    placeholder="••••••••"
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500 hover:text-gray-700 focus:outline-none transition duration-150 ease-in-out"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 1.651 1.651 0 000-1.185A10.004 10.004 0 009.999 3a9.956 9.956 0 00-4.744 1.194L3.28 2.22zM7.752 6.69l1.092 1.092a2.5 2.5 0 013.374 3.373l1.091 1.092a4 4 0 00-5.557-5.557z" clipRule="evenodd" />
                                            <path d="M10.748 13.93l2.523 2.523a9.987 9.987 0 01-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 010-1.186A10.007 10.007 0 012.839 6.02L6.07 9.252a4 4 0 004.678 4.678z" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white ${isLoading ? 'bg-[#FF8C1A]/70' : 'bg-[#E94E1B] hover:bg-[#FF8C1A]'
                                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF8C1A] transition duration-150 ease-in-out`}
                        >
                            {isLoading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Connexion en cours...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                    </svg>
                                    Se connecter
                                </span>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            <div className="mt-8 text-center text-sm text-gray-500">
                © {new Date().getFullYear()} Mon Fournisseur 2.0. Tous droits réservés.
            </div>
        </div>
    );
}