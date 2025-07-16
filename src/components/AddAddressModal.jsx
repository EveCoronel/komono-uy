"use client";
import { useState } from "react";

export default function AddAddressModal({ onClose, onSave, loading }) {
    const [form, setForm] = useState({
        streetName: "",
        streetNumber: "",
        apartment: "",
        crossStreets: "",
        city: "",
    });

    const [error, setError] = useState("");

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.streetName || !form.streetNumber || !form.city) {
            setError("Por favor completa los campos obligatorios.");
            return;
        }
        await onSave(form);
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 shadow-lg w-full max-w-md relative">
                <button
                    className="absolute top-3 right-3 text-gray-400 hover:text-black"
                    onClick={onClose}
                    aria-label="Cerrar"
                    type="button"
                >
                    ×
                </button>
                <h3 className="text-lg font-bold mb-4">Agregar dirección</h3>
                <form className="space-y-3" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm mb-1 font-medium">
                            Calle <span className="text-red-500">*</span>
                        </label>
                        <input
                            className="w-full border rounded p-2"
                            name="streetName"
                            value={form.streetName}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm mb-1 font-medium">
                            Número <span className="text-red-500">*</span>
                        </label>
                        <input
                            className="w-full border rounded p-2"
                            name="streetNumber"
                            value={form.streetNumber}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm mb-1 font-medium">
                            Apartamento
                        </label>
                        <input
                            className="w-full border rounded p-2"
                            name="apartment"
                            value={form.apartment}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-sm mb-1 font-medium">
                            Cruces de calle
                        </label>
                        <input
                            className="w-full border rounded p-2"
                            name="crossStreets"
                            value={form.crossStreets}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-sm mb-1 font-medium">
                            Ciudad <span className="text-red-500">*</span>
                        </label>
                        <input
                            className="w-full border rounded p-2"
                            name="city"
                            value={form.city}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    {error && <div className="text-red-600 text-sm">{error}</div>}
                    <button
                        type="submit"
                        className="w-full mt-3 bg-black text-white py-2 rounded font-semibold hover:bg-gray-800 transition"
                        disabled={loading}
                    >
                        {loading ? "Guardando..." : "Guardar dirección"}
                    </button>
                </form>
            </div>
        </div>
    );
}