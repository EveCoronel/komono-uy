"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardFooter,
    CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

// 👇 evita pre-render, fuerza CSR (Client-side rendering)
export const dynamic = "force-dynamic";

export default function ResetPasswordPage() {
    const [nuevaPassword, setNuevaPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");
    const [token, setToken] = useState("");

    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, loading } = useAuth();

    useEffect(() => {
        const tokenParam = searchParams.get("token");
        if (!tokenParam) {
            setError("Token no válido o faltante.");
        } else {
            setToken(tokenParam);
        }
    }, [searchParams]);

    useEffect(() => {
        if (!loading && user) {
            router.push("/");
        }
    }, [loading, user, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setMensaje("");

        if (nuevaPassword !== confirmPassword) {
            setError("Las contraseñas no coinciden");
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/auth/forgot/reset", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, nuevaPassword }),
            });

            const data = await res.json();
            if (res.ok) {
                toast.success("¡Contraseña actualizada! Ahora puedes iniciar sesión.");
                setMensaje("¡Contraseña actualizada! Ahora puedes iniciar sesión.");
                setTimeout(() => router.push("/login"), 2000);
            } else {
                setError(data.error || "Error al actualizar la contraseña");
            }
        } catch {
            toast.error("Error de red. Inténtalo de nuevo más tarde.");
            setError("Error de red");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[70vh]">
            <div className="w-full max-w-md flex flex-col justify-center items-center">
                <Card className="w-full">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold text-center">Restablecer contraseña</CardTitle>
                        <CardDescription className="text-center">
                            Ingresa tu nueva contraseña
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="nuevaPassword">Nueva contraseña</Label>
                                <Input
                                    id="nuevaPassword"
                                    name="nuevaPassword"
                                    type="password"
                                    required
                                    value={nuevaPassword}
                                    onChange={(e) => setNuevaPassword(e.target.value)}
                                    autoComplete="new-password"
                                />
                                <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    autoComplete="new-password"
                                />
                            </div>
                            {error && <div className="text-sm text-red-500">{error}</div>}
                            {mensaje && <div className="text-sm text-green-600">{mensaje}</div>}
                            <Button type="submit" className="w-full" disabled={isLoading || !token}>
                                {isLoading ? "Actualizando..." : "Actualizar contraseña"}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex justify-center">
                        <Link href="/login" className="text-sm text-gray-500 hover:text-gray-900">
                            Volver al login
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
