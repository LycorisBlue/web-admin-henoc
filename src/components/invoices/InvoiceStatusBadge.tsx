'use client';

import { useMemo } from 'react';
import { InvoiceStatus, PaymentStatus } from '@/types/invoice';

// Configuration des couleurs et labels pour chaque statut de facture
const invoiceStatusConfig: Record<InvoiceStatus, { color: string; label: string }> = {
    'en_attente': {
        color: 'bg-yellow-100 text-yellow-800',
        label: 'En attente'
    },
    'payé': {
        color: 'bg-green-100 text-green-800',
        label: 'Payée'
    },
    'annulé': {
        color: 'bg-red-100 text-red-800',
        label: 'Annulée'
    }
};

// Configuration des couleurs et labels pour chaque statut de paiement
const paymentStatusConfig: Record<PaymentStatus, { color: string; label: string }> = {
    'paid': {
        color: 'bg-green-100 text-green-800',
        label: 'Payé intégralement'
    },
    'partial': {
        color: 'bg-blue-100 text-blue-800',
        label: 'Partiellement payé'
    },
    'unpaid': {
        color: 'bg-red-100 text-red-800',
        label: 'Non payé'
    }
};

interface InvoiceStatusBadgeProps {
    status: InvoiceStatus;
    className?: string;
    // Option pour afficher un badge plus petit ou plus grand
    size?: 'sm' | 'md' | 'lg';
}

/**
 * Composant pour afficher un badge coloré représentant le statut d'une facture
 */
export function InvoiceStatusBadge({ status, className = '', size = 'md' }: InvoiceStatusBadgeProps) {
    // Calcul des classes CSS en fonction du statut et de la taille
    const classes = useMemo(() => {
        const config = invoiceStatusConfig[status] || {
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
    const label = invoiceStatusConfig[status]?.label || status;

    return (
        <span className={classes}>
            {label}
        </span>
    );
}

interface PaymentStatusBadgeProps {
    status: PaymentStatus;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    showPercentage?: number; // Option pour afficher un pourcentage à côté du badge
}

/**
 * Composant pour afficher un badge coloré représentant le statut de paiement d'une facture
 */
export function PaymentStatusBadge({ status, className = '', size = 'md', showPercentage }: PaymentStatusBadgeProps) {
    // Calcul des classes CSS en fonction du statut et de la taille
    const classes = useMemo(() => {
        const config = paymentStatusConfig[status] || {
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
    const label = paymentStatusConfig[status]?.label || status;

    return (
        <span className={classes}>
            {label}
            {showPercentage !== undefined && (
                <span className="ml-1">({showPercentage}%)</span>
            )}
        </span>
    );
}

/**
 * Variante du badge de statut sous forme de point (plus compact)
 */
export function InvoiceStatusDot({ status, className = '' }: { status: InvoiceStatus; className?: string }) {
    const config = invoiceStatusConfig[status] || {
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

/**
 * Formater un montant en devise (XOF)
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'XOF',
        maximumFractionDigits: 0
    }).format(amount);
}

/**
 * Formater une date
 */
export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}