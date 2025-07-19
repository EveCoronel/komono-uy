"use client";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { Heart, Share2, Check } from "lucide-react";
import { isSale, isNew } from "@/lib/utils";
import ProductGallery from "@/components/ProductGallery";
import { useParams } from 'next/navigation';
import { useAuth } from "@/context/AuthContext";
import { addFavorite, removeFavorite, refreshUser } from "@/lib/favorites";
import ProductsGrid from "@/components/ProductsGrid";

const getProductById = async (id) => {
    const res = await fetch(`/api/products/${id}`);
    if (!res.ok) throw new Error("Error al obtener el producto");
    return res.json();
};

const getCategoryById = async (id) => {
    const res = await fetch(`/api/categories/${id}`);
    if (!res.ok) throw new Error("Error al obtener la categoría");
    const category = await res.json();
    return category.name;
};

const getSimilarProducts = async (category) => {
    const res = await fetch(`/api/products/category/${category}`);
    if (!res.ok) throw new Error("Error al obtener productos similares");
    return res.json();
};

export default function ProductPage() {
    const params = useParams();
    const { id } = params;

    const [product, setProduct] = useState(null);
    const [category, setCategory] = useState("");
    const [similar, setSimilar] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [copied, setCopied] = useState(false);
    const { user, refreshUser } = useAuth();
    const { addToCart } = useCart();

    // Estado de favorito, sincronizado con user.favorites siempre
    const [fav, setFav] = useState(false);

    useEffect(() => {
        if (user && user.favorites) {
            setFav(user.favorites.includes(id));
        } else {
            setFav(false);
        }
    }, [user, id]);


    const handleFav = async (e) => {
        e.stopPropagation();
        if (!user) {
            toast.error("Debes iniciar sesión para agregar a favoritos");
            return;
        }
        try {
            if (!fav) {
                await addFavorite(user._id, id);
                toast.success("Agregado a favoritos");
            } else {
                await removeFavorite(user._id, id);
                toast.success("Eliminado de favoritos");
            }
            await refreshUser();
        } catch (err) {
            toast.error("Error al actualizar favoritos");
        }
    };

    useEffect(() => {
        async function fetchData() {
            const prod = await getProductById(id);
            setProduct(prod);
            if (prod) {
                const sims = await getSimilarProducts(prod.category);
                // Filtra fuera el producto actual
                const otherSims = sims.filter(p => p._id !== prod._id);

                // Separa por subcategoría
                const sameSub = otherSims.filter(p => p.subcategory == prod.subcategory);
                console.log("Productos de la misma subcategoría:", sameSub);
                const diffSub = otherSims.filter(p => p.subcategory != prod.subcategory);

                // Une: primero los de la misma subcategoría, luego el resto
                const orderedSims = [...sameSub, ...diffSub];

                setSimilar(orderedSims.slice(0, 3));
                const categoryName = await getCategoryById(prod.category);
                setCategory(categoryName);
            }
        }
        fetchData();
    }, [id]);

    if (!product)
        return (
            <div className="text-center py-12 text-gray-500">
                Cargando producto...
            </div>
        );

    const saleActive = isSale(product);
    const newProduct = isNew(product);
    const maxQty = Number(product.stock) || 0;

    const handleCopyLink = () => {
        if (typeof window === "undefined") return; // 🚫 no hacer nada en el servidor

        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        toast.success("¡Link copiado!");
        setTimeout(() => setCopied(false), 1500);
    };


    return (
        <div className="max-w-4xl mx-auto p-0 sm:p-4 md:py-8">
            <div
                className="
                    bg-white rounded-2xl shadow-sm
                    flex flex-col gap-6
                    md:grid md:grid-cols-2 md:gap-8
                    p-2 sm:p-6
                "
            >
                {/* GALERÍA */}
                <div className="flex flex-col gap-4">
                    <ProductGallery images={product.images} />
                    <div className="flex gap-2">
                        {saleActive && (
                            <span className="bg-red-500 text-white px-2 py-0.5 rounded text-xs font-bold shadow">
                                SALE
                            </span>
                        )}
                        {newProduct && (
                            <span className="bg-green-600 text-white px-2 py-0.5 rounded text-xs font-semibold shadow">
                                NEW
                            </span>
                        )}
                    </div>
                </div>

                {/* INFO Y ACCIONES */}
                <div className="flex flex-col justify-between min-h-[300px]">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                            {product.name}
                        </h1>
                        <p className="text-gray-500 mb-4 text-sm sm:text-base">
                            {product.description}
                        </p>
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                            {saleActive ? (
                                <>
                                    <span className="text-2xl font-bold text-red-600">
                                        ${Number(product.sale_price).toFixed(2)}
                                    </span>
                                    <span className="text-lg line-through text-gray-400">
                                        ${Number(product.price).toFixed(2)}
                                    </span>
                                </>
                            ) : (
                                <span className="text-2xl font-bold text-gray-900">
                                    ${Number(product.price).toFixed(2)}
                                </span>
                            )}
                            <span className="text-xs ml-3 px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                                {category}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                            <span
                                className={`text-sm font-semibold ${maxQty === 0
                                    ? "text-red-500"
                                    : maxQty < 3
                                        ? "text-yellow-700"
                                        : "text-green-700"
                                    }`}
                            >
                                {maxQty === 0
                                    ? "Sin stock"
                                    : maxQty < 3
                                        ? `¡Últimas ${maxQty}!`
                                        : "En stock"}
                            </span>
                            <button
                                className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${fav
                                    ? "bg-pink-100 text-pink-600"
                                    : "bg-gray-100 text-gray-500"
                                    }`}
                                onClick={handleFav}
                                aria-label={fav ? "Quitar de favoritos" : "Agregar a favoritos"}
                            >
                                <Heart size={14} className={fav ? "fill-pink-500" : ""} />
                                {fav ? "Favorito" : "Agregar a favoritos"}
                            </button>
                            <button
                                className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-500 flex items-center gap-1"
                                onClick={handleCopyLink}
                                aria-label="Compartir enlace"
                            >
                                <Share2 size={13} />
                                {copied ? <Check size={13} /> : "Compartir"}
                            </button>
                        </div>
                    </div>

                    {/* AGREGAR AL CARRITO */}
                    <div className="flex items-center gap-2 mt-5 md:mt-8 w-full">
                        <button
                            className="bg-gray-200 rounded-full p-2 text-xl text-gray-700 hover:bg-gray-300 disabled:opacity-40"
                            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                            disabled={quantity === 1}
                            aria-label="Disminuir cantidad"
                        >
                            −
                        </button>
                        <input
                            type="number"
                            className="w-12 text-center border rounded font-semibold text-base"
                            min={1}
                            max={maxQty}
                            value={quantity}
                            onChange={e =>
                                setQuantity(
                                    Math.max(1, Math.min(maxQty, Number(e.target.value)))
                                )
                            }
                        />
                        <button
                            className="bg-gray-200 rounded-full p-2 text-xl text-gray-700 hover:bg-gray-300 disabled:opacity-40"
                            onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                            disabled={quantity === maxQty}
                            aria-label="Aumentar cantidad"
                        >
                            +
                        </button>
                        <button
                            className="ml-2 flex-1 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 font-semibold transition disabled:bg-gray-300 disabled:cursor-not-allowed text-sm sm:text-base"
                            disabled={maxQty === 0}
                            onClick={() => addToCart(product, quantity)}
                        >
                            {maxQty === 0 ? "Sin stock" : "Agregar al carrito"}
                        </button>
                    </div>
                </div>
            </div>

            {/* SIMILARES */}
            {similar.length > 0 && (
                <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4 ml-2 sm:ml-0">
                        Productos similares
                    </h3>
                    {/* <div className="
                        flex gap-4 overflow-x-auto pb-2
                        md:grid md:grid-cols-3 md:gap-4 md:overflow-visible
                    ">
                        {similar.map((p) => (
                            <div key={p._id} className="min-w-[230px] max-w-xs w-full">
                                <ProductCard product={p} />
                            </div>
                        ))}
                    </div> */}
                    <ProductsGrid products={similar} gridSize="3" />
                </div>
            )}
        </div>
    );
}
