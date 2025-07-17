// "use client";
import ProductCard from "./ProductCard";

const gridCols = {
    2: "lg:grid-cols-2",
    3: "lg:grid-cols-3",
    4: "lg:grid-cols-4",
    5: "lg:grid-cols-5",
    6: "lg:grid-cols-6",
};

export default function ProductsGrid({ products, gridSize = "4" }) {
    products = products.filter(product => product.stock > 0);
    return (
        <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-8">
                Catálogo de Productos
            </h2>
            <div className={`justify-items-center grid grid-cols-1 md:grid-cols-2 ${gridCols[gridSize] || "lg:grid-cols-4"} gap-8`}>
                {products.map((product, index) => (
                    <ProductCard
                        key={product._id?.toString() || product.id?.toString() || index}
                        product={product}
                    />
                ))}
            </div>
        </section>
    );
}