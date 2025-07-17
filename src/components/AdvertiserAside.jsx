"use client";
import { toast } from "sonner";


export default function AdvertiserAside() {
    const copyCoupon = () => {
        navigator.clipboard.writeText("KOMONO10");
        toast.success("Cupón copiado al portapapeles. ¡Usalo en tu primera compra!");
    };
    return (
        <aside className="mb-8">
            <div className="bg-yellow-100 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border border-yellow-300 shadow-sm">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🎁</span>
                    <div>
                        <h2 className="text-lg font-bold text-yellow-800">¡Bienvenido/a!</h2>
                        <p className="text-yellow-700 text-sm">
                            Usá el cupón <span className="bg-yellow-200 font-mono px-2 py-1 rounded">KOMONO10</span> y obtené <b>10% OFF</b> en tu primera compra.
                        </p>
                    </div>
                </div>
                <span onClick={copyCoupon} className="bg-white text-yellow-800 font-bold px-4 py-2 rounded-full shadow text-sm border border-yellow-400 cursor-pointer">
                    KOMONO10
                </span>
            </div>
        </aside>

    );
}