"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner"; // Si usás otra librería, cambialo

// Creamos el contexto
const CartContext = createContext();

const addedToCartToast = (text, product) => {
  toast(
    <div className="flex items-center gap-3">
      <img
        src={product.images?.[0] || ""}
        alt={product.name}
        className="w-12 h-12 rounded-md object-contain border border-gray-200 bg-white"
      />
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-gray-900 truncate">{product.title}</div>
        <div className="text-xs text-gray-500">
          {text}
        </div>
      </div>
      <a
        href="/cart"
        className="ml-2 px-3 py-1.5 text-xs rounded-md bg-black text-white hover:bg-gray-800 transition whitespace-nowrap"
        style={{ flexShrink: 0 }}
      >
        Ver carrito
      </a>
    </div>,
    {
      duration: 3500,
      style: {
        minWidth: "340px",
        maxWidth: "420px", // para que nunca sea demasiado ancho
        padding: "16px",
        alignItems: "center",
        display: "flex",
      },
    }
  );
}

// Hook para usar el contexto fácilmente
export const useCart = () => useContext(CartContext);

// Proveedor del contexto
export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  // Cargar carrito desde localStorage al inicio
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  // Guardar carrito en localStorage cada vez que cambia
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const updateCartItem = (id, quantity) => {
    setCart(prev => prev.map(item =>
      item._id === id ? { ...item, quantity } : item
    ));
    toast.success("Cantidad actualizada en el carrito");
  };

  const addToCart = (product, cantidad = 1) => {
    setCart((prev) => {
      const exists = prev.find((item) => item._id === product._id);
      const stock = Number(product.stock) || 0;
      const currentQty = exists ? exists.quantity : 0;
      const newQty = currentQty + cantidad;

      if (newQty > stock) {
        toast.error(`¡Solo hay ${stock} unidad${stock > 1 ? "es" : ""} disponible${stock > 1 ? "s" : ""} en stock!`);
        return prev; // No agregamos nada
      }

      if (exists) {
        let text = `Agregaste ${cantidad} unidad${cantidad > 1 ? "es" : ""} más de ${product.name} al carrito`
        addedToCartToast(text, product);
        return prev.map((item) =>
          item._id === product._id
            ? { ...item, quantity: newQty }
            : item
        );
      } else {
        let text = `Agregaste ${cantidad} unidad${cantidad > 1 ? "es" : ""} de ${product.name} al carrito`;
        addedToCartToast(text, product);
        return [...prev, { ...product, quantity: cantidad }];
      }
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item._id !== id));
    toast.success("Producto eliminado del carrito");
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, updateCartItem }}>
      {children}
    </CartContext.Provider>
  );
}
