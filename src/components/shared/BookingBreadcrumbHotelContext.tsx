"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

type BookingBreadcrumbHotelContextValue = {
  hotelDetailCrumbLabel: string | null;
  setHotelDetailCrumbLabel: (label: string | null) => void;
};

const BookingBreadcrumbHotelContext = createContext<BookingBreadcrumbHotelContextValue | null>(null);

export function BookingBreadcrumbHotelProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [hotelDetailCrumbLabel, setHotelDetailCrumbLabelState] = useState<string | null>(null);

  const setHotelDetailCrumbLabel = useCallback((label: string | null) => {
    setHotelDetailCrumbLabelState(label);
  }, []);

  useEffect(() => {
    setHotelDetailCrumbLabelState(null);
  }, [pathname]);

  const value = useMemo(
    () => ({ hotelDetailCrumbLabel, setHotelDetailCrumbLabel }),
    [hotelDetailCrumbLabel, setHotelDetailCrumbLabel],
  );

  return <BookingBreadcrumbHotelContext.Provider value={value}>{children}</BookingBreadcrumbHotelContext.Provider>;
}

export function useBookingBreadcrumbHotelTitle(): BookingBreadcrumbHotelContextValue {
  const ctx = useContext(BookingBreadcrumbHotelContext);
  if (!ctx) {
    return {
      hotelDetailCrumbLabel: null,
      setHotelDetailCrumbLabel: () => {},
    };
  }
  return ctx;
}
