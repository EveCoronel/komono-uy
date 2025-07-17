'use client';
import * as Dialog from '@radix-ui/react-dialog';
import { useState, useEffect } from 'react';
import { Star, X } from 'lucide-react';
import { toast } from 'sonner';
export default function ReviewModal({ open, onClose, productId, productName, orderId, userId }) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Resetear campos al abrir/cerrar
    useEffect(() => {
        if (!open) {
            setRating(0);
            setComment('');
            setSubmitting(false);
        }
    }, [open]);

    const handleSubmit = async (e) => {
        // e.preventDefault();
        if (submitting || rating === 0) return;
        setSubmitting(true);
        try {
            const res = await fetch(`/api/reviews/products/${productId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, rating, comment, orderId }),
            });
            if (!res.ok) throw new Error('No se pudo enviar la reseña');
            // Resetear
            setRating(0);
            setComment('');
            toast.success('¡Reseña enviada con éxito!');
            if (onClose) onClose();
        } catch (error) {
            toast.error('Error al enviar la reseña, por favor intente más tarde.');
            console.error('Error enviando reseña', error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog.Root open={open} onOpenChange={val => !val && onClose && onClose()}>
            <Dialog.Portal>
                <Dialog.Overlay className="bg-black/30 fixed inset-0 z-40" />
                <Dialog.Content className="bg-white rounded-xl p-6 shadow-xl fixed z-50 top-[50%] left-[50%] w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2">
                    <div className="flex justify-between items-center mb-4">
                        <Dialog.Title className="text-lg font-semibold text-gray-800">
                            Reseñar: {productName}
                        </Dialog.Title>
                        <Dialog.Close asChild>
                            <button className="text-gray-500 hover:text-gray-700">
                                <X className="w-5 h-5" />
                            </button>
                        </Dialog.Close>
                    </div>

                    <div className="mb-4">
                        <label className="text-sm font-medium text-gray-700 block mb-1">Puntaje</label>
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`w-6 h-6 cursor-pointer ${rating >= star ? 'fill-orange-400 text-orange-400' : 'text-gray-300'
                                        }`}
                                    onClick={() => setRating(star)}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="text-sm font-medium text-gray-700 block mb-1">Comentario</label>
                        <textarea
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                            rows={4}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Escribí tu opinión del producto..."
                        />
                    </div>

                    <button
                        className="bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold px-4 py-2 rounded-md w-full transition disabled:opacity-50"
                        onClick={handleSubmit}
                        disabled={submitting || rating === 0}
                    >
                        {submitting ? 'Enviando...' : 'Enviar reseña'}
                    </button>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
