"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function AddressesGrid() {
  const { user, refreshUser } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    if (user?.addresses) {
      setAddresses(user.addresses);
    }
  }, [user]);

  const handleAddAddress = async (address) => {
    // POST a /api/user/addresses
    const res = await fetch("/api/user/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(address),
    });
    if (res.ok) {
      toast.success("Dirección agregada");
      setShowAdd(false);
      await refreshUser();
    } else {
      toast.error("Error al guardar dirección");
    }
  };

  return (
    <div className="bg-white rounded shadow p-4">
      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold text-lg">Direcciones</span>
        <button onClick={() => setShowAdd(true)} className="btn">Agregar dirección</button>
      </div>
      {addresses.length === 0 ? (
        <div className="text-gray-400">No tienes direcciones guardadas.</div>
      ) : (
        <ul className="space-y-2">
          {addresses.map((addr, idx) => (
            <li key={idx} className="border rounded p-2">
              {addr.streetName} {addr.streetNumber} {addr.apartment && 'Apt ' + addr.apartment}, {addr.city}
            </li>
          ))}
        </ul>
      )}
      {/* Modal para agregar dirección (puedes hacer un componente aparte) */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded w-full max-w-md">
            {/* ...Formulario para nueva dirección... */}
            <button onClick={() => setShowAdd(false)} className="mt-2 text-sm text-gray-500">Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}
