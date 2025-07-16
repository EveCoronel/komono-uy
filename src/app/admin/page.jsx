import { ShoppingBag, Store, Settings } from "lucide-react"; // Importa el ícono de usuario
import Link from "next/link";
export default function AdminPage() {
    return (
        <div className="min-h-screen max-w-7xl mx-auto px-4 py-8">
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold mb-4">Panel de Administración</h1>
                <p className="text-gray-600">Bienvenido al panel de administración. Aquí puedes gestionar productos, órdenes y usuarios.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
                <Link href="/admin/products">
                    <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow hover:shadow-md transition">
                        <Store className="h-12 w-12 mb-2" />
                        <span className="text-lg font-semibold">Productos</span>
                    </div>
                </Link>
                <Link href="/admin/orders">
                    <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow hover:shadow-md transition">
                        <ShoppingBag className="h-12 w-12 mb-2" />
                        <span className="text-lg font-semibold">Ordenes</span>
                    </div>
                </Link>
                {/* <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow hover:shadow-md transition">
                    <Settings className="h-12 w-12 text-gray-700 mb-2" />
                    <span className="text-lg font-semibold">Settings</span>
                </div> */}
            </div>
        </div>
    );
}