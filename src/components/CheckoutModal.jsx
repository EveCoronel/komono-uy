"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import clsx from "clsx";
import { isSale } from "@/lib/utils";

const puntosDeRetiro = [
    {
        value: "goes",
        label: "Goes - Guadalupe esq Jose L Terra",
        mapa: "https://maps.google.com/?q=-34.90328,-56.18816",
        iframeUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2314.415032069863!2d-56.18332097051985!3d-34.87940951444375!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x959f806b3d7216fb%3A0x10fb134a97b18ac5!2sGuadalupe%20%26%20Jos%C3%A9%20L.%20Terra%2C%2011800%20Montevideo%2C%20Departamento%20de%20Montevideo!5e0!3m2!1ses!2suy!4v1752362982528!5m2!1ses!2suy",
        horario: [
            { dias: "Lunes, Miércoles, Viernes", horas: "09:00 a 18:00 hs" },
            { dias: "Martes, Jueves", horas: "15:50 a 19:00 hs" },
            { dias: "Sábado", horas: "10:00 a 15:00 hs" },
        ],
    }
];

export function CheckoutModal({ onSuccess }) {
    const { user } = useAuth();
    const { cart, clearCart, coupon } = useCart();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [selectedPunto, setSelectedPunto] = useState(puntosDeRetiro[0].value);
    const [discount, setDiscount] = useState(0);
    const [couponError, setCouponError] = useState("");
    // console.log("user", user);
    const {
        register,
        handleSubmit,
        control,
        watch,
        formState: { errors },
        reset,
    } = useForm({
        defaultValues: {
            userId: user?._id || "",
            email: user?.email || "",
            name: user?.name || "",
            phone: "",
            envioType: "retiro",
            paymentMethod: "transferencia",
            direccion: "",
            puerta: "",
            apto: "",
            esquinas: "",
            departamento: "Montevideo",
            puntoRetiro: puntosDeRetiro[0].value,
        },
    });

    const selectedPayment = watch("paymentMethod");
    const envioType = watch("envioType");

    const total =
        cart.reduce((acc, item) => acc + (isSale(item) ? item.sale_price : item.price) * item.quantity, 0) +
        (envioType === "envio" ? 200 : 0);

    const handleOrder = async (data) => {
        setLoading(true);
        setErrorMsg("");
        try {
            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...data,
                    cart,
                    envioCost: envioType === "envio" ? 200 : 0,
                    total: (total - total * discount).toFixed(2),
                    discount: (total * discount).toFixed(2),
                    coupon: coupon?.code || null,
                }),
            });
            console.log("Order response:", res);
            if (res.ok) {
                setSuccess(true);
                clearCart();
                reset();
                onSuccess?.();
            } else {
                const error = await res.json();
                setErrorMsg(error.message || "Error al procesar la orden");
            }
        } catch (e) {
            setErrorMsg("Error al conectar con el servidor");
        }
        setLoading(false);
    };

    const validateCouponWithEmail = async (email) => {
        setCouponError("");
        setDiscount(0);
        if (!coupon) return;
        try {
            const res = await fetch(`/api/coupons/validate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ couponCode: coupon.code, email }),
            });
            const data = await res.json();
            if (res.ok && data.valid) {
                setDiscount(data.discount || 0);
                setCouponError("");
            } else {
                setDiscount(0);
                setCouponError(data.error || "Cupón no válido para este email");
            }
        } catch {
            setDiscount(0);
            setCouponError("Error al validar el cupón");
        }
    };

    useEffect(() => {
        if (!user && coupon && step === 4) {
            validateCouponWithEmail(watch("email"));
        }
        // eslint-disable-next-line
    }, [step, coupon, watch("email")]);

    return (
        <Dialog.Root>
            <Dialog.Trigger asChild>
                <button className="mt-4 px-6 py-2 bg-black text-white text-sm rounded-md hover:bg-gray-800 transition">
                    Finalizar compra
                </button>
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
                <Dialog.Content className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-8 w-full max-w-lg shadow-xl">
                    <form
                        onSubmit={handleSubmit(
                            step === 4
                                ? handleOrder
                                : (data) => {
                                    setStep((s) => s + 1);
                                }
                        )}
                        className="space-y-6"
                    >
                        <div>
                            <h2 className="text-xl font-bold mb-1">Checkout</h2>
                            <div className="text-gray-500 mb-4">Paso {step} de 4</div>
                        </div>
                        <Dialog.Title className="text-xl font-bold mb-1 text-center">
                            {step === 1
                                ? "Datos de contacto"
                                : step === 2
                                    ? "Dirección o retiro"
                                    : step === 3
                                        ? "Pago"
                                        : "Resumen"}
                        </Dialog.Title>

                        {step === 1 && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Nombre</label>
                                    <input
                                        {...register("name", { required: true })}
                                        className={clsx(
                                            "border rounded-md px-3 py-2 w-full",
                                            errors.name && "border-red-500"
                                        )}
                                        disabled={!!user}
                                        placeholder="Nombre completo"
                                    />
                                    {errors.name && (
                                        <span className="text-xs text-red-500">Este campo es requerido</span>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Email</label>
                                    <input
                                        {...register("email", {
                                            required: true,
                                            pattern: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
                                        })}
                                        className={clsx(
                                            "border rounded-md px-3 py-2 w-full",
                                            errors.email && "border-red-500"
                                        )}
                                        disabled={!!user}
                                        placeholder="tucorreo@email.com"
                                    />
                                    {errors.email && (
                                        <span className="text-xs text-red-500">Email inválido</span>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Teléfono</label>
                                    <input
                                        {...register("phone", { required: true })}
                                        className={clsx(
                                            "border rounded-md px-3 py-2 w-full",
                                            errors.phone && "border-red-500"
                                        )}
                                        placeholder="09x xxx xxx"
                                    />
                                    {errors.phone && (
                                        <span className="text-xs text-red-500">Este campo es requerido</span>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Tipo de envío
                                    </label>
                                    <select
                                        {...register("envioType")}
                                        className="border rounded-md px-3 py-2 w-full"
                                    >
                                        <option value="retiro">Retiro en punto</option>
                                        <option value="envio">Envío a domicilio</option>
                                    </select>
                                </div>
                            </>
                        )}

                        {step === 2 && (
                            <>
                                {envioType === "retiro" ? (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">
                                                Punto de retiro
                                            </label>
                                            <select
                                                {...register("puntoRetiro")}
                                                className="border rounded-md px-3 py-2 w-full"
                                                onChange={(e) => setSelectedPunto(e.target.value)}
                                                value={selectedPunto}
                                            >
                                                {puntosDeRetiro.map((p) => (
                                                    <option value={p.value} key={p.value}>
                                                        {p.label}
                                                    </option>
                                                ))}
                                            </select>
                                            {/* Mapa embebido */}
                                            <div className="mt-4 border rounded-lg overflow-hidden shadow">
                                                <iframe
                                                    title="Mapa del punto de retiro"
                                                    src={
                                                        puntosDeRetiro.find((p) => p.value === selectedPunto)?.iframeUrl
                                                    }
                                                    width="100%"
                                                    height="220"
                                                    style={{ border: 0 }}
                                                    allowFullScreen=""
                                                    loading="lazy"
                                                    referrerPolicy="no-referrer-when-downgrade"
                                                />
                                            </div>
                                            <div className="mt-2 text-sm text-gray-700">
                                                <b>Horarios de retiro:</b>
                                                <ul className="mt-1 list-disc pl-4">
                                                    {puntosDeRetiro
                                                        .find((p) => p.value === selectedPunto)
                                                        ?.horario.map((item, idx) => (
                                                            <li key={idx}>
                                                                <b>{item.dias}:</b> {item.horas}
                                                            </li>
                                                        ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">
                                                Calle
                                            </label>
                                            <input
                                                {...register("direccion", { required: true })}
                                                className={clsx(
                                                    "border rounded-md px-3 py-2 w-full",
                                                    errors.direccion && "border-red-500"
                                                )}
                                                placeholder="Ej: Ejido"
                                            />
                                            {errors.direccion && (
                                                <span className="text-xs text-red-500">Campo requerido</span>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="w-1/2">
                                                <label className="block text-sm font-medium mb-1">
                                                    N° puerta
                                                </label>
                                                <input
                                                    {...register("puerta", { required: true })}
                                                    className={clsx(
                                                        "border rounded-md px-3 py-2 w-full",
                                                        errors.puerta && "border-red-500"
                                                    )}
                                                    placeholder="1234"
                                                />
                                                {errors.puerta && (
                                                    <span className="text-xs text-red-500">Requerido</span>
                                                )}
                                            </div>
                                            <div className="w-1/2">
                                                <label className="block text-sm font-medium mb-1">
                                                    Apartamento
                                                </label>
                                                <input
                                                    {...register("apto")}
                                                    className="border rounded-md px-3 py-2 w-full"
                                                    placeholder="(opcional)"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">
                                                Esquinas
                                            </label>
                                            <input
                                                {...register("esquinas")}
                                                className="border rounded-md px-3 py-2 w-full"
                                                placeholder="Ej: 18 de julio y Ejido"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">
                                                Departamento
                                            </label>
                                            <select
                                                {...register("departamento")}
                                                className="border rounded-md px-3 py-2 w-full"
                                            >
                                                {[
                                                    "Montevideo",
                                                    "Canelones",
                                                    "Maldonado",
                                                    "Colonia",
                                                    "San José",
                                                    "Florida",
                                                    "Lavalleja",
                                                    "Rocha",
                                                    "Soriano",
                                                    "Paysandú",
                                                    "Salto",
                                                    "Rivera",
                                                    "Tacuarembó",
                                                    "Artigas",
                                                    "Cerro Largo",
                                                    "Durazno",
                                                    "Flores",
                                                    "Río Negro",
                                                    "Treinta y Tres",
                                                ].map((dep) => (
                                                    <option value={dep} key={dep}>
                                                        {dep}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-2 rounded mb-3 text-xs text-gray-700">
                                            <b>¡Importante!</b> El costo y método de envío varían según la zona:
                                            <ul className="list-disc pl-4 mt-1 space-y-0.5">
                                                <li>
                                                    <b>DAC:</b> Se despacha en 2 días hábiles. El envío ($250 aprox) se abona al recibir.
                                                </li>
                                                <li>
                                                    <b>Cadetería particular:</b> Entrega en hasta 3 días hábiles. El envío ($100 aprox) se abona antes de la entrega.
                                                </li>
                                            </ul>
                                        </div>
                                    </>
                                )}
                            </>
                        )}
                        {step === 3 && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Método de pago</label>
                                    <select
                                        {...register("paymentMethod")}
                                        className="border rounded-md px-3 py-2 w-full"
                                    >
                                        {envioType === "retiro" && (
                                            <option value="efectivo">Efectivo (solo retiro)</option>
                                        )}
                                        <option value="mercado_pago">Mercado Pago</option>
                                        <option value="transferencia">Transferencia bancaria</option>
                                    </select>
                                </div>
                                <div className="mt-4 p-3 border rounded bg-gray-50 text-sm">
                                    {selectedPayment === "efectivo" && (
                                        <span>
                                            <b>Efectivo:</b> Pagás al retirar tu pedido en el punto de retiro.
                                        </span>
                                    )}
                                    {selectedPayment === "mercado_pago" && (
                                        <span>
                                            <b>Mercado Pago:</b> Te enviaremos el link de pago por email o WhatsApp una vez confirmada la orden.
                                        </span>
                                    )}
                                    {selectedPayment === "transferencia" && (
                                        <span>
                                            <b>Transferencia bancaria:</b> Te enviaremos los datos para transferir una vez confirmada la orden.
                                        </span>
                                    )}
                                </div>
                            </>
                        )}
                        {step === 4 && (
                            <>
                                <div>
                                    {/* <h3 className="text-lg font-semibold mb-2">Resumen</h3> */}
                                    <div className="text-sm">
                                        <div className="mb-2">
                                            <span className="font-semibold">Nombre:</span> {watch("name")}
                                        </div>
                                        <div className="mb-2">
                                            <span className="font-semibold">Email:</span> {watch("email")}
                                        </div>
                                        <div className="mb-2">
                                            <span className="font-semibold">Teléfono:</span> {watch("phone")}
                                        </div>
                                        <div className="mb-2">
                                            <span className="font-semibold">Tipo de envío:</span>{" "}
                                            {envioType === "retiro"
                                                ? "Retiro en punto"
                                                : "Envío a domicilio"}
                                        </div>
                                        {envioType === "retiro" ? (
                                            <div className="mb-2">
                                                <span className="font-semibold">Punto de retiro:</span>{" "}
                                                {
                                                    puntosDeRetiro.find(
                                                        (p) => p.value === watch("puntoRetiro")
                                                    )?.label
                                                }
                                            </div>
                                        ) : (
                                            <>
                                                <div className="mb-2">
                                                    <span className="font-semibold">Dirección:</span>{" "}
                                                    {`${watch("direccion")}, Puerta ${watch("puerta")}${watch("apto") ? `, Apto ${watch("apto")}` : ""
                                                        }, ${watch("departamento")}`}
                                                </div>
                                                <div className="mb-2">
                                                    <span className="font-semibold">Esquinas:</span> {watch("esquinas")}
                                                </div>
                                                <div className="mb-2">
                                                    <span className="font-semibold">Costo de envío:</span> $200
                                                </div>
                                            </>
                                        )}
                                        <div className="mb-2">
                                            <span className="font-semibold">Método de pago:</span>{" "}
                                            {selectedPayment === "efectivo"
                                                ? "Efectivo"
                                                : selectedPayment === "mercado_pago"
                                                    ? "Mercado Pago"
                                                    : "Transferencia bancaria"}
                                        </div>
                                    </div>
                                    {coupon && (
                                        <div className="mb-2 text-green-600">
                                            <span className="font-semibold">Cupón utilizado:</span> {coupon.code}
                                            {discount > 0 && (
                                                <span> — Descuento: -${(total * discount).toFixed(2)}</span>
                                            )}
                                            {couponError && (
                                                <div className="text-red-500 text-xs mt-1">Cupón no aplicado: {couponError}</div>
                                            )}
                                        </div>
                                    )}
                                    <div className="border-t pt-4 mt-4 text-right">
                                        <span className="text-lg font-bold">
                                            Total: ${(total - total * discount).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </>
                        )}

                        {errorMsg && (
                            <div className="text-red-500 text-sm">{errorMsg}</div>
                        )}

                        <div className="flex justify-between items-center">
                            {step > 1 && (
                                <button
                                    type="button"
                                    onClick={() => setStep((s) => s - 1)}
                                    className="px-4 py-2 text-sm rounded-md border"
                                    disabled={loading}
                                >
                                    Atrás
                                </button>
                            )}
                            {step < 4 && (
                                <button
                                    type="submit"
                                    className="ml-auto px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                                    disabled={loading}
                                >
                                    Siguiente
                                </button>
                            )}
                            {step === 4 && (
                                <button
                                    type="submit"
                                    className="ml-auto px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                                    disabled={loading}
                                >
                                    {loading ? "Procesando..." : "Confirmar orden"}
                                </button>
                            )}
                        </div>
                    </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

export default CheckoutModal;
