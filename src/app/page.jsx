import CategoriesGrid from "@/components/CategoryGrid";
import ProductsGrid from "@/components/ProductsGrid";
import { getProducts } from "@/controllers/productsController";
import { getAllCategories } from "@/controllers/categoriesController";
import AdvertiserAside from "@/components/AdvertiserAside";

export default async function Home() {
  const products = await getProducts();
  let categories = await getAllCategories();
  categories = categories.map(({ _id, ...rest }) => rest);

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <AdvertiserAside />
      {/* Main Content */}
      {/* <section className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          Bienvenidos a KOMONO UY
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Descubre nuestra colección de broches metálicos, llaveros y útiles de
          papelería
        </p>
      </section> */}

      <CategoriesGrid categories={categories} />
      {/* Products Grid */}
      <h2 className="text-2xl font-semibold text-gray-800 mb-8">
        Catálogo de Productos
      </h2>
      <ProductsGrid products={products} />
    </div>
  );
}
