"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

function Spinner() {
    return <span className="animate-spin rounded-full border-2 border-t-2 border-gray-200 h-4 w-4 inline-block mr-2"></span>;
}

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setSubmitted(false);

        try {
            const res = await fetch("/api/auth/forgot", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "No se pudo enviar el mail.");
            }
            toast.success("Te enviamos un enlace para restablecer tu contraseña.");
            setSubmitted(true);
        } catch (err) {
            toast.error("Ocurrió un error al recuperar la contraseña.");
            setError(err instanceof Error ? err.message : "Ocurrió un error.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[70vh]">
            <div className="w-full max-w-md flex flex-col justify-center items-center">
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-center">¿Olvidaste tu contraseña?</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="tucorreo@email.com"
                                    required
                                />
                            </div>
                            {error && <div className="text-sm text-red-500">{error}</div>}
                            {submitted && (
                                <div className="text-sm text-green-600">
                                    Te enviamos un enlace para restablecer tu contraseña.
                                </div>
                            )}
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? <><Spinner />Enviando...</> : "Enviar"}
                            </Button>
                        </form>
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
