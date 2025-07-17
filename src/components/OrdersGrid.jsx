"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import ReviewModal from "./ReviewModal";
import { Star } from "lucide-react";

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

function formatAddress(addr) {
  if (!addr) return "-";
  const { streetName, streetNumber, apartment, city } = addr;
  return `${streetName} ${streetNumber}${apartment ? ', Apt ' + apartment : ''} - ${city}`;
}

export default function OrdersGrid({ userId }) {
  const [orders, setOrders] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metadata, setMetadata] = useState({});
  const [reviewProduct, setReviewProduct] = useState(null); // Cambia el estado

  useEffect(() => {
    if (!userId) return;
    setLoading(true);

    Promise.all([
      fetch(`/api/users/${userId}/orders`).then(res => res.ok ? res.json() : []),
      fetch("/api/metadata").then(res => res.ok ? res.json() : {}),
      fetch(`/api/reviews/users/${userId}`).then(res => res.ok ? res.json() : []) // <-- reviews del usuario
    ])
      .then(([ordersData, metadataData, reviewsData]) => {
        setOrders(ordersData);
        setMetadata(metadataData);
        setUserReviews(reviewsData); // <-- reviews del usuario
      })
      .catch(err => {
        console.error("Error:", err);
        setOrders([]);
      })
      .finally(() => setLoading(false));
  }, [userId]);

  const orderStates = metadata.orderStates || [];

  const getStatusLabel = (statusId) => {
    const status = orderStates.find(s => s.id === statusId);
    return status ? status.label : "Consultar";
  };

  const getStatusColor = (statusId) => {
    switch (statusId) {
      case "pending_payment": return "bg-yellow-100 text-yellow-800";
      case "paid": return "bg-blue-100 text-blue-800";
      case "preparing": return "bg-orange-100 text-orange-800";
      case "ready_pickup": return "bg-purple-100 text-purple-800";
      case "shipped": return "bg-blue-100 text-blue-800";
      case "delivered": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return <div className="py-8 text-center text-gray-500">Cargando órdenes...</div>;
  }

  if (!orders.length) {
    return <div className="py-8 text-center text-gray-500">No se encontraron órdenes.</div>;
  }

  return (
    <div className="space-y-6">
      {orders.map(order => (
        <div key={order._id} className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          {/* Encabezado */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Pedido #{order.orderNumber}
              </h3>
              <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
            </div>
            <div>
              <span className={clsx("text-xs px-2 py-1 rounded-full font-medium", getStatusColor(order.status))}>
                {getStatusLabel(order.status)}
              </span>
            </div>
          </div>

          {/* Detalles */}
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="text-sm text-gray-700">
              <span className="font-semibold">Total: </span>${order.total?.toFixed(2)}
            </div>
            <div className="text-sm text-gray-700">
              <span className="font-semibold">Entrega: </span>
              {order.deliveryType === "envio"
                ? `Envío a domicilio - ${formatAddress(order.address)}`
                : `Retiro en ${order.pickupPoint || "Sucursal"}`}
            </div>
          </div>

          {/* Productos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            {order.products.map(({ productId, quantity }) => {
              // Verifica si el usuario ya hizo review de este producto en esta orden
              const alreadyReviewed = userReviews.find(
                r => r.product === productId._id && r.order === order._id
              );
              return (
                <div key={productId._id} className="relative">
                  <div className="flex items-start justify-between border border-gray-200 bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition">
                    <Link href={`/products/${productId._id}`} className="flex items-center gap-3 flex-1">
                      {productId.images?.[0] && (
                        <img src={productId.images[0]} alt={productId.name} className="w-14 h-14 object-cover rounded" />
                      )}
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">{productId.name}</p>
                        <p className="text-gray-500">Cantidad: {quantity}</p>
                      </div>
                    </Link>
                    {order.status === "delivered" && (
                      alreadyReviewed ? (
                        <span className="ml-2 text-orange-400 text-xs font-semibold px-2 py-1 rounded bg-orange-100 border border-orange-200 flex items-center gap-1">
                          <Star size={16} className="fill-orange-400 text-orange-400" />
                          {alreadyReviewed.rating}/5
                        </span>
                      ) : (
                        <button
                          className="ml-2 flex items-center gap-1 text-yellow-500 hover:text-yellow-600 cursor-pointer"
                          onClick={() => setReviewProduct({ productId: productId._id, productName: productId.name, orderId: order._id })}
                          title="Dejar reseña"
                        >
                          <Star size={20} />
                          <span className="text-xs">Valorar</span>
                        </button>
                      )
                    )}
                  </div>
                  {/* Modal solo para el producto seleccionado */}
                  {reviewProduct && reviewProduct.productId === productId._id && (
                    <ReviewModal
                      open={!!reviewProduct}
                      onClose={() => setReviewProduct(null)}
                      productId={productId._id}
                      productName={productId.name}
                      orderId={order._id}
                      userId={userId}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
