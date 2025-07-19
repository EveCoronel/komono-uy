"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { useAuth } from "../../context/AuthContext";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

export default function AuthPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const { user, loading, refreshUser } = useAuth();

    useEffect(() => {
        if (!loading && user) {
            router.push("/");
        }
    }, [loading, user, router]);

    if (loading || user) {
        return null;
    }

    const handleSubmit = async (e, isLogin) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get("name"),
            email: formData.get("email"),
            password: formData.get("password"),
        };

        try {
            const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";

            let response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(isLogin ? {
                    email: data.email,
                    password: data.password
                } : data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Something went wrong");
            }

            if (!isLogin) {
                let response = await fetch("/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: data.email,
                        password: data.password
                    }),
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || "Something went wrong");
                }
            }

            refreshUser();
            router.push("/");
            router.refresh();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "An error occurred");
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[70vh]">
            <div className="w-full max-w-md flex flex-col justify-center items-center">
                <Card className="w-full">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold text-center">¡Bienvenido!</CardTitle>
                        <CardDescription className="text-center">
                            Ingresa tu email para iniciar sesión o regístrate
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="login" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-4">
                                <TabsTrigger value="login">Login</TabsTrigger>
                                <TabsTrigger value="register">Registro</TabsTrigger>
                            </TabsList>

                            {/* Login */}
                            <TabsContent value="login">
                                <form onSubmit={(e) => handleSubmit(e, true)} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            placeholder="tucorreo@email.com"
                                            required
                                            autoComplete="email"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="password">Contraseña</Label>
                                        <Input
                                            id="password"
                                            name="password"
                                            type="password"
                                            required
                                            autoComplete="current-password"
                                        />
                                    </div>
                                    {error && (
                                        <div className="text-sm text-red-500">{error}</div>
                                    )}
                                    <Button type="submit" className="w-full" disabled={isLoading}>
                                        {isLoading ? <><Spinner />Ingresando...</> : "Iniciar sesión"}
                                    </Button>
                                </form>
                                <div className="mt-2 text-right">
                                    <Link href="/login/forgot-password" className="text-xs text-blue-600 hover:underline">
                                        ¿Olvidaste tu contraseña?
                                    </Link>
                                </div>
                            </TabsContent>

                            {/* Register */}
                            <TabsContent value="register">
                                <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Nombre</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            placeholder="Juan Pérez"
                                            required
                                            autoComplete="name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="register-email">Email</Label>
                                        <Input
                                            id="register-email"
                                            name="email"
                                            type="email"
                                            placeholder="tucorreo@email.com"
                                            required
                                            autoComplete="email"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="register-password">Contraseña</Label>
                                        <Input
                                            id="register-password"
                                            name="password"
                                            type="password"
                                            required
                                            autoComplete="new-password"
                                        />
                                    </div>
                                    {error && (
                                        <div className="text-sm text-red-500">{error}</div>
                                    )}
                                    <Button type="submit" className="w-full" disabled={isLoading}>
                                        {isLoading ? <><Spinner />Creando cuenta...</> : "Crear cuenta"}
                                    </Button>
                                </form>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                    <CardFooter className="flex justify-center">
                        <Link
                            href="/"
                            className="text-sm text-gray-500 hover:text-gray-900"
                        >
                            Volver al inicio
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
