"use client";
import { useEffect, useState } from "react";
import Link from 'next/link'

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
  const [loading, setLoading] = useState(true);
  const [metadata, setMetadata] = useState({});

  useEffect(() => {
    if (!userId) return;
    setLoading(true);

    // Promise.all para manejar múltiples fetches
    Promise.all([
      fetch(`/api/users/${userId}/orders`)
        .then(res => {
          if (!res.ok) throw new Error('Error cargando órdenes');
          return res.json();
        }),
      fetch("/api/metadata")
        .then(res => {
          if (!res.ok) throw new Error('Error cargando metadata');
          return res.json();
        })
    ])
      .then(([ordersData, metadataData]) => {
        setOrders(ordersData);
        setMetadata(metadataData);
      })
      .catch((error) => {
        console.error('Error:', error);
        setOrders([]);
      })
      .finally(() => setLoading(false));
  }, [userId]);


  const orderStates = metadata.orderStates

  if (loading) {
    return <div className="py-8 text-center text-gray-500">Cargando órdenes...</div>;
  }

  if (!orders.length) {
    return <div className="py-8 text-center text-gray-500">No se encontraron órdenes.</div>;
  }

  return (
    <div className="space-y-6">
      {orders.map(order => (
        <div key={order._id} className="bg-white rounded-xl shadow p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2 gap-2">
            <div>
              <span className="font-semibold text-gray-800">Nº #{order.orderNumber || ""}</span>
              <span className="ml-3 text-gray-500 text-sm">({formatDate(order.createdAt)})</span>
            </div>
            <div className="text-xs">
              Estado: <span className="font-semibold">
                {orderStates?.find(state => state.id === order.status)?.label || 'Consultar'}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 mb-2">
            <div>
              <span className="font-semibold text-gray-600 mr-1">Total:</span>
              <span className="text-lg font-bold">${order.total?.toFixed(2)}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-600 mr-1">Entrega:</span>
              {order.deliveryType === "envio"
                ? `Envío a domicilio - ${formatAddress(order.address)}`
                : `Retiro en ${order.pickupPoint || "Sucursal"}`
              }
            </div>
          </div>
          {/* Productos */}
          <div className="flex flex-wrap gap-3 mt-3">
            {order.products.map(({ productId, quantity }) => (
              <Link href={`/products/${productId._id}`}>
                <div key={productId._id} className="flex items-center gap-2 border rounded p-2 bg-gray-50 min-w-[160px]">
                  {productId.images && (
                    <img src={productId.images[0]} alt={productId.name} className="w-12 h-12 object-cover rounded" />
                  )}
                  <div>
                    <div className="font-medium text-gray-900">{productId.name}</div>
                    <div className="text-xs text-gray-500">Cantidad: {quantity}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {/* Última actualización */}
          <div className="mt-2 text-xs text-gray-400 text-right">
            Actualizado: {formatDate(order.lastUpdated)}
          </div>
        </div>
      ))}
    </div>
  );
}