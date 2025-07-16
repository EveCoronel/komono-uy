"use client";
import "rc-slider/assets/index.css";
import { useState, useEffect } from "react";
import ProductsGrid from "@/components/ProductsGrid";
import { useRouter, useSearchParams } from "next/navigation";
import Slider, { Range } from "rc-slider";

export default function ProductsPageClient({ products }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Inicializar estados con valores de la URL o vacíos
    const [categorias, setCategorias] = useState([]);
    const [subcategorias, setSubcategorias] = useState([]);

    const [categoria, setCategoria] = useState(searchParams.get("categoria") || "");
    const [subcategoria, setSubcategoria] = useState(searchParams.get("subcategoria") || "");
    // Aquí extraemos precioMin y precioMax del searchParams para inicializar precioRange
    const precioMinParam = Number(searchParams.get("precioMin")) || 0;
    const precioMaxParam = Number(searchParams.get("precioMax")) || 5000;
    const [precioRange, setPrecioRange] = useState([precioMinParam, precioMaxParam]);

    const [orden, setOrden] = useState(searchParams.get("orden") || "");
    const [busqueda, setBusqueda] = useState(searchParams.get("busqueda") || "");

    const onPrecioChange = (value) => {
        setPrecioRange(value);
    };

    /*  const categorias = {
         Pins: ["Anime", "Animales", "Otros"],
         Llaveros: ["Metálicos", "Acrílicos"],
         Papelería: ["Stickers", "Cuadernos", "Post-its"],
     };
  */
    useEffect(() => {
        const fetchCategorias = async () => {
            const res = await fetch('/api/categories');
            const data = await res.json();
            setCategorias(data);
        };
        const fetchSubcategorias = async () => {
            const res = await fetch('/api/subcategories');
            const data = await res.json();
            setSubcategorias(data);
        };
        fetchCategorias();
        fetchSubcategorias();
    }, []);

    const onCategoriaChange = (e) => {
        const nuevaCategoria = e.target.value;
        setCategoria(nuevaCategoria);
        setSubcategoria("");

        // Actualizamos la URL con el nuevo valor inmediatamente
        const params = new URLSearchParams();

        if (nuevaCategoria) params.set("categoria", nuevaCategoria);
        // Subcategoría se vacía, no se incluye
        if (precioRange[0] !== 0) params.set("precioMin", precioRange[0]);
        if (precioRange[1] !== 5000) params.set("precioMax", precioRange[1]);
        if (orden) params.set("orden", orden);
        if (busqueda) params.set("busqueda", busqueda);

        router.push(`/products?${params.toString()}`);
    };

    useEffect(() => {
        handleUpdateFilters();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [categoria, subcategoria, precioRange, orden, busqueda]);

    // Función para actualizar la URL con los filtros seleccionados
    const handleUpdateFilters = () => {
        const params = new URLSearchParams();

        if (categoria) params.set("categoria", categoria);
        if (subcategoria) params.set("subcategoria", subcategoria);

        // Seteamos el rango de precios solo si es distinto al default
        if (precioRange[0] !== 0) params.set("precioMin", precioRange[0]);
        if (precioRange[1] !== 5000) params.set("precioMax", precioRange[1]);

        if (orden) params.set("orden", orden);
        if (busqueda) params.set("busqueda", busqueda);

        // Navegar a la nueva URL con filtros
        router.push(`/products?${params.toString()}`);
    };

    // Cuando cambias categoría limpiás subcategoría para evitar filtro inconsistente
    /* const onCategoriaChange = (e) => {
        setCategoria(e.target.value);
        setSubcategoria("");
    }; */

    return (
        <div className="min-h-screen max-w-7xl mx-auto px-4 py-8">
            <section className="mb-8">
                <h2 className="text-4xl font-bold text-gray-900 mb-6">Nuestros productos</h2>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Filtros */}
                <aside className="md:col-span-1 space-y-6">
                    {/* Buscador */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
                        <input
                            type="text"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            placeholder="Nombre del producto"
                            className="w-full border border-gray-300 rounded-md p-2"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault(); // Para evitar que el formulario (si hay) se envíe
                                    handleUpdateFilters();
                                }
                            }}
                        />
                    </div>

                    {/* Categoría */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                        <select
                            className="w-full border border-gray-300 rounded-md p-2"
                            value={categoria}
                            onChange={onCategoriaChange}
                        >
                            <option value="">Todas</option>
                            {categorias.map((cat) => (
                                <option key={cat._id} value={cat.short_id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Subcategoría */}
                    {categoria && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subcategoría</label>
                            <select
                                className="w-full border border-gray-300 rounded-md p-2"
                                value={subcategoria}
                                onChange={(e) => setSubcategoria(e.target.value)}
                            >
                                <option value="">Todas</option>
                                {subcategorias.map((sub) => (
                                    <option key={sub._id} value={sub.short_id}>
                                        {sub.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Precio */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Precio (UYU)
                        </label>
                        <Slider range
                            min={0}
                            max={5000}
                            value={precioRange}
                            onChange={onPrecioChange}
                            allowCross={false}
                            railStyle={{ backgroundColor: "#d1d5db" }}
                            trackStyle={[{ backgroundColor: "#000" }]}
                            handleStyle={[{ borderColor: "#000" }, { borderColor: "#000" }]}
                        />
                        <div className="flex justify-between text-sm mt-1">
                            <span>{precioRange[0]}</span>
                            <span>{precioRange[1]}</span>
                        </div>
                    </div>

                    {/* Ordenar por */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ordenar por</label>
                        <select
                            className="w-full border border-gray-300 rounded-md p-2"
                            value={orden}
                            onChange={(e) => setOrden(e.target.value)}
                        >
                            <option value="">Por defecto</option>
                            <option value="mas_vendidos">Más vendidos</option>
                            <option value="precio_asc">Precio: Menor a mayor</option>
                            <option value="precio_desc">Precio: Mayor a menor</option>
                        </select>
                    </div>

                    {/* Botón para aplicar filtros */}
                    <button
                        onClick={handleUpdateFilters}
                        className="w-full bg-black text-white py-2 px-4 rounded-md mt-4"
                    >
                        Aplicar filtros
                    </button>
                </aside>

                {/* Productos */}
                <section className="md:col-span-3">
                    <ProductsGrid products={products} gridSize="3" />
                </section>
            </div>
        </div>
    );
}
