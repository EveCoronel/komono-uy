"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [orderStates, setOrderStates] = useState([]);
  const [filterState, setFilterState] = useState("");
  const [sortDesc, setSortDesc] = useState(true);
  const [search, setSearch] = useState("");
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user)) {
      router.replace("/login");
    } else if (!loading && user && user.role !== "admin") {
      router.replace("/");
    } else {
      fetch("/api/metadata")
        .then(res => res.json())
        .then(data => setOrderStates(data.orderStates || []));
      // Fetch all orders
      fetch("/api/orders")
        .then(res => res.json())
        .then(data => setOrders(data));
    }
  }, [loading, user, router]);

  // Filtrado y ordenamiento
  const filteredOrders = orders
    .filter(order =>
      (!filterState || order.status === filterState) &&
      (
        !search ||
        order.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
        order.user?.name?.toLowerCase().includes(search.toLowerCase())
      )
    )
    .sort((a, b) =>
      sortDesc
        ? new Date(b.createdAt) - new Date(a.createdAt)
        : new Date(a.createdAt) - new Date(b.createdAt)
    );

  // Actualizar estado de orden
  const handleUpdateStatus = (orderId, newStatus) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3 p-2">
          <span className="text-base font-medium">¿Confirmar cambio de estado?</span>
          <div className="flex gap-2">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-1 text-sm font-semibold"
              onClick={async () => {
                const res = await fetch(`/api/orders/${orderId}/status`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ status: newStatus }),
                });
                toast.dismiss(t); // <-- aquí el cambio
                if (res.ok) {
                  setOrders(orders =>
                    orders.map(order =>
                      order._id === orderId ? { ...order, status: newStatus } : order
                    )
                  );
                  toast.success("Estado actualizado correctamente");
                } else {
                  toast.error("No se pudo actualizar el estado");
                }
              }}
            >
              Confirmar
            </button>
            <button
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded px-4 py-1 text-sm font-semibold"
              onClick={() => toast.dismiss(t.id)}
            >
              Cancelar
            </button>
          </div>
        </div>
      ),
      { duration: 10000 }
    );
  };

  if (loading || !user || user?.role !== "admin") {
    return <div className="p-8 text-center">Cargando...</div>;
  }
  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Órdenes</h1>
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <div>
          <label className="text-sm font-medium mr-2">Filtrar por estado:</label>
          <select
            value={filterState}
            onChange={e => setFilterState(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          >
            <option value="">Todos</option>
            {orderStates.map(state => (
              <option key={state.id} value={state.id}>{state.label}</option>
            ))}
          </select>
        </div>
        <div>
          <button
            className="border rounded px-3 py-2 text-sm flex items-center gap-1"
            onClick={() => setSortDesc(s => !s)}
          >
            Ordenar por fecha {sortDesc ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
        </div>
        <div className="flex items-center border rounded px-2 py-1 bg-white">
          <Search size={16} className="text-gray-400 mr-1" />
          <input
            type="text"
            placeholder="Buscar usuario..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="outline-none text-sm bg-transparent"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-xl shadow">
          <thead>
            <tr className="bg-gray-100 text-gray-700 text-sm">
              <th className="py-2 px-3 text-left">#</th>
              <th className="py-2 px-3 text-left">Fecha</th>
              <th className="py-2 px-3 text-left">Usuario</th>
              <th className="py-2 px-3 text-left">Email</th>
              <th className="py-2 px-3 text-left">Estado</th>
              <th className="py-2 px-3 text-left">Total</th>
              <th className="py-2 px-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(order => (
              <tr key={order._id} className="border-b last:border-none hover:bg-gray-50">
                <td className="py-2 px-3 font-semibold">{order.orderNumber}</td>
                <td className="py-2 px-3">{new Date(order.createdAt).toLocaleString()}</td>
                <td className="py-2 px-3">{order.user?.name || "-"}</td>
                <td className="py-2 px-3">{order.user?.email || "-"}</td>
                <td className="py-2 px-3">
                  <select
                    value={order.status}
                    onChange={e => handleUpdateStatus(order._id, e.target.value)}
                    className="border rounded px-2 py-1 text-xs"
                  >
                    {orderStates.map(state => (
                      <option key={state.id} value={state.id}>{state.label}</option>
                    ))}
                  </select>
                </td>
                <td className="py-2 px-3 font-bold">${order.total?.toFixed(2)}</td>
                <td className="py-2 px-3">
                  <details>
                    <summary className="cursor-pointer text-blue-600 hover:underline text-xs">Ver detalles</summary>
                    <div className="mt-2 text-xs bg-gray-50 rounded p-2">
                      <div><b>Entrega:</b> {order.deliveryType === "envio" ? `Envío a domicilio` : `Retiro en punto`}</div>
                      {order.deliveryType === "envio" && <><div><b>Dirección:</b> {order.address?.streetName} {order.address?.streetNumber}</div><div><b>Ciudad:</b> {order.address?.city}</div><div><b>Costo de envío:</b> {order.address?.deliveryCost}</div></>}
                      <div><b>Punto de retiro:</b> {order.pickupPoint}</div>
                      <div><b>Productos:</b>
                        <ul className="list-disc pl-4">
                          {order.products.map(p => (
                            <li key={p.productId._id}>
                              {p.productId.name} x{p.quantity}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </details>
                </td>
              </tr>
            ))}
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-400">No se encontraron órdenes.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}