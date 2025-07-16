import { Card, CardContent, CardFooter } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Button } from "@components/ui/button";
import { EyeClosed } from "lucide-react";
import ImageUploader from "@/components/ImageUploader";
import { useEffect } from "react";

export default function ProductModal({
    open,
    onClose,
    onSave,
    categories,
    subcategories,
    form,
    images,
    setImages,
    showNewCategoryInput,
    showNewSubcategoryInput,
    handleChange,
    loadingForm,
    error,
    success,
    setForm,
    isEdit = false,
    newCategory,
    setNewCategory,
    newSubcategory,
    setNewSubcategory,
}) {
    // Guarda el formulario en localStorage cada vez que cambie
    useEffect(() => {
        if (open) {
            localStorage.setItem("productFormDraft", JSON.stringify(form));
        }
    }, [form, open]);

    // Al abrir el modal, recupera el draft si existe
    useEffect(() => {
        if (open) {
            const draft = localStorage.getItem("productFormDraft");
            if (draft) {
                try {
                    setForm(JSON.parse(draft));
                } catch (e) {
                    // Si hay error, ignora el draft
                }
            }
        }
    }, [open, setForm]);

    // Limpia el draft al guardar o cerrar el modal
    const handleClose = () => {
        localStorage.removeItem("productFormDraft");
        onClose();
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black opacity-30" onClick={handleClose} />
            <div
                className="relative bg-white rounded-xl shadow-lg max-w-lg w-full mx-auto overflow-y-auto p-0"
                onClick={e => e.stopPropagation()}
            >
                <Card className="w-full max-w-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">{isEdit ? "Editar producto" : "Agregar nuevo producto"}</h2>
                        <button
                            onClick={onClose}
                            aria-label="Cerrar modal"
                            className="text-gray-700 hover:text-gray-900"
                            type="button"
                        >
                            <EyeClosed className="h-6 w-6" />
                        </button>
                    </div>
                    <form
                        onSubmit={onSave}
                        className="space-y-4"
                        autoComplete="off"
                    >
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Imágenes</Label>
                                <ImageUploader images={images} setImages={setImages} />
                            </div>

                            {/* Grid de 2 columnas para campos principales */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label>Nombre</Label>
                                    <Input
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label>Stock</Label>
                                    <Input
                                        name="stock"
                                        type="number"
                                        min="0"
                                        value={form.stock}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <Label>Descripción</Label>
                                <Input
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label>Precio</Label>
                                    <Input
                                        name="price"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={form.price}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label>Precio de oferta</Label>
                                    <Input
                                        name="sale_price"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={form.sale_price}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label>Inicio de oferta</Label>
                                    <Input
                                        type="date"
                                        name="sale_effective_period.start"
                                        value={form.sale_effective_period?.start || ""}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <Label>Fin de oferta</Label>
                                    <Input
                                        type="date"
                                        name="sale_effective_period.end"
                                        value={form.sale_effective_period?.end || ""}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label>Categoría</Label>
                                    <select
                                        name="category"
                                        className="w-full border rounded px-3 py-2"
                                        value={form.category}
                                        onChange={handleChange}
                                        required
                                    >
                                        {categories.map(cat => (
                                            <option key={cat.short_id} value={cat.short_id}>
                                                {cat.name}
                                            </option>
                                        ))}
                                        <option value="new">+ Nueva categoría</option>
                                    </select>
                                    {showNewCategoryInput && (
                                        <div className="mt-2">
                                            <Label>Nombre de nueva categoría</Label>
                                            <Input
                                                value={newCategory}
                                                onChange={e => setNewCategory(e.target.value)}
                                                placeholder="Ej: Útiles de papelería"
                                                required
                                            />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <Label>Subcategoría</Label>
                                    <select
                                        name="subcategory"
                                        className="w-full border rounded px-3 py-2"
                                        value={form.subcategory || ""}
                                        onChange={handleChange}
                                        required={!showNewSubcategoryInput}
                                    >
                                        <option value="">Seleccionar subcategoría</option>
                                        {subcategories.map(sub => (
                                            <option key={sub.short_id} value={sub.short_id}>
                                                {sub.name}
                                            </option>
                                        ))}
                                        <option value="new">+ Nueva subcategoría</option>
                                    </select>
                                    {showNewSubcategoryInput && (
                                        <div className="mt-2">
                                            <Label>Nombre de nueva subcategoría</Label>
                                            <Input
                                                value={newSubcategory}
                                                onChange={e => setNewSubcategory(e.target.value)}
                                                placeholder="Ej: Útiles de papelería"
                                                required
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                            {error && <div className="text-red-500 text-sm">{error}</div>}
                            {success && <div className="text-green-600 text-sm">{success}</div>}
                        </CardContent>
                        <CardFooter className="mt-4">
                            <Button type="submit" className="w-full" disabled={loadingForm}>
                                {loadingForm ? "Guardando..." : (isEdit ? "Guardar cambios" : "Guardar producto")}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
}
