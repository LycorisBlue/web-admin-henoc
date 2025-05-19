'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const router = useRouter();
    const pathname = usePathname();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [userName, setUserName] = useState('Admin');
    const [userRole, setUserRole] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Vérifier l'authentification au chargement
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        const role = localStorage.getItem('userRole');

        if (!token) {
            router.push('/login');
        } else {
            setUserRole(role || 'admin');
        }
    }, [router]);

    // Fonction de déconnexion
    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userRole');
        router.push('/login');
    };

    // Fonction pour vérifier si un lien est actif
    const isLinkActive = (href: string) => {
        return pathname === href || pathname.startsWith(`${href}/`);
    };

    // Déterminer la classe d'un lien de navigation selon son état actif
    const getLinkClasses = (href: string) => {
        return `flex items-center px-6 py-3 text-sm transition-colors ${isLinkActive(href)
                ? 'bg-gradient-to-r from-[#E94E1B] to-[#FF8C1A] text-white font-medium rounded-l-full'
                : 'text-gray-600 hover:bg-gray-50 hover:text-[#E94E1B]'
            }`;
    };

    // Toggle menu mobile
    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar - version desktop */}
            <aside className="hidden lg:block w-72 bg-white shadow-lg fixed inset-y-0 left-0 z-10">
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="px-6 py-8">
                        <div className="flex items-center">
                            <div className="flex items-center space-x-2">
                                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center relative overflow-hidden">
                                    <div className="absolute inset-0 bg-red-600"></div>
                                    <div className="text-yellow-400 text-xs">★</div>
                                </div>
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center relative overflow-hidden border border-gray-200">
                                    <div className="absolute inset-0 flex">
                                        <div className="w-1/3 bg-orange-500"></div>
                                        <div className="w-1/3 bg-white"></div>
                                        <div className="w-1/3 bg-green-600"></div>
                                    </div>
                                </div>
                            </div>
                            <div className="ml-3">
                                <h1 className="text-xl font-bold text-gray-900">
                                    <span>Mon</span>
                                    <br />
                                    <span>Fournisseur</span>
                                    <span className="text-[#FF8C1A]">2.0</span>
                                </h1>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 py-6 overflow-y-auto">
                        <div className="space-y-2 px-3">
                            <Link href="/dashboard" className={getLinkClasses('/dashboard')}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                <span>Tableau de bord</span>
                            </Link>
                            <Link href="/requests" className={getLinkClasses('/requests')}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                <span>Demandes</span>
                            </Link>
                            <Link href="/invoices" className={getLinkClasses('/invoices')}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span>Factures</span>
                            </Link>
                            <Link href="/payments" className={getLinkClasses('/payments')}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Paiements</span>
                            </Link>
                            <Link href="/clients" className={getLinkClasses('/clients')}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                <span>Clients</span>
                            </Link>
                            {userRole === 'superadmin' && (
                                <Link href="/admins" className={getLinkClasses('/admins')}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>Administrateurs</span>
                                </Link>
                            )}
                        </div>
                    </nav>

                    {/* Profil en bas */}
                    <div className="mt-auto px-6 py-4 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#E94E1B] to-[#FF8C1A] flex items-center justify-center text-white font-bold">
                                    {userName?.charAt(0) || 'A'}
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-900">{userName}</p>
                                    <p className="text-xs text-gray-500">{userRole === 'superadmin' ? 'Super Admin' : 'Admin'}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 hover:text-[#E94E1B]"
                                title="Déconnexion"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Header mobile */}
            <header className="lg:hidden fixed top-0 inset-x-0 z-20 bg-white shadow-sm">
                <div className="px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center">
                        <button
                            type="button"
                            className="mr-2 text-gray-600"
                            onClick={toggleMobileMenu}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center relative overflow-hidden mr-1">
                                <div className="absolute inset-0 bg-red-600"></div>
                                <div className="text-yellow-400 text-xs">★</div>
                            </div>
                            <h1 className="text-lg font-semibold text-gray-900 ml-2">Mon Fournisseur 2.0</h1>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 hover:text-[#E94E1B]"
                        title="Déconnexion"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>
                </div>
            </header>

            {/* Menu mobile */}
            {isMobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-30 bg-black bg-opacity-50 backdrop-blur-sm" onClick={toggleMobileMenu}>
                    <div
                        className="bg-white h-full w-72 shadow-xl transform transition-transform duration-300 ease-in-out"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-6 py-6 flex justify-between items-center border-b border-gray-100">
                            <div className="flex items-center">
                                <div className="flex items-center space-x-2">
                                    <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center relative overflow-hidden">
                                        <div className="absolute inset-0 bg-red-600"></div>
                                        <div className="text-yellow-400 text-xs">★</div>
                                    </div>
                                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center relative overflow-hidden border border-gray-200">
                                        <div className="absolute inset-0 flex">
                                            <div className="w-1/3 bg-orange-500"></div>
                                            <div className="w-1/3 bg-white"></div>
                                            <div className="w-1/3 bg-green-600"></div>
                                        </div>
                                    </div>
                                </div>
                                <h1 className="text-lg font-semibold text-gray-900 ml-2">Mon Fournisseur 2.0</h1>
                            </div>
                            <button
                                type="button"
                                className="text-gray-500 hover:text-gray-700"
                                onClick={toggleMobileMenu}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <nav className="mt-6 px-3">
                            <div className="space-y-2">
                                <Link href="/dashboard" className={getLinkClasses('/dashboard')} onClick={toggleMobileMenu}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                    <span>Tableau de bord</span>
                                </Link>
                                <Link href="/requests" className={getLinkClasses('/requests')} onClick={toggleMobileMenu}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    <span>Demandes</span>
                                </Link>
                                <Link href="/invoices" className={getLinkClasses('/invoices')} onClick={toggleMobileMenu}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span>Factures</span>
                                </Link>
                                <Link href="/payments" className={getLinkClasses('/payments')} onClick={toggleMobileMenu}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>Paiements</span>
                                </Link>
                                <Link href="/clients" className={getLinkClasses('/clients')} onClick={toggleMobileMenu}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                    <span>Clients</span>
                                </Link>
                                {userRole === 'superadmin' && (
                                    <Link href="/admins" className={getLinkClasses('/admins')} onClick={toggleMobileMenu}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>Administrateurs</span>
                                    </Link>
                                )}
                            </div>
                        </nav>
                        <div className="absolute bottom-0 left-0 right-0 px-6 py-4 border-t border-gray-100">
                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#E94E1B] to-[#FF8C1A] flex items-center justify-center text-white font-bold">
                                    {userName?.charAt(0) || 'A'}
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-900">{userName}</p>
                                    <p className="text-xs text-gray-500">{userRole === 'superadmin' ? 'Super Admin' : 'Admin'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Contenu principal */}
            <main className="flex-1 lg:ml-72 pt-16 lg:pt-0 min-h-screen">
                <div className="p-6 lg:p-10">
                    {children}
                </div>
            </main>
        </div>
    );
}