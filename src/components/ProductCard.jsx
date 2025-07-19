"use client";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import ProductCarousel from "./ProductCarousel";
import { isSale, isNew } from "@/lib/utils";
import { Heart } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { addFavorite, removeFavorite } from "@/lib/favorites";

export default function ProductCard({ product, onClick }) {
    const { name, description, price, images, sale_price, stock } = product;
    const { addToCart } = useCart();
    const [quantity, setQuantity] = useState(1);
    const saleActive = isSale(product);
    const newProduct = isNew(product);
    const { user, refreshUser } = useAuth();
    const availableStock = Number(stock) || 0;
    const router = useRouter();

    // Estado de favorito, sincronizado con user.favorites siempre
    const [fav, setFav] = useState(false);

    useEffect(() => {
        if (user && user.favorites) {
            setFav(user.favorites.includes(product._id));
        } else {
            setFav(false);
        }
    }, [user, product._id]);

    const handleFav = async (e) => {
        e.stopPropagation();
        if (!user) {
            toast.error("Debes iniciar sesión para agregar a favoritos");
            return;
        }
        try {
            if (!fav) {
                await addFavorite(user._id, product._id);
                toast.success("Agregado a favoritos");
            } else {
                await removeFavorite(user._id, product._id);
                toast.success("Eliminado de favoritos");
            }
            await refreshUser(); // Refresca el user y sus favoritos
        } catch (err) {
            toast.error("Error al actualizar favoritos");
        }
    };

    const handleCardClick = () => {
        router.push(`/products/${product._id}`);
    };

    return (
        <div
            className="w-[260px] bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 transition-transform hover:scale-[1.02] relative group cursor-pointer"
            onClick={handleCardClick}
            tabIndex={0}
            aria-label={`Ver detalles de ${name}`}
        >
            {/* BADGES */}
            {(saleActive || newProduct) && (
                <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
                    {saleActive && (
                        <span className="bg-red-500 text-white px-2 py-0.5 rounded text-xs font-bold shadow">SALE</span>
                    )}
                    {newProduct && (
                        <span className="bg-green-600 text-white px-2 py-0.5 rounded text-xs font-semibold shadow">NEW</span>
                    )}
                </div>
            )}

            {/* Wishlist */}
            <button
                onClick={handleFav}
                className="absolute top-3 right-3 z-10 bg-white/80 hover:bg-pink-100 p-1 rounded-full shadow"
                aria-label="Agregar a favoritos"
                tabIndex={0}
            >
                <Heart className={fav ? "fill-pink-500 text-pink-500" : "text-gray-400"} size={18} />
            </button>

            {/* Carrusel */}
            <ProductCarousel images={images} />

            <div className="p-4 space-y-2">
                <h3
                    className="text-base font-semibold text-gray-900 line-clamp-2 min-h-[2.8em] max-h-[2.8em] break-words"
                    title={name}
                >
                    {name.length > 60 ? name.slice(0, 57) + "..." : name}
                </h3>
                <p
                  className="text-sm text-gray-600 line-clamp-3 min-h-[3.6em] max-h-[3.6em] break-words"
                >
                  {description}
                </p>
                <div className="flex justify-between items-end pt-2 border-t border-gray-100">
                    <div>
                        {saleActive ? (
                            <>
                                <span className="text-base font-bold text-red-600">${Number(sale_price).toFixed(2)}</span>
                                <span className="text-xs line-through text-gray-400 ml-1">${Number(price).toFixed(2)}</span>
                            </>
                        ) : (
                            <span className="text-base font-bold text-gray-900">${Number(price).toFixed(2)}</span>
                        )}
                    </div>
                    {/* Cantidad */}
                    <div className="flex items-center gap-1">
                        <button
                            className="px-2 py-0.5 rounded-l bg-gray-100 hover:bg-gray-200 text-lg font-bold"
                            onClick={e => { e.stopPropagation(); setQuantity(q => Math.max(1, q - 1)); }}
                            disabled={quantity === 1}
                        >-</button>
                        <input
                            type="number"
                            value={quantity}
                            min={1}
                            max={availableStock}
                            onChange={e => {
                                let val = Math.max(1, Math.min(availableStock, Number(e.target.value)));
                                setQuantity(val);
                            }}
                            onClick={e => e.stopPropagation()}
                            className="w-9 text-center border rounded"
                        />
                        <button
                            className="px-2 py-0.5 rounded-r bg-gray-100 hover:bg-gray-200 text-lg font-bold"
                            onClick={e => { e.stopPropagation(); setQuantity(q => Math.min(availableStock, q + 1)); }}
                            disabled={quantity === availableStock}
                        >+</button>
                    </div>
                </div>
                {/* Stock y comprar */}
                <div className="flex justify-between items-center mt-2">
                    <span className={`text-xs font-semibold ${availableStock === 0 ? "text-red-500" : availableStock < 3 ? "text-yellow-600" : "text-green-700"}`}>
                        {availableStock === 0
                            ? "Sin stock"
                            : availableStock < 3
                                ? `¡Últimas ${availableStock}!`
                                : "En stock"}
                    </span>
                    <button
                        className="px-3 py-1.5 bg-black text-white rounded-md hover:bg-gray-800 transition-colors text-xs font-medium"
                        onClick={e => { e.stopPropagation(); if (availableStock > 0) addToCart(product, quantity); }}
                        disabled={availableStock === 0 || quantity > availableStock}
                    >
                        Agregar
                    </button>
                </div>
                {/* Puntuación */}
                {/* {typeof product.ratingAvg === "number" && product.ratingCount > 0 && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-yellow-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 fill-yellow-400 text-yellow-400" viewBox="0 0 24 24"><path d="M12 17.75l-6.172 3.245 1.179-6.873-5-4.873 6.9-1.002L12 2.5l3.093 6.747 6.9 1.002-5 4.873 1.179 6.873z"/></svg>
                        <span>{product.ratingAvg.toFixed(1)} / 5</span>
                        <span className="text-gray-400">({product.ratingCount})</span>
                    </div>
                )} */}
            </div>
        </div>
    );
}
