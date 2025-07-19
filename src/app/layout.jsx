import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { Toaster } from "sonner";
import ContactButtons from "@/components/ContactButtons";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "KOMONO UY",
  description: "Compra pines metálicos, llaveros, útiles de papelería y más en KOMONO UY.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body
        className={`${inter.className || ""} min-h-screen bg-gray-50`}
        style={{
          // backgroundImage: "radial-gradient(#e5e7eb 1px, transparent 1px)",
          backgroundBlendMode: "overlay",
          backgroundColor: "#ffffffff",
          // backgroundSize: "20px 20px",
        }/* {
            backgroundImage: "url('/bg_6.svg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            height: "100vh",
            backgroundAttachment: "fixed",
            backgroundColor: "#f3f4f6",
            backgroundRepeat: "no-repeat",
          } */}
      >
        <Toaster
          position="top-center" richColors
        />
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="min-h-screen pt-8 pb-16">
              {children}
            </main>
          </CartProvider>
        </AuthProvider>
        <ContactButtons />
        <ScrollToTopButton />
        <Analytics />
      </body>
    </html>
  );
}
