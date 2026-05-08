import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createLocalizedRouteMetadata, getLocalizedRouteMetadata } from "@/config/metadata.config";
import { MOCK_CARS } from "@/data/mock-cars";
import CarDetail from "@/views/CarDetail";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  const car = MOCK_CARS.find((c) => String(c.id) === id);
  if (!car) return {};
  const base = await getLocalizedRouteMetadata(locale, "/cars");
  const path = `/cars/${id}`;
  const config = {
    ...base,
    title: `${car.name} — ${car.category}`,
    description: `${car.name}: ${car.category} rental. Book on TravelTourUp.`,
    openGraph: {
      title: `${car.name} — TravelTourUp`,
      description: `${car.category} rental options for your trip.`,
    },
    keywords: ["car rental", car.category.toLowerCase(), car.name.toLowerCase()],
  };
  return createLocalizedRouteMetadata(config, locale, path);
}

export default async function CarDetailPage({ params }: Props) {
  const { id } = await params;
  const car = MOCK_CARS.find((c) => String(c.id) === id);

  if (!car) {
    notFound();
  }

  return <CarDetail car={car} />;
}
