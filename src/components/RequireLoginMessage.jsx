"use client";
import Link from "next/link";
import { Lock } from "lucide-react";

export default function RequireLoginMessage() {
  return (
    <div className="p-10 bg-gray-50 border border-gray-200 rounded-xl max-w-md mx-auto text-center shadow-sm mt-12">
      <div className="flex flex-col items-center justify-center gap-3">
        <Lock className="w-10 h-10 text-gray-500" />
        <h2 className="text-lg font-semibold text-gray-800">
          Iniciá sesión para continuar
        </h2>
        <p className="text-sm text-gray-600">
          Necesitás estar logueado para visualizar esta página.
        </p>
        <Link
          href="/login"
          className="mt-3 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition text-sm"
        >
          Iniciar sesión
        </Link>
      </div>
    </div>
  );
}
