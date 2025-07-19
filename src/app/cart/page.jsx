"use client";
import { ShoppingCart, Trash2, Plus, Minus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import CheckoutModal from "@/components/CheckoutModal";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import OrderSuccessMessage from "@/components/OrderSuccessMessage";
export default function CartPage() {
    const { cart, removeFromCart, updateCartItem, applyCoupon } = useCart();
    const [couponCode, setCouponCode] = useState("");
    const [discount, setDiscount] = useState(0);
    const [error, setError] = useState("");
    const { user } = useAuth();
    const [success, setSuccess] = useState(false);


    // Helper para saber si el producto tiene oferta activa
    const isSale = (item) => {
        if (!item.sale_price || !item.sale_effective_period) return false;
        const now = Date.now();
        const start = new Date(item.sale_effective_period.start).getTime();
        const end = new Date(item.sale_effective_period.end).getTime();
        return now >= start && now <= end;
    };

    const total = cart.reduce((acc, item) => acc + (isSale(item) ? item.sale_price : item.price) * item.quantity, 0);
    const discountedTotal = total - total * discount;


    const handleApplyCoupon = async () => {
        setError("");
        setDiscount(0);
        if (!couponCode) {
            setError("Ingresa un cupón");
            return;
        }
        try {
            const res = await fetch(`/api/coupons/validate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ couponCode, userId: user?._id }),
            });
            const data = await res.json();
            if (res.ok && data.valid) {
                setDiscount(data.discount); // Por ejemplo, 0.10 para 10%
                applyCoupon({ code: couponCode, discount: data.discount }); // <-- Guarda el cupón en el contexto
                setError("");
            } else {
                setDiscount(0);
                applyCoupon(null); // Limpia el cupón en el contexto si no es válido
                setError(data.error || "Cupón no válido");
            }
        } catch (e) {
            setDiscount(0);
            applyCoupon(null);
            setError("Error al validar el cupón");
        }
    };


    // Para sumar/restar cantidad (requiere que tu CartContext tenga updateCartItem)
    const handleChangeQty = (item, delta) => {
        const maxQty = Number(item.stock) || 0;
        let newQty = item.quantity + delta;
        if (newQty > maxQty) newQty = maxQty;
        if (newQty < 1) return removeFromCart(item._id);
        updateCartItem(item._id, newQty);
    };

    if (success) {
        return (
            <OrderSuccessMessage />
        );
    }


    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <ShoppingCart className="w-6 h-6" />
                Carrito de compras
            </h1>
            {cart.length === 0 ? (
                <div className="flex flex-col items-center text-gray-500 py-16">
                    <ShoppingCart className="w-12 h-12 mb-2 text-gray-300" />
                    <div className="mb-2">¡Tu carrito está vacío!</div>
                    <Link href="/" className="text-white bg-black px-6 py-2 rounded-lg font-medium mt-2 hover:bg-gray-800 transition">
                        Seguir comprando
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {cart.map((item) => {
                        const saleActive = isSale(item);
                        const priceToShow = saleActive ? item.sale_price : item.price;
                        console.log("Sale active for item:", item.name, priceToShow);
                        const maxQty = Number(item.stock) || 0;

                        return (
                            <div
                                key={item._id}
                                className="flex items-center border rounded-xl p-4 shadow bg-white relative group transition hover:shadow-md"
                            >
                                <Link href={`/products/${item._id}`}>
                                    <div className="w-24 h-24 bg-gray-50 flex items-center justify-center overflow-hidden rounded-md border border-gray-100">
                                        {item.images && item.images.length > 0 ? (
                                            <img
                                                src={item.images[0]}
                                                alt={item.name}
                                                className="w-full h-full object-contain"
                                            />
                                        ) : (
                                            <span className="text-sm text-gray-400">Sin imagen</span>
                                        )}
                                    </div>
                                </Link>

                                <div className="ml-4 flex-1">
                                    <h2 className="text-lg font-semibold text-gray-900">{item.name}</h2>
                                    {/* Opciones adicionales (ej: tamaño, color) */}
                                    {item.size && (
                                        <p className="text-xs text-gray-500 mb-1">Tamaño: {item.size}</p>
                                    )}
                                    <div className="flex items-end gap-2 mt-1">
                                        {saleActive ? (
                                            <>
                                                <span className="text-base font-bold text-red-600">${Number(item.sale_price).toFixed(2)}</span>
                                                <span className="text-xs line-through text-gray-400">${Number(item.price).toFixed(2)}</span>
                                            </>
                                        ) : (
                                            <span className="text-base font-bold text-gray-900">${Number(item.price).toFixed(2)}</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-3">
                                        <button
                                            className="bg-gray-200 rounded-full p-1 text-gray-600 hover:bg-gray-300 transition"
                                            onClick={() => handleChangeQty(item, -1)}
                                            aria-label="Restar unidad"
                                        >
                                            <Minus size={18} />
                                        </button>
                                        <span className="w-7 text-center">{item.quantity}</span>
                                        <button
                                            className="bg-gray-200 rounded-full p-1 text-gray-600 hover:bg-gray-300 transition"
                                            onClick={() => handleChangeQty(item, 1)}
                                            aria-label="Sumar unidad"
                                            disabled={item.quantity >= maxQty}
                                        >
                                            <Plus size={18} />
                                        </button>
                                        <span className="text-xs text-gray-400 ml-2">
                                            {item.quantity >= maxQty ? "Máximo" : null}
                                        </span>
                                    </div>
                                    <p className="text-xs font-semibold text-gray-500 mt-2">
                                        Subtotal: ${(priceToShow * item.quantity).toFixed(2)}
                                    </p>
                                </div>

                                <button
                                    onClick={() => removeFromCart(item._id)}
                                    className="ml-4 p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-full transition"
                                    aria-label="Eliminar producto"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        );
                    })}
                    <div className="w-full md:w-1/2 mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cupón de descuento
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value)}
                                className="flex-1 border rounded-md px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring focus:border-black"
                                placeholder="Ingresá tu cupón"
                            />
                            <button
                                onClick={handleApplyCoupon}
                                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition text-sm"
                            >
                                Aplicar
                            </button>
                        </div>
                        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                    </div>

                    <div className="pt-4 border-t flex flex-col items-end">
                        <div className="text-right">
                            {discount > 0 && (
                                <p className="text-sm text-green-600 mb-1">
                                    Descuento aplicado: -{(discount * 100).toFixed(0)}%
                                </p>
                            )}
                            <p className="text-xl font-bold">
                                Total: ${discountedTotal.toFixed(2)}
                            </p>
                        </div>
                        <CheckoutModal onSuccess={() => setSuccess(true)} />
                    </div>
                </div>
            )}
        </div>
    );
}