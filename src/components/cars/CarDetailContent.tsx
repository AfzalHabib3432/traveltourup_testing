"use client";

import React from "react";
import {
  Building2,
  Settings,
  Fuel,
  Users,
  Luggage,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  Star,
  Bluetooth,
  Radio,
  Camera,
  Car,
  Navigation,
  Baby,
} from "lucide-react";
import type { CarListing } from "@/types";
import { DetailKeyGrid } from "@/components/shared/DetailKeyGrid";
import { DetailFeaturesGrid } from "@/components/shared/DetailFeaturesGrid";
import { ImageGallery } from "@/components/shared/ImageGallery";
import { useTranslations } from "next-intl";

const FEATURE_ICONS: Record<string, { icon: React.ReactNode; label: string }> = {
  ac: { icon: <Car className="w-4 h-4" />, label: "Air Conditioning" },
  bluetooth: { icon: <Bluetooth className="w-4 h-4" />, label: "Bluetooth" },
  cruise: { icon: <Settings className="w-4 h-4" />, label: "Cruise Control" },
  usb: { icon: <Radio className="w-4 h-4" />, label: "USB Port" },
  camera: { icon: <Camera className="w-4 h-4" />, label: "Rear Camera" },
  parking: { icon: <Car className="w-4 h-4" />, label: "Parking Sensors" },
  gps: { icon: <Navigation className="w-4 h-4" />, label: "GPS" },
  child: { icon: <Baby className="w-4 h-4" />, label: "Child Seat" },
};

export interface CarDetailContentProps {
  car: CarListing;
}

export function CarDetailContent({ car }: CarDetailContentProps) {
  const td = useTranslations("Cars.detail");
  const tc = useTranslations("Common");

  const supplierDesc = `${car.supplier} is a trusted car rental provider with ${car.supplierReviews} reviews and a ${car.supplierRating}/10 rating. Offering quality vehicles with transparent pricing and reliable service.`;

  const keyDetails = [
    {
      icon: <Building2 className="w-5 h-5" />,
      label: td("labelSupplier"),
      value: car.supplier,
    },
    {
      icon: <Settings className="w-5 h-5" />,
      label: td("labelTransmission"),
      value: car.transmission,
    },
    {
      icon: <Fuel className="w-5 h-5" />,
      label: td("labelFuelType"),
      value: car.fuel,
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: td("labelSeats"),
      value: td("seatsPassengers", { count: car.seats }),
    },
    {
      icon: <Luggage className="w-5 h-5" />,
      label: td("labelBaggage"),
      value: td("bagsCount", { count: car.bags }),
    },
    {
      icon: <Car className="w-5 h-5" />,
      label: td("labelCategory"),
      value: car.category,
    },
    {
      icon: car.freeCancellation ? (
        <CheckCircle className="w-5 h-5" />
      ) : (
        <XCircle className="w-5 h-5" />
      ),
      label: td("labelCancellation"),
      value: car.freeCancellation ? tc("freeCancellation") : td("cancellationFeeApplies"),
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      label: td("labelPickupLocation"),
      value: car.location,
    },
    {
      icon: <Clock className="w-5 h-5" />,
      label: td("labelPickupHours"),
      value: car.pickupTime,
    },
    {
      icon: <Star className="w-5 h-5" />,
      label: td("labelRating"),
      value: td("ratingReviews", { rating: car.rating, count: car.reviews }),
    },
    {
      icon: <Car className="w-5 h-5" />,
      label: td("labelMileage"),
      value: car.mileage,
    },
    {
      icon: <Car className="w-5 h-5" />,
      label: td("labelDoors"),
      value: td("doorsCount", { count: car.doors }),
    },
  ];

  const features = car.features.map((f) => ({
    icon: FEATURE_ICONS[f]?.icon ?? <CheckCircle className="w-4 h-4" />,
    label: FEATURE_ICONS[f]?.label ?? f,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          {car.name}
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground">
            {car.category} • {car.type}
          </span>
          {car.tags?.length > 0 && (
            <span className="px-3 py-1 rounded-lg bg-amber-400 text-amber-950 font-bold text-sm">
              {car.tags[0]}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center bg-primary/10 text-primary px-2 py-1 rounded-lg">
            <Star className="w-4 h-4 mr-1 fill-current" />
            <span className="font-bold text-sm">{car.rating}</span>
          </div>
          <span className="text-muted-foreground text-sm">
            {td("reviewsParenthetical", { count: car.reviews })}
          </span>
        </div>
      </div>

      {/* Image gallery */}
      {car.images && car.images.length > 0 && (
        <ImageGallery images={car.images} alt={car.name} />
      )}

      {/* Key details grid */}
      <div>
        <DetailKeyGrid items={keyDetails} columns={3} />
      </div>

      {/* About supplier */}
      <div className="pt-8 border-t border-border">
        <h2 className="text-xl font-bold text-foreground mb-4">
          {td("aboutSupplierHeading", { supplier: car.supplier })}
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          {supplierDesc}
        </p>
        <div className="mt-4 text-sm text-muted-foreground">
          {car.distance} • {car.location}
        </div>
      </div>

      {/* Features */}
      <DetailFeaturesGrid
        title={td("featuresSectionTitle")}
        description={td("featuresSectionDescription")}
        features={features}
      />

      {/* Included */}
      <div className="pt-8 border-t border-border">
        <h2 className="text-xl font-bold text-foreground mb-4">{td("sectionIncluded")}</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {car.included.map((item, i) => (
            <li key={i} className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success shrink-0" />
              <span className="text-muted-foreground">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Deals */}
      {car.deals && car.deals.length > 0 && (
        <div className="pt-8 border-t border-border">
          <h2 className="text-xl font-bold text-foreground mb-4">{td("sectionDeals")}</h2>
          <div className="flex flex-wrap gap-2">
            {car.deals.map((deal, i) => (
              <span
                key={i}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                  deal.highlight
                    ? "bg-success/20 text-success"
                    : "bg-primary/10 text-primary"
                }`}
              >
                {deal.text}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Pickup info */}
      <div className="pt-8 border-t border-border">
        <h2 className="text-xl font-bold text-foreground mb-2">{td("sectionPickupDetails")}</h2>
        <p className="text-foreground">{car.location}</p>
        <p className="text-sm text-muted-foreground mt-1">{car.distance}</p>
        <p className="text-sm text-muted-foreground">{car.pickupTime}</p>
      </div>
    </div>
  );
}
