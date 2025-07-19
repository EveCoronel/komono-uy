import { Button } from "@components/ui/button";
import { Trash2 } from "lucide-react";

export default function AdminProductCard({ product, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 flex flex-col justify-between border hover:shadow-lg transition">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 bg-gray-100 border rounded overflow-hidden flex items-center justify-center">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-contain"
            />
          ) : (
            <span className="text-xs text-gray-400">Sin imagen</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base truncate">{product.name}</h3>
          <p className="text-sm text-gray-600">${product.price.toFixed(2)}</p>
          <p className="text-xs text-gray-400 truncate">{product.category}</p>
          <span className={`inline-block mt-1 text-xs rounded px-2 py-0.5
            ${product.stock === 0 ? "bg-red-100 text-red-600" :
            product.stock < 3 ? "bg-yellow-100 text-yellow-700" :
            "bg-green-100 text-green-700"}
          `}>
            {product.stock === 0 ? "Sin stock" :
              product.stock < 3 ? `¡Últimas ${product.stock}!` : "En stock"}
          </span>
        </div>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button size="sm" variant="outline" onClick={() => onEdit(product)}>
          Editar
        </Button>
        <button
          onClick={() => onDelete(product._id)}
          className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-full transition"
          aria-label="Eliminar producto"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
  