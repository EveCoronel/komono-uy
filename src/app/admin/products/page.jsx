"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import ProductModal from "@/components/ProductModal";
import AdminProductCard from "@/components/AdminProductCard";

export default function AdminProductsPage() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [addProduct, setAddProduct] = useState(false);
    const [editProduct, setEditProduct] = useState(null);
    const [images, setImages] = useState([]);
    const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
    const [showNewSubcategoryInput, setShowNewSubcategoryInput] = useState(false);

    const [newCategory, setNewCategory] = useState("");
    const [newSubcategory, setNewSubcategory] = useState("");

    const [form, setForm] = useState({
        name: "",
        description: "",
        price: "",
        sale_price: "",
        sale_effective_period: { start: "", end: "" },
        category: "",
        subcategory: "",
        stock: "",
        image: ""
    });

    const [loadingForm, setLoadingForm] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const { user, loading } = useAuth();
    const router = useRouter();

    // Fetch logic
    const fetchProducts = async () => {
        try {
            const res = await fetch("/api/products");
            const data = await res.json();
            setProducts(data);
            const resCat = await fetch('/api/categories');
            setCategories(await resCat.json());
            const resSub = await fetch('/api/subcategories');
            setSubcategories(await resSub.json());
        } catch (err) {
            console.error("Error al cargar productos:", err);
        }
    };

    useEffect(() => {
        if (!loading && (!user)) {
            router.replace("/login");
        } else if (!loading && user && user.role !== "admin") {
            router.replace("/");
        } else {
            fetchProducts();
        }
    }, [loading, user, router]);

    // Form logic
    const handleChange = (e) => {
        const { name, value } = e.target;
        let updatedForm = { ...form };

        if (name === "category") {
            if (value === "new") {
                setShowNewCategoryInput(true);
                setNewCategory("");
                updatedForm.category = ""; // Deja el form limpio, pero no depende de esto para el input
            } else {
                setShowNewCategoryInput(false);
                setNewCategory("");
                updatedForm.category = value;
            }
        } else if (name === "subcategory") {
            if (value === "new") {
                setShowNewSubcategoryInput(true);
                setNewSubcategory("");
                updatedForm.subcategory = ""; // Deja el form limpio, pero no depende de esto para el input
            } else {
                setShowNewSubcategoryInput(false);
                setNewSubcategory("");
                updatedForm.subcategory = value;
            }
        } else if (name.includes(".")) {
            const keys = name.split(".");
            let obj = updatedForm;
            for (let i = 0; i < keys.length - 1; i++) {
                if (!obj[keys[i]]) obj[keys[i]] = {};
                obj = obj[keys[i]];
            }
            obj[keys[keys.length - 1]] = value;
        } else {
            updatedForm[name] = value;
        }

        setForm(updatedForm);
        setError("");
        setSuccess("");
    };

    // Remove
    const removeProduct = async (id) => {
        toast.custom((t) => (
            <div className="flex flex-col items-start gap-3 p-2">
                <span className="text-base font-medium">¿Estás seguro de eliminar este producto?</span>
                <div className="flex gap-2">
                    <button
                        className="bg-red-500 hover:bg-red-700 text-white rounded px-4 py-1 text-sm font-semibold"
                        onClick={async () => {
                            const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
                            if (!res.ok) {
                                toast.dismiss(t.id);
                                return toast.error("Error al eliminar el producto");
                            }
                            setProducts(products => products.filter(p => p._id !== id));
                            toast.dismiss(t.id);
                            toast.success("Producto eliminado");
                        }}
                    >
                        Eliminar
                    </button>
                    <button
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded px-4 py-1 text-sm font-semibold"
                        onClick={() => toast.dismiss(t.id)}
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        ));
    };

    // Add/Edit submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoadingForm(true);
        setError("");
        setSuccess("");
        try {
            let categoryToSave = form.category;
            let subcategoryToSave = form.subcategory;

            // Si hay nueva categoría, créala y usa el short_id devuelto
            if (showNewCategoryInput && newCategory) {
                const res = await fetch("/api/categories", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: newCategory }),
                });
                if (!res.ok) throw new Error("Error al crear la categoría");
                const data = await res.json();
                categoryToSave = data.short_id; // Ajusta según tu API
            }
            console.log("Creating new subcategory:", newSubcategory);
            // Si hay nueva subcategoría, créala y usa el short_id devuelto
            if (showNewSubcategoryInput && newSubcategory) {
                console.log("Creating new subcategory:", newSubcategory, "for category:", categoryToSave);
                const res = await fetch("/api/subcategories", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: newSubcategory, category: categoryToSave }),
                });
                if (!res.ok) throw new Error("Error al crear la subcategoría");
                const data = await res.json();
                subcategoryToSave = data.short_id; // Ajusta según tu API
            }

            let imageUrls = [];
            // Si es edición, chequea si hay imágenes nuevas (tipo File/Blob)
            const hasNewImages = images.some(img => typeof img !== "string");
            if (hasNewImages) {
                for (const image of images) {
                    if (typeof image === "string") {
                        // Ya es una URL, la agregamos directo
                        imageUrls.push(image);
                    } else {
                        // Es un File/Blob, hay que subirla
                        const formData = new FormData();
                        formData.append("file", image);
                        const res = await fetch("/api/upload", { method: "POST", body: formData });
                        const data = await res.json();
                        if (!res.ok) throw new Error(data.error || "Error al subir imagen");
                        imageUrls.push(data.url);
                    }
                }
            } else {
                // No hay imágenes nuevas, usamos las existentes
                imageUrls = form.images || [];
            }

            let body = {
                ...form,
                sale_price: form.sale_price ? parseFloat(form.sale_price) : null,
                price: parseFloat(form.price),
                images: imageUrls,
                category: categoryToSave,
                subcategory: subcategoryToSave,
            };
            let res;
            if (editProduct) {
                // Solo enviar los campos que cambiaron
                const changedFields = getChangedFields(editProduct, body);
                res = await fetch(`/api/products/${editProduct._id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(changedFields),
                });
            } else {
                // Crear producto normalmente
                res = await fetch("/api/products", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                });
            }
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Error al guardar el producto");
            }
            setSuccess(editProduct ? "Producto editado correctamente" : "Producto creado correctamente");
            toast.success(success);
            setAddProduct(false);
            setEditProduct(null);
            setForm({
                name: "",
                description: "",
                price: "",
                sale_price: "",
                sale_effective_period: { start: "", end: "" },
                category: categories[0]?.short_id || "",
                subcategory: "",
                stock: "",
                image: ""
            });
            setImages([]);
            fetchProducts();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoadingForm(false);
        }
    };

    // Edit logic
    const handleEdit = (product) => {
        setEditProduct(product);
        setAddProduct(true);
        setForm({
            ...product,
            sale_effective_period: product.sale_effective_period || { start: "", end: "" },
            images: product.images || [],
        });
        setImages(product.images || []);
        setShowNewCategoryInput(false);
        setShowNewSubcategoryInput(false);
        setError("");
        setSuccess("");
    };

    // Modal close
    const handleCloseModal = () => {
        setAddProduct(false);
        setEditProduct(null);
        setForm({
            name: "",
            description: "",
            price: "",
            sale_price: "",
            sale_effective_period: { start: "", end: "" },
            category: categories[0]?.short_id || "",
            subcategory: "",
            stock: "",
            image: ""
        });
        setImages([]);
        setShowNewCategoryInput(false);
        setShowNewSubcategoryInput(false);
        setError("");
        setSuccess("");
    };

    if (loading || !user || user?.role !== "admin") {
        return <div className="p-8 text-center">Cargando...</div>;
    }

    return (
        <div className="min-h-screen pb-20">
            <div className="max-w-5xl mx-auto py-10 px-2">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold">Administrar productos</h1>
                    <button
                        onClick={() => setAddProduct(true)}
                        className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg px-5 py-2 flex items-center gap-2 w-full sm:w-auto justify-center"
                        aria-label="Agregar producto"
                    >
                        <Plus className="w-5 h-5" />
                        Agregar producto
                    </button>

                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
                    {products.map((product) => (
                        <AdminProductCard
                            key={product._id}
                            product={product}
                            onEdit={handleEdit}
                            onDelete={removeProduct}
                        />
                    ))}
                </div>
            </div>
            <ProductModal
                open={addProduct}
                onClose={handleCloseModal}
                onSave={handleSubmit}
                categories={categories}
                subcategories={subcategories}
                setNewSubcategory={setNewSubcategory}
                setNewCategory={setNewCategory}
                newCategory={newCategory}
                newSubcategory={newSubcategory}
                form={form}
                setForm={setForm}
                images={images}
                setImages={setImages}
                showNewCategoryInput={showNewCategoryInput}
                showNewSubcategoryInput={showNewSubcategoryInput}
                handleChange={handleChange}
                loadingForm={loadingForm}
                error={error}
                success={success}
                isEdit={!!editProduct}
            />
        </div>
    );
}

// Utilidad para obtener solo los campos modificados
function getChangedFields(original, updated) {
    const changed = {};
    for (const key in updated) {
        // Para objetos anidados como sale_effective_period, puedes hacer una comparación más profunda si lo necesitas
        if (typeof updated[key] === "object" && updated[key] !== null && original[key]) {
            if (JSON.stringify(updated[key]) !== JSON.stringify(original[key])) {
                changed[key] = updated[key];
            }
        } else if (updated[key] !== original[key]) {
            changed[key] = updated[key];
        }
    }
    return changed;
}
