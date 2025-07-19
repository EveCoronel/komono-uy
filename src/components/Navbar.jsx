"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { User, LayoutDashboard, ShoppingCart, Menu, X, Heart, Bell } from "lucide-react";
import { Button } from "./ui/button";
import { useCart } from "@/context/CartContext";
import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import NotificationsModal from "./NotificationsModal";

async function onMarkAsRead(id, setNotifications) {
    try {
        await fetch('/api/notifications', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, read: true }),
        });
        // Actualiza el estado local de notificaciones
        setNotifications(prev =>
            prev.map(n => n._id === id ? { ...n, read: true } : n)
        );
    } catch (error) {
        console.error('Error al marcar como leída:', error);
    }
}

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const { cart } = useCart();
    const [menuOpen, setMenuOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const menuRef = useRef(null);

    // Supón que tienes las notificaciones en un estado:
    const [notifications, setNotifications] = useState([]);

    // Polling de notificaciones cada 3 minutos
    useEffect(() => {
        if (!user) return;
        let interval;
        const fetchNotifications = async () => {
            try {
                const res = await fetch(`/api/notifications/user/${user._id}`);
                if (res.ok) {
                    setNotifications(await res.json());
                }
            } catch {
                setNotifications([]);
            }
        };
        fetchNotifications();
        interval = setInterval(fetchNotifications, 180000); // 3 minutos
        return () => clearInterval(interval);
    }, [user]);

    // Calcula los ítems del carrito solo si cambia el cart
    const totalItems = useMemo(() =>
        cart.reduce((sum, item) => sum + item.quantity, 0)
        , [cart]);

    // Cierra el menú al navegar
    useEffect(() => {
        setMenuOpen(false);
    }, [pathname]);

    // Cierra menú al click fuera en mobile
    useEffect(() => {
        if (!menuOpen) return;
        function handleClick(e) {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [menuOpen]);

    // Links del menú
    const navLinks = [
        { label: "Inicio", href: "/" },
        { label: "Productos", href: "/products" }
    ];

    // Cantidad de notificaciones no leídas
    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <nav
            className="backdrop-blur bg-white/80 dark:bg-black/60 border-b sticky top-0 z-50 shadow-sm transition"
            role="navigation"
            aria-label="Barra de navegación principal"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">

                    {/* LOGO */}
                    <div className="flex-shrink-0 flex items-center gap-2">
                        <Link href="/" className="flex items-center gap-2 text-xl font-bold focus-visible:outline-dashed">
                            KOMONO UY
                        </Link>
                    </div>

                    {/* --- DESKTOP MENU --- */}
                    <div className="hidden sm:flex sm:items-center sm:space-x-8">
                        {navLinks.map(link => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`px-3 py-1 rounded transition
                                    ${pathname === link.href
                                        ? "text-black dark:text-white font-bold underline underline-offset-4"
                                        : "text-gray-700 dark:text-gray-200 hover:bg-gray-200/60 dark:hover:bg-gray-800"
                                    }
                                    focus-visible:outline-dashed`}
                                aria-current={pathname === link.href ? "page" : undefined}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* --- ACCIONES --- */}
                    <div className="flex items-center space-x-2">
                        {/* --- SOLO EN DESKTOP --- */}
                        <div className="hidden sm:flex items-center space-x-2">
                            {/* USUARIO */}
                            {user ? (
                                <div className="flex items-center gap-2">
                                    {/* Avatar si existe */}
                                    {user.avatar &&
                                        <Image src={user.avatar} alt="Avatar" width={28} height={28} className="rounded-full border" />
                                    }
                                    <span className="text-gray-700 dark:text-gray-200">Hola, {user.name?.split(" ")[0]}</span>
                                    <Button
                                        variant="ghost"
                                        onClick={() => router.push('/profile')}
                                        aria-label="Perfil"
                                        className="p-2"
                                    >
                                        <User className="h-6 w-6 text-gray-700 dark:text-gray-200" />
                                    </Button>
                                </div>

                            ) : (
                                <Button
                                    variant="default"
                                    onClick={() => router.push('/login')}
                                    aria-label="Iniciar sesión"
                                    className="ml-2"
                                >
                                    Iniciar Sesión
                                </Button>
                            )}
                            {/* ADMIN */}
                            {user?.role === "admin" && (
                                <Button
                                    variant="ghost"
                                    onClick={() => router.push('/admin')}
                                    aria-label="Panel de Admin"
                                    className="p-2"
                                >
                                    <LayoutDashboard className="h-6 w-6 text-gray-700 dark:text-gray-200" />
                                </Button>
                            )}
                        </div>

                        <Button
                            variant="ghost"
                            onClick={() => router.push('/profile/favorites')}
                            aria-label="Favoritos"
                            className="relative p-2"
                        >
                            <Heart className="h-6 w-6 text-gray-700 dark:text-gray-200" />
                        </Button>
                        {user && (
                            <>
                                <Button
                                    variant="ghost"
                                    onClick={() => setShowNotifications(true)}
                                    aria-label="Notificaciones"
                                    className="relative p-2"
                                >
                                    <Bell className="h-6 w-6 text-gray-700 dark:text-gray-200" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-1 py-0.5 rounded-full animate-bounce">
                                            {unreadCount}
                                        </span>
                                    )}
                                </Button>
                                <NotificationsModal
                                    open={showNotifications}
                                    onMarkAsRead={id => onMarkAsRead(id, setNotifications)}
                                    onClose={() => setShowNotifications(false)}
                                    notifications={notifications}
                                />
                            </>
                        )}
                        {/* --- SIEMPRE VISIBLE: CARRITO --- */}
                        <Button
                            variant="ghost"
                            onClick={() => router.push('/cart')}
                            aria-label="Carrito"
                            className="relative p-2"
                        >
                            <ShoppingCart className="h-6 w-6 text-gray-700 dark:text-gray-200" />
                            {totalItems > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-1 py-0.5 rounded-full animate-bounce">
                                    {totalItems}
                                </span>
                            )}
                        </Button>

                        {/* --- SOLO EN MOBILE: MENÚ HAMBURGUESA --- */}
                        <button
                            onClick={() => setMenuOpen(prev => !prev)}
                            className="sm:hidden p-2 rounded hover:bg-gray-200/60 dark:hover:bg-gray-800 focus-visible:outline-dashed transition"
                            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
                            aria-expanded={menuOpen}
                        >
                            {menuOpen
                                ? <X className="h-6 w-6" />
                                : <Menu className="h-6 w-6" />
                            }
                        </button>
                    </div>
                </div>
            </div>

            {/* --- MENÚ MOBILE --- */}
            {menuOpen && (
                <div
                    ref={menuRef}
                    className="sm:hidden absolute top-16 left-0 w-full bg-white dark:bg-black/90 shadow-lg z-40 transition animate-in fade-in slide-in-from-top"
                >
                    <div className="flex flex-col gap-1 px-4 py-4">
                        {navLinks.map(link => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`px-3 py-2 rounded text-lg transition
                                    ${pathname === link.href
                                        ? "bg-gray-100 dark:bg-gray-800 text-black dark:text-white font-bold"
                                        : "hover:bg-gray-200/60 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200"
                                    }
                                    focus-visible:outline-dashed`}
                                aria-current={pathname === link.href ? "page" : undefined}
                                onClick={() => setMenuOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}
                        {/* Opciones usuario/admin SOLO en menú mobile */}
                        {user && (
                            <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2 flex flex-col gap-1">
                                <Link
                                    href="/profile"
                                    className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-200/60 dark:hover:bg-gray-800"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    <User className="h-5 w-5" /> Perfil
                                </Link>
                                {user.role === "admin" && (
                                    <Link
                                        href="/admin"
                                        className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-200/60 dark:hover:bg-gray-800"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        <LayoutDashboard className="h-5 w-5" /> Admin
                                    </Link>
                                )}
                                {/* No mostrar logout en mobile */}
                            </div>
                        )}
                        {!user && (
                            <Link
                                href="/login"
                                className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-200/60 dark:hover:bg-gray-800"
                                onClick={() => setMenuOpen(false)}
                            >
                                Iniciar Sesión
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
