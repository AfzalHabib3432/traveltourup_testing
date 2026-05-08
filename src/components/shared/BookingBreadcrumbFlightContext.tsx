"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";

export type FlightDetailLabels = {
  route: string;
  title: string;
};

type BookingBreadcrumbFlightContextValue = {
  flightDetailRouteLabel: string | null;
  flightDetailPageTitle: string | null;
  setFlightDetailLabels: (labels: FlightDetailLabels) => void;
  resetFlightDetailLabels: () => void;
};

const BookingBreadcrumbFlightContext = createContext<BookingBreadcrumbFlightContextValue | null>(null);

export function BookingBreadcrumbFlightProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [flightDetailRouteLabel, setFlightDetailRouteLabel] = useState<string | null>(null);
  const [flightDetailPageTitle, setFlightDetailPageTitle] = useState<string | null>(null);

  const setFlightDetailLabels = useCallback((labels: FlightDetailLabels) => {
    setFlightDetailRouteLabel(labels.route);
    setFlightDetailPageTitle(labels.title);
  }, []);

  const resetFlightDetailLabels = useCallback(() => {
    setFlightDetailRouteLabel(null);
    setFlightDetailPageTitle(null);
  }, []);

  const pathnameResetSkipFirst = useRef(true);
  useEffect(() => {
    if (pathnameResetSkipFirst.current) {
      pathnameResetSkipFirst.current = false;
      return;
    }
    resetFlightDetailLabels();
  }, [pathname, resetFlightDetailLabels]);

  const value = useMemo(
    () => ({
      flightDetailRouteLabel,
      flightDetailPageTitle,
      setFlightDetailLabels,
      resetFlightDetailLabels,
    }),
    [flightDetailRouteLabel, flightDetailPageTitle, setFlightDetailLabels, resetFlightDetailLabels],
  );

  return (
    <BookingBreadcrumbFlightContext.Provider value={value}>{children}</BookingBreadcrumbFlightContext.Provider>
  );
}

const noop = () => {};

export function useBookingBreadcrumbFlightLabels(): BookingBreadcrumbFlightContextValue {
  const ctx = useContext(BookingBreadcrumbFlightContext);
  if (!ctx) {
    return {
      flightDetailRouteLabel: null,
      flightDetailPageTitle: null,
      setFlightDetailLabels: noop,
      resetFlightDetailLabels: noop,
    };
  }
  return ctx;
}
