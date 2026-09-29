import React from "react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PropertyCard } from "@/components/property/PropertyCard";
import { PropertyFilterSidebar } from "@/components/property/PropertyFilterSidebar";
import { PropertySortControl } from "@/components/property/PropertySortControl";
import { Prisma } from "@prisma/client";
import { Building2 } from "lucide-react";

interface ImoveisPageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export const dynamic = "force-dynamic";

export default async function ImoveisPage(props: ImoveisPageProps) {
  const searchParams = await props.searchParams;
  const session = await getSession();

  // Filtros
  const purpose = searchParams.purpose;
  const type = searchParams.type;
  const location = searchParams.location?.trim();
  const minPrice = searchParams.minPrice ? parseFloat(searchParams.minPrice) : undefined;
  const maxPrice = searchParams.maxPrice ? parseFloat(searchParams.maxPrice) : undefined;
  const bedrooms = searchParams.bedrooms ? parseInt(searchParams.bedrooms) : undefined;
  const bathrooms = searchParams.bathrooms ? parseInt(searchParams.bathrooms) : undefined;
  const parkingSpaces = searchParams.parkingSpaces ? parseInt(searchParams.parkingSpaces) : undefined;
  const minArea = searchParams.minArea ? parseFloat(searchParams.minArea) : undefined;
  const maxArea = searchParams.maxArea ? parseFloat(searchParams.maxArea) : undefined;
  const sort = searchParams.sort || "recent";

  // Montar clausula where
  const where: Prisma.PropertyWhereInput = {
    status: "PUBLICADO",
  };

  if (purpose) {
    where.purpose = purpose;
  }

  if (type) {
    where.type = type;
  }

  if (location) {
    where.OR = [
      { city: { contains: location, mode: "insensitive" } },
      { neighborhood: { contains: location, mode: "insensitive" } },
      { title: { contains: location, mode: "insensitive" } },
      { state: { contains: location, mode: "insensitive" } },
      { description: { contains: location, mode: "insensitive" } },
    ];
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = minPrice;
    if (maxPrice !== undefined) where.price.lte = maxPrice;
  }

  if (bedrooms !== undefined) {
    where.bedrooms = { gte: bedrooms };
  }

  if (bathrooms !== undefined) {
    where.bathrooms = { gte: bathrooms };
  }

  if (parkingSpaces !== undefined) {
    where.parkingSpaces = { gte: parkingSpaces };
  }

  if (minArea !== undefined || maxArea !== undefined) {
    where.builtArea = {};
    if (minArea !== undefined) where.builtArea.gte = minArea;
    if (maxArea !== undefined) where.builtArea.lte = maxArea;
  }

  // Ordenação
  let orderBy: Prisma.PropertyOrderByWithRelationInput[] = [
    { isFeatured: "desc" },
    { createdAt: "desc" },
  ];

  if (sort === "price_asc") {
    orderBy = [{ price: "asc" }];
  } else if (sort === "price_desc") {
    orderBy = [{ price: "desc" }];
  } else if (sort === "area_desc") {
    orderBy = [{ builtArea: "desc" }];
  } else if (sort === "recent") {
    orderBy = [{ createdAt: "desc" }];
  }

  const properties = await prisma.property.findMany({
    where,
    orderBy,
    include: {
      images: {
        orderBy: { order: "asc" },
      },
    },
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5]">
      <Navbar session={session} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Cabeçalho Editorial */}
        <div className="mb-10 text-center sm:text-left">
          <span className="text-xs uppercase tracking-[0.25em] text-[#C5A880] font-semibold">
            Portfólio Exclusivo
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-normal text-[#0F1115] mt-1.5 tracking-tight">
            Residências & Empreendimentos Singulares
          </h1>
          <p className="text-sm sm:text-base text-[#68655F] font-light max-w-2xl mt-2 leading-relaxed">
            Consulte nossa coleção de coberturas, casas assinadas e refúgios de altíssimo padrão com atendimento consultivo discreto.
          </p>
        </div>

        {/* Layout: Sidebar de Filtros + Grid de Imóveis */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <React.Suspense fallback={<div className="w-72 h-96 bg-white/50 rounded-sm animate-pulse" />}>
            <PropertyFilterSidebar />
          </React.Suspense>

          <div className="flex-1 w-full">
            <React.Suspense fallback={<div className="h-16 bg-white/50 rounded-sm animate-pulse mb-8" />}>
              <PropertySortControl totalCount={properties.length} />
            </React.Suspense>

            {properties.length === 0 ? (
              <div className="bg-[#FFFFFF] border border-[#0F1115]/10 rounded-sm p-12 text-center space-y-4 shadow-subtle my-6">
                <div className="w-12 h-12 rounded-full bg-[#F4F1EA] flex items-center justify-center mx-auto text-[#C5A880]">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-2xl text-[#0F1115]">
                  Nenhum imóvel corresponde aos filtros selecionados.
                </h3>
                <p className="text-sm text-[#8C8983] max-w-md mx-auto font-light">
                  Experimente flexibilizar os parâmetros de preço, localização ou tipologia, ou fale diretamente com um de nossos consultores para busca off-market.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
