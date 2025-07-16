"use client";
import { useState, useCallback } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";

export default function ProductGallery({ images = [] }) {
    const [selected, setSelected] = useState(0);
    const [open, setOpen] = useState(false);
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
    const [modalEmblaRef, modalEmblaApi] = useEmblaCarousel({ loop: true });

    const scrollPrev = useCallback(
        (e, api = emblaApi) => {
            e.stopPropagation();
            if (api) {
                api.scrollPrev();
                setSelected(api.selectedScrollSnap());
            }
        },
        [emblaApi]
    );

    const scrollNext = useCallback(
        (e, api = emblaApi) => {
            e.stopPropagation();
            if (api) {
                api.scrollNext();
                setSelected(api.selectedScrollSnap());
            }
        },
        [emblaApi]
    );

    if (!images.length) return null;

    return (
        <div className="w-full flex flex-col gap-4 items-center md:flex-row md:items-start">
            {/* Miniaturas - columna en desktop, slider horizontal en mobile */}
            <div className="w-full md:w-auto mb-2 md:mb-0">
                {/* Mobile: slider horizontal */}
                <div className="flex md:hidden gap-2 overflow-x-auto pb-1">
                    {images.map((img, idx) => (
                        <button
                            key={img}
                            onClick={() => {
                                setSelected(idx);
                                emblaApi?.scrollTo(idx);
                            }}
                            className={`w-16 h-16 border rounded-lg p-1 shrink-0 transition-all ${selected === idx
                                ? "ring-2 ring-black"
                                : "opacity-70 hover:opacity-100"
                                }`}
                            tabIndex={0}
                            aria-label={`Ver imagen ${idx + 1}`}
                        >
                            <img
                                src={img}
                                alt={`Miniatura ${idx + 1}`}
                                className="w-full h-full object-contain"
                            />
                        </button>
                    ))}
                </div>
                {/* Desktop: columna */}
                <div className="hidden md:flex flex-col gap-2">
                    {images.map((img, idx) => (
                        <button
                            key={img}
                            onClick={() => {
                                setSelected(idx);
                                emblaApi?.scrollTo(idx);
                            }}
                            className={`w-14 h-14 border rounded-lg p-1 transition-all ${selected === idx
                                ? "ring-2 ring-black"
                                : "opacity-70 hover:opacity-100"
                                }`}
                            tabIndex={0}
                            aria-label={`Ver imagen ${idx + 1}`}
                        >
                            <img
                                src={img}
                                alt={`Miniatura ${idx + 1}`}
                                className="w-full h-full object-contain"
                            />
                        </button>
                    ))}
                </div>
            </div>

            {/* Foto principal centrada, responsiva */}
            <div className="relative flex flex-col items-center w-full max-w-xs sm:max-w-sm md:max-w-[320px]">
                <div ref={emblaRef} className="overflow-hidden rounded-xl w-full">
                    <div className="flex">
                        {images.map((img, idx) => (
                            <div
                                key={idx}
                                className="flex-[0_0_100%] min-w-0 relative aspect-square"
                                onClick={() => setOpen(true)}
                            >
                                <img
                                    src={img}
                                    alt={`Imagen principal del producto ${idx + 1}`}
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        ))}
                    </div>
                </div>
                {/* Flechas para carrusel */}
                {images.length > 1 && (
                    <>
                        <button
                            className="absolute top-1/2 left-1 -translate-y-1/2 bg-white/80 hover:bg-black/70 hover:text-white text-gray-800 rounded-full p-1.5 shadow transition z-10 opacity-80 group-hover:opacity-100"
                            onClick={(e) => scrollPrev(e)}
                            aria-label="Imagen anterior"
                        >
                            <ChevronLeft size={22} />
                        </button>
                        <button
                            className="absolute top-1/2 right-1 -translate-y-1/2 bg-white/80 hover:bg-black/70 hover:text-white text-gray-800 rounded-full p-1.5 shadow transition z-10 opacity-80 group-hover:opacity-100"
                            onClick={(e) => scrollNext(e)}
                            aria-label="Imagen siguiente"
                        >
                            <ChevronRight size={22} />
                        </button>
                    </>
                )}
            </div>

            {/* Modal para imagen ampliada */}
            <Dialog.Root open={open} onOpenChange={setOpen}>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
                <Dialog.Title className="sr-only">
                    Vista ampliada de la imagen del producto
                </Dialog.Title>
                <Dialog.Content
                    className="z-50 flex items-center justify-center p-0"
                    style={{
                        position: "fixed",
                        left: "50%",
                        top: "50%",
                        transform: "translate(-50%, -50%)",
                        maxWidth: "700px",
                        width: "100%",
                        background: "transparent",
                        boxShadow: "none"
                    }}
                >
                    <div className="relative bg-white rounded-xl shadow-xl w-full flex flex-col items-center">
                        <button
                            className="absolute -top-3 -right-3 z-50 bg-white rounded-full p-2 shadow hover:bg-gray-100"
                            onClick={() => setOpen(false)}
                            aria-label="Cerrar"
                        >
                            <X size={20} />
                        </button>
                        <div ref={modalEmblaRef} className="overflow-hidden rounded-xl w-full">
                            <div className="flex">
                                {images.map((img, idx) => (
                                    <div
                                        key={idx}
                                        className="flex-[0_0_100%] min-w-0 flex items-center justify-center"
                                    >
                                        <img
                                            src={img}
                                            alt={`Foto ampliada ${idx + 1}`}
                                            className="object-contain w-full max-h-[80vh]"
                                            style={{ maxWidth: '700px' }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Navegación dentro del modal */}
                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={(e) => scrollPrev(e, modalEmblaApi)}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-black/70 hover:text-white text-gray-800 rounded-full p-1.5 shadow transition"
                                    aria-label="Anterior"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <button
                                    onClick={(e) => scrollNext(e, modalEmblaApi)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-black/70 hover:text-white text-gray-800 rounded-full p-1.5 shadow transition"
                                    aria-label="Siguiente"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </>
                        )}
                    </div>
                </Dialog.Content>
            </Dialog.Root>
        </div>
    );
}

