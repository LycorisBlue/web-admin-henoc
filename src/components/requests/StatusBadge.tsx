'use client';

import { useMemo } from 'react';
import { RequestStatus } from '@/types/request';

// Configuration des couleurs et labels pour chaque statut
const statusConfig: Record<RequestStatus, { color: string; label: string }> = {
    'en_attente': {
        color: 'bg-yellow-100 text-yellow-800',
        label: 'En attente'
    },
    'en_traitement': {
        color: 'bg-blue-100 text-blue-800',
        label: 'En traitement'
    },
    'facturé': {
        color: 'bg-green-100 text-green-800',
        label: 'Facturé'
    },
    'payé': {
        color: 'bg-purple-100 text-purple-800',
        label: 'Payé'
    },
    'commandé': {
        color: 'bg-indigo-100 text-indigo-800',
        label: 'Commandé'
    },
    'expédié': {
        color: 'bg-pink-100 text-pink-800',
        label: 'Expédié'
    },
    'livré': {
        color: 'bg-teal-100 text-teal-800',
        label: 'Livré'
    },
    'annulé': {
        color: 'bg-red-100 text-red-800',
        label: 'Annulé'
    }
};

interface StatusBadgeProps {
    status: RequestStatus;
    className?: string;
    // Option pour afficher un badge plus petit ou plus grand
    size?: 'sm' | 'md' | 'lg';
}

/**
 * Composant pour afficher un badge coloré représentant le statut d'une demande
 */
export default function StatusBadge({ status, className = '', size = 'md' }: StatusBadgeProps) {
    // Calcul des classes CSS en fonction du statut et de la taille
    const classes = useMemo(() => {
        const config = statusConfig[status] || {
            color: 'bg-gray-100 text-gray-800',
            label: status
        };

        // Styles de base communs à toutes les tailles
        const baseClasses = `inline-flex items-center rounded-full font-medium ${config.color}`;

        // Styles spécifiques à la taille
        const sizeClasses = {
            'sm': 'text-xs px-2 py-0.5',
            'md': 'text-sm px-2.5 py-0.5',
            'lg': 'text-sm px-3 py-1'
        };

        return `${baseClasses} ${sizeClasses[size]} ${className}`;
    }, [status, size, className]);

    // Récupérer le label à afficher pour le statut
    const label = statusConfig[status]?.label || status;

    return (
        <span className={classes}>
            {label}
        </span>
    );
}

/**
 * Variante du badge de statut sous forme de point (plus compact)
 */
export function StatusDot({ status, className = '' }: { status: RequestStatus; className?: string }) {
    const config = statusConfig[status] || {
        color: 'bg-gray-100 text-gray-800',
        label: status
    };

    // Extraire juste la couleur de fond du badge
    const dotColor = config.color.split(' ')[0].replace('bg-', 'bg-');

    return (
        <span className="inline-flex items-center">
            <span className={`inline-block h-2 w-2 rounded-full ${dotColor} ${className}`} />
            <span className="ml-2 text-sm text-gray-700">{config.label}</span>
        </span>
    );
}