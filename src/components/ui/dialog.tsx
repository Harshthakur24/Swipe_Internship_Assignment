"use client";

import React from 'react';
import { X } from 'lucide-react';
import { Button } from './button';

interface DialogProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    onConfirm: () => void;
    onCancel: () => void;
    variant?: 'default' | 'destructive';
}

export function Dialog({
    isOpen,
    onClose,
    title,
    message,
    confirmText,
    cancelText,
    onConfirm,
    onCancel,
    variant = 'default'
}: DialogProps) {
    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    const handleCancel = () => {
        onCancel();
        onClose();
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            handleCancel();
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={handleBackdropClick}
        >
            <div className="bg-card border border-border rounded-lg shadow-lg w-full max-w-md p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCancel}
                        className="h-6 w-6 p-0 hover:bg-muted"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Content */}
                <div className="mb-6">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {message}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={handleCancel}
                        className="px-4 py-2"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant={variant === 'destructive' ? 'destructive' : 'default'}
                        onClick={handleConfirm}
                        className="px-4 py-2"
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </div>
    );
}
