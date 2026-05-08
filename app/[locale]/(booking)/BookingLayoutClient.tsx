"use client";

import Navbar from "@/components/shared/Navbar";
import Breadcrumb from "@/components/shared/Breadcrumb";
import Footer from "@/components/shared/Footer";
import { BookingBreadcrumbHotelProvider } from "@/components/shared/BookingBreadcrumbHotelContext";
import { BookingBreadcrumbFlightProvider } from "@/components/shared/BookingBreadcrumbFlightContext";

export default function BookingLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <BookingBreadcrumbHotelProvider>
      <BookingBreadcrumbFlightProvider>
        <Navbar />
        <Breadcrumb />
        {children}
        <Footer />
      </BookingBreadcrumbFlightProvider>
    </BookingBreadcrumbHotelProvider>
  );
}
