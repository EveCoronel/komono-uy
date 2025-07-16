"use client";
import Link from "next/link";
import { useRouter } from 'next/navigation';

const pastelColors = [
  { bg: 'bg-rose-100', hover: 'hover:bg-rose-200', text: 'text-rose-800', border: 'border-rose-300' },
  { bg: 'bg-blue-100', hover: 'hover:bg-blue-200', text: 'text-blue-800', border: 'border-blue-300' },
  { bg: 'bg-green-100', hover: 'hover:bg-green-200', text: 'text-green-800', border: 'border-green-300' },
  { bg: 'bg-yellow-100', hover: 'hover:bg-yellow-200', text: 'text-yellow-800', border: 'border-yellow-300' },
  { bg: 'bg-violet-100', hover: 'hover:bg-violet-200', text: 'text-violet-800', border: 'border-violet-300' },
  { bg: 'bg-orange-100', hover: 'hover:bg-orange-200', text: 'text-orange-800', border: 'border-orange-300' }
];

/* function getRandomPastelColors(count) {
  if (count > pastelColors.length) {
    console.warn("No hay suficientes colores únicos. Se repetirán.");
  }
  const shuffled = [...pastelColors].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
} */



export default function CategoriesGrid({ categories }) {
  // Destacadas
  // const allColors = getRandomPastelColors(categories.length);
  const bigColors = pastelColors.slice(0, 3);
  // Colores para todas las siguientes
  const allSmallColors = pastelColors.slice(3);

  const maxDesktop = 5;
  const desktopCategories = categories.slice(0, maxDesktop);
  const desktopBig = desktopCategories.slice(0, 3);
  const desktopSmall = desktopCategories.slice(3, 5);

  const hasMoreDesktop = categories.length > maxDesktop;

  // Mobile: solo 3 grandes + "ver más"
  const maxMobile = 3;
  const mobileCategories = categories.slice(0, maxMobile);
  const hasMoreMobile = categories.length > maxMobile;

  const router = useRouter();

  return (
    <section className="mb-16">
      <h2 className="text-2xl font-semibold text-gray-800 mb-8">
        Nuestras Categorías
      </h2>

      {/* Grid para desktop (máximo 6, con botón si hay más) */}
      <div className="hidden md:grid grid-cols-3 gap-6 mb-6">
        {desktopBig.map((category, i) => {
          const colors = bigColors[i];
          return (
            <Link
              href={`/products?categoria=${category.short_id}`}
              key={category.short_id}
              className={`group ${colors.bg} ${colors.hover} border ${colors.border} 
              p-6 rounded-xl text-center transition-colors shadow-sm 
              cursor-pointer flex flex-col items-center justify-center 
              hover:scale-[1.02] min-h-[100px] md:min-h-[120px]`}
            >
              <h3 className={`text-xl font-bold ${colors.text} mb-0.5`}>
                {category.name}
              </h3>
              <span className="block text-gray-400 text-sm group-hover:text-gray-500 transition">
                Explorar {category.name}
              </span>
            </Link>
          );
        })}

        {desktopSmall.map((category, i) => {
          const colors = allSmallColors[i];
          return (
            <Link
              href={`/products?categoria=${category.short_id}`}
              key={category.short_id}
              className={`group ${colors.bg} ${colors.hover} border ${colors.border}
              rounded-lg p-4 text-center cursor-pointer transition-colors
              flex flex-col items-center justify-center shadow-sm hover:scale-[1.03] min-h-[80px]`}
            >
              <h4 className={`text-base font-semibold ${colors.text}`}>
                {category.name}
              </h4>
            </Link>
          );
        })}

        {/* Botón "Ver más categorías" en desktop */}
        {hasMoreDesktop && (
          <button
            className="group bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-4 text-center transition-colors shadow-sm cursor-pointer flex flex-col items-center justify-center min-h-[100px] font-semibold text-gray-700"
            onClick={() => router.push('/products')}
          >
            Ver más categorías +
          </button>
        )}
      </div>

      {/* Grid para mobile (máximo 3, con botón si hay más) */}
      <div className="grid md:hidden grid-cols-1 gap-4">
        {mobileCategories.map((category, i) => {
          const colors = bigColors[i] || pastelColors[i % pastelColors.length];
          return (
            <Link
              href={`/products?categoria=${category.short_id}`}
              key={category.short_id}
              className={`group ${colors.bg} ${colors.hover} border ${colors.border} 
              p-6 rounded-xl text-center transition-colors shadow-sm 
              cursor-pointer flex flex-col items-center justify-center 
              hover:scale-[1.02] min-h-[100px]`}
            >
              <h3 className={`text-lg font-bold ${colors.text} mb-0.5`}>
                {category.name}
              </h3>
            </Link>
          );
        })}

        {hasMoreMobile && (
          <button
            className="group bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-4 text-center transition-colors shadow-sm cursor-pointer flex flex-col items-center justify-center min-h-[80px] font-semibold text-gray-700"
            onClick={() => router.push('/products')}
          >
            Ver más categorías +
          </button>
        )}
      </div>

    </section>
  );

}