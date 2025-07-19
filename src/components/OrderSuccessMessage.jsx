"use client";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

export default function OrderSuccessMessage() {
    return (
        <div className="bg-green-50 border border-green-200 rounded-xl max-w-4xl mx-auto px-4 py-8 text-center shadow-md mt-6">
            <div className="flex flex-col items-center justify-center">
                <CheckCircle className="text-green-600 w-10 h-10 mb-2" />
                <h2 className="text-lg font-semibold text-green-800">¡Gracias por tu compra!</h2>
                <p className="text-sm text-green-700 mt-1">
                    Te enviamos un correo con los detalles de la orden.
                </p>
                <p className="text-sm text-green-700">
                    También podés verla en tu perfil.
                </p>
                <Link
                    href="/profile"
                    className="mt-4 inline-block bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition"
                >
                    Ver mis órdenes
                </Link>
            </div>
        </div>
    );
}
