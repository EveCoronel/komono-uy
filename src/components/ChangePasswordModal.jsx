"use client";
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';

export default function ChangePasswordModal({ open, onClose }) {
    const [isLoading, setIsLoading] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmNewPassword) {
            toast.error("Las contraseñas nuevas no coinciden");
            return;
        }
        setIsLoading(true);
        try {
            const res = await fetch('/api/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword,
                    newPassword
                }),
            });
            if (res.ok) {
                toast.success("Contraseña actualizada");
                setCurrentPassword('');
                setNewPassword('');
                setConfirmNewPassword('');
                if (onClose) onClose();
            } else {
                const data = await res.json();
                toast.error(data.error || "Error al cambiar la contraseña");
            }
        } catch (err) {
            toast.error("Error de red");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog.Root open={open} onOpenChange={val => !val && onClose && onClose()}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
                <Dialog.Content
                    className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
                    aria-describedby="change-password-description"
                >
                    <Dialog.Title className="text-lg font-semibold mb-4">Cambiar contraseña</Dialog.Title>
                    <Dialog.Description id="change-password-description" className="mb-4 text-sm text-gray-500">
                        Ingresá tu contraseña actual y la nueva para actualizarla.
                    </Dialog.Description>
                    <form className="space-y-3" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <Label htmlFor="current-password">Contraseña actual</Label>
                            <Input
                                id="current-password"
                                name="current-password"
                                type="password"
                                required
                                autoComplete="current-password"
                                value={currentPassword}
                                onChange={e => setCurrentPassword(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new-password">Nueva contraseña</Label>
                            <Input
                                id="new-password"
                                name="new-password"
                                type="password"
                                required
                                autoComplete="new-password"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm-new-password">Confirmar nueva contraseña</Label>
                            <Input
                                id="confirm-new-password"
                                name="confirm-new-password"
                                type="password"
                                required
                                autoComplete="new-password"
                                value={confirmNewPassword}
                                onChange={e => setConfirmNewPassword(e.target.value)}
                            />
                        </div>
                        <Button type="submit" className="space-y-2 w-full" disabled={isLoading}>
                            {isLoading ? <><Spinner />Confirmando...</> : "Confirmar cambio"}
                        </Button>
                    </form>
                    <Dialog.Close asChild>
                        <button
                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                            aria-label="Cerrar"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </Dialog.Close>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
