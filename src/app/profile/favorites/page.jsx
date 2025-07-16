"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";

export default function FavoritesPage() {
    const { user } = useAuth();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFavorites = async () => {
            setLoading(true);
            const res = await fetch(`/api/users/${user._id}/favorites/`, {
                method: 'GET',
                headers: { "Content-Type": "application/json" },
            });
            if (res.ok) {
                const data = await res.json();
                setFavorites(data); // un array de productos
            }   
            setLoading(false);
        };
        if (user) fetchFavorites();
        else setLoading(false);
    }, [user]);


    if (loading) {
        return (
            <div className="flex justify-center py-16 text-gray-400">Cargando favoritos...</div>
        );
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center py-20">
                <p className="mb-4 text-gray-700 text-lg">Debes iniciar sesión para ver tus favoritos.</p>
                <Link href="/login" className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800">
                    Iniciar sesión
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6 text-gray-900">Mis Favoritos</h1>

            {favorites?.length === 0 ? (
                <div className="flex flex-col items-center py-16">
                    <p className="text-gray-500 mb-3">Todavía no tienes productos en favoritos.</p>
                    <Link
                        href="/products"
                        className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
                    >
                        Ir a la tienda
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                    {favorites
                        // Filtra productos duplicados por _id
                        .filter((product, idx, arr) =>
                            arr.findIndex(p => p._id === product._id) === idx
                        )
                        .map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                </div>
            )}
        </div>
    );
}