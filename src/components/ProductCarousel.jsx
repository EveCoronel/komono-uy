"use client";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback } from "react";

export default function ProductCarousel({ images }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  const scrollPrev = useCallback(
    (e) => {
      e.stopPropagation();
      if (emblaApi) emblaApi.scrollPrev();
    },
    [emblaApi]
  );

  const scrollNext = useCallback(
    (e) => {
      e.stopPropagation();
      if (emblaApi) emblaApi.scrollNext();
    },
    [emblaApi]
  );

  if (!images || images.length === 0) {
    return (
      <div className="w-[256px] h-[256px] flex items-center justify-center text-sm text-gray-400 bg-gray-50 rounded-md">
        Sin imagen
      </div>
    );
  }

  return (
    <div className="relative w-[256px] h-[256px] rounded-md overflow-hidden group">
      <div ref={emblaRef} className="embla w-full h-full">
        <div className="embla__container flex">
          {images.map((img, idx) => (
            <div className="embla__slide flex-shrink-0 w-[256px] h-[256px]" key={idx}>
              <img
                src={img}
                alt={`Imagen ${idx + 1}`}
                className="w-full h-full object-contain"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Flechas */}
      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={scrollPrev}
            aria-label="Imagen anterior"
            className="absolute top-1/2 left-2 -translate-y-1/2 bg-white/80 hover:bg-black/70 hover:text-white text-gray-800 rounded-full p-1.5 shadow transition z-10 opacity-80 group-hover:opacity-100"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={scrollNext}
            aria-label="Imagen siguiente"
            className="absolute top-1/2 right-2 -translate-y-1/2 bg-white/80 hover:bg-black/70 hover:text-white text-gray-800 rounded-full p-1.5 shadow transition z-10 opacity-80 group-hover:opacity-100"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}
    </div>
  );
}