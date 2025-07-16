import connectDB from "@/lib/db";
import Product from "@/models/Product";

/**
 * Devuelve todos los productos, sin filtros
 */
export async function getAllProducts() {
    await connectDB();
    return await Product.find().lean();
}

/**
 * Devuelve productos por categoría exacta
 * @param {string} category
 */
export async function getProductsByCategory(category) {
    await connectDB();
    return await Product.find({ category }).lean();
}

/**
 * Devuelve productos aplicando filtros avanzados
 * @param {{
 *  category?: string,
 *  subcategory?: string,
 *  priceMin?: number,
 *  priceMax?: number,
 *  order?: string,
 *  search?: string
 * }} filters
 */

export async function getProducts(filters = {}) {
    await connectDB();

    const {
        category,
        subcategory,
        priceMin,
        priceMax,
        order,
        search,
    } = filters;

    const query = {};

    if (category) {
        query.category = category;
    }


    if (subcategory) {
        query.subcategory = subcategory;
    }

    // Filtra solo por el rango más amplio posible
    if (priceMin !== undefined || priceMax !== undefined) {
        query.$or = [
            { price: { ...(priceMin !== undefined ? { $gte: priceMin } : {}), ...(priceMax !== undefined ? { $lte: priceMax } : {}) } },
            { sale_price: { ...(priceMin !== undefined ? { $gte: priceMin } : {}), ...(priceMax !== undefined ? { $lte: priceMax } : {}) } }
        ];
    }

    if (search) {
        query.$or = [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
        ];
    }

    let sort = {};

    switch (order) {
        case "precio_asc":
            sort.price = 1;
            break;
        case "precio_desc":
            sort.price = -1;
            break;
        case "mas_recientes":
            sort.createdAt = -1;
            break;
        default:
            sort.createdAt = -1;
    }

    const products = await Product.find(query).sort(sort).lean();

    // Filtra en JS por el precio efectivo
    const filteredProducts = products.filter(product => {
        const effectivePrice = product.sale_price && product.sale_price > 0 && product.sale_price < product.price
            ? product.sale_price
            : product.price;
        if (priceMin !== undefined && effectivePrice < priceMin) return false;
        if (priceMax !== undefined && effectivePrice > priceMax) return false;
        return true;
    });

    const serializedProducts = filteredProducts.map(product => ({
        ...product,
        _id: product._id.toString(),
    }));

    return serializedProducts;
}