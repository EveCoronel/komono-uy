import ProductsPageClient from "@/components/ProductsPageClient";
import { getProducts } from "@/controllers/productsController";

export default async function Home({ searchParams }) {
    searchParams = await searchParams;
    const category = searchParams.categoria || "";
    const subcategory = searchParams.subcategoria || "";
    const priceMin = searchParams.precioMin ? Number(searchParams.precioMin) : undefined;
    const priceMax = searchParams.precioMax ? Number(searchParams.precioMax) : undefined;
    const order = searchParams.orden || "";
    const search = searchParams.busqueda || "";

    const products = await getProducts({
        category,
        subcategory,
        priceMin,
        priceMax,
        order,
        search,
    });

    return <ProductsPageClient products={products} />;
}
