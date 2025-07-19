"use client";
import { Mail, Instagram } from "lucide-react";

export default function ContactButtons() {
  return (
    <div className="fixed bottom-20 right-6 flex flex-col gap-3 z-50">
      <a
        href="mailto:ec.business.ia@gmail.com"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-black text-white p-3 rounded-full shadow-lg hover:bg-gray-800 transition"
        aria-label="Enviar email"
      >
        <Mail className="w-5 h-5" />
      </a>
      <a
        href="https://www.instagram.com/komono.uy"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-black text-white p-3 rounded-full shadow-lg hover:bg-gray-800 transition"
        aria-label="Ir a Instagram"
      >
        <Instagram className="w-5 h-5" />
      </a>
    </div>
  );
}
