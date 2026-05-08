"use client";

import React, { useMemo } from "react";
import type { FlightOfferDTO } from "@/lib/duffel/dto/flight-offer.dto";
import type { SeatMapDTO } from "@/lib/duffel/dto/seat-map.dto";
import { groupDuplicatedOfferServices } from "@/lib/flights/group-offer-services";
import { Button } from "@/components/ui/Button";
import { useLocale } from "next-intl";
import { useCurrency } from "@/components/providers/CurrencyProvider";

function segmentLabel(offer: FlightOfferDTO, segmentId: string | null): string {
  if (!segmentId) return "Flight";
  for (const sl of offer.slices) {
    const seg = sl.segments.find((x) => x.id === segmentId);
    if (seg) return `${seg.origin_iata} → ${seg.destination_iata}`;
  }
  return "Segment";
}

export function FlightCheckoutDuffelExtras(props: {
  offer: FlightOfferDTO;
  seatMaps: SeatMapDTO[] | null;
  seatMapsLoading: boolean;
  seatMapsError: string | null;
  bagQuantities: Record<string, number>;
  onBagQuantityChange: (serviceId: string, qty: number) => void;
  seatPassengerId: string;
  onSeatPassengerChange: (passengerId: string) => void;
  /** `${segmentId}::${passengerId}` → seat service id */
  seatSelections: Record<string, string>;
  onSelectSeat: (segmentId: string, passengerId: string, serviceId: string | null) => void;
  onBack: () => void;
  onContinueToPayment: () => void;
  payBusy: boolean;
  pricingError: string | null;
  /** When false, hides checkout navigation (e.g. embedded in flight detail sidebar). */
  showActions?: boolean;
  /** Tighter layout and scroll for narrow sidebars. */
  compact?: boolean;
}) {
  const {
    offer,
    seatMaps,
    seatMapsLoading,
    seatMapsError,
    bagQuantities,
    onBagQuantityChange,
    seatPassengerId,
    onSeatPassengerChange,
    seatSelections,
    onSelectSeat,
    onBack,
    onContinueToPayment,
    payBusy,
    pricingError,
    showActions = true,
    compact = false,
  } = props;
  const locale = useLocale();
  const { formatPrice } = useCurrency();
  const pad = compact ? "p-4" : "p-6";
  const seatScroll = compact ? "max-h-[min(52vh,22rem)] overflow-y-auto pr-1" : "";

  const serviceGroups = useMemo(
    () => groupDuplicatedOfferServices(offer.available_services),
    [offer.available_services],
  );

  return (
    <div className={compact ? "space-y-4" : "space-y-8"}>
      <section className={`rounded-2xl border border-border bg-card shadow-sm ${pad}`}>
        <h2 className={`font-semibold text-foreground ${compact ? "text-base mb-1" : "text-lg mb-2"}`}>
          Bags and extras
        </h2>
        <p className={`text-muted-foreground mb-4 ${compact ? "text-xs" : "text-sm"}`}>
          Add optional services from the airline when available. Prices are confirmed on the server before you pay.
        </p>
        {offer.available_services.length === 0 ? (
          <p className="text-sm text-muted-foreground">No add-on services on this offer.</p>
        ) : (
          <ul className="space-y-3">
            {serviceGroups.map(({ display: s, memberIds }) => {
              const max = s.maximum_quantity ?? 9;
              const q0 = bagQuantities[memberIds[0]] ?? 0;
              const q = q0;
              return (
                <li
                  key={memberIds.join("|")}
                  className="flex flex-col gap-2 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {s.type ?? "Extra"}
                      {memberIds.length > 1 ? (
                        <span className="ml-1 text-xs font-normal text-muted-foreground">
                          ({memberIds.length} segments — same price)
                        </span>
                      ) : null}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(Number.parseFloat(s.total_amount), s.total_currency, locale)}
                      {s.maximum_quantity != null ? ` · max ${s.maximum_quantity} per segment` : null}
                    </p>
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Qty</span>
                    <input
                      type="number"
                      min={0}
                      max={max}
                      className="w-20 rounded-md border border-input bg-background px-2 py-1"
                      value={q}
                      onChange={(e) => {
                        const n = Number.parseInt(e.target.value, 10);
                        const v = Number.isNaN(n) ? 0 : Math.max(0, Math.min(max, n));
                        for (const id of memberIds) {
                          onBagQuantityChange(id, v);
                        }
                      }}
                    />
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className={`rounded-2xl border border-border bg-card shadow-sm space-y-4 ${pad}`}>
        <h2 className={`font-semibold text-foreground ${compact ? "text-base" : "text-lg"}`}>Seats</h2>
        <p className={`text-muted-foreground ${compact ? "text-xs" : "text-sm"}`}>
          Seat maps are not available for every airline. Choose who you are seating first, then tap a seat. Only one seat
          per passenger per segment.
        </p>
        {offer.passengers.length > 1 ? (
          <label className="block text-sm max-w-xs">
            <span className="text-muted-foreground block mb-1">Seat selection for</span>
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              value={seatPassengerId}
              onChange={(e) => onSeatPassengerChange(e.target.value)}
            >
              {offer.passengers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.id} {p.type ? `(${p.type})` : ""}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        {seatMapsError ? <p className="text-sm text-destructive">{seatMapsError}</p> : null}
        {seatMapsLoading ? (
          <div className="min-h-[120px] animate-pulse rounded-lg bg-muted/60" />
        ) : !seatMaps || seatMaps.length === 0 ? (
          <p className="text-sm text-muted-foreground">No seat map returned for this offer.</p>
        ) : (
          <div className={`space-y-8 ${seatScroll}`}>
            {seatMaps.map((sm) => {
              const segmentKey = sm.segment_id ?? sm.id;
              return (
              <div key={sm.id} className="space-y-3">
                <h3 className="text-base font-semibold text-foreground">
                  {segmentLabel(offer, sm.segment_id)}
                </h3>
                {sm.cabins.map((cab, ci) => (
                  <div key={`${sm.id}-cab-${ci}`} className="space-y-2">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {cab.cabin_class ?? "Cabin"}
                      {cab.deck != null ? ` · deck ${cab.deck}` : ""}
                    </p>
                    <div className="overflow-x-auto rounded-lg border border-border p-3 bg-muted/20">
                      {cab.rows.map((row, ri) => (
                        <div key={`r-${ri}`} className="flex flex-wrap gap-1 justify-center py-0.5">
                          {row.sections.map((sec, si) => (
                            <div key={`s-${si}`} className="flex gap-1">
                              {sec.elements.map((el, ei) => {
                                if (el.type !== "seat") {
                                  return (
                                    <span
                                      key={`e-${ei}`}
                                      className="inline-flex h-8 min-w-[2rem] items-center justify-center text-[10px] text-muted-foreground"
                                      title={el.type}
                                    >
                                      ·
                                    </span>
                                  );
                                }
                                const svcForPax = el.services.find((x) => x.passenger_id === seatPassengerId);
                                const key = `${segmentKey}::${seatPassengerId}`;
                                const selectedId = seatSelections[key];
                                const pickedHere = svcForPax && selectedId === svcForPax.id;
                                const disabled = !svcForPax;
                                return (
                                  <button
                                    key={`e-${ei}`}
                                    type="button"
                                    disabled={disabled}
                                    title={
                                      svcForPax
                                        ? `${el.designator ?? "?"} · ${formatPrice(Number.parseFloat(svcForPax.total_amount), svcForPax.total_currency, locale)}`
                                        : el.designator ?? "Unavailable"
                                    }
                                    onClick={() => {
                                      if (!svcForPax) return;
                                      onSelectSeat(
                                        segmentKey,
                                        seatPassengerId,
                                        pickedHere ? null : svcForPax.id,
                                      );
                                    }}
                                    className={[
                                      "h-9 min-w-[2.25rem] rounded-md text-xs font-semibold border transition-colors",
                                      disabled
                                        ? "border-transparent bg-muted/40 text-muted-foreground cursor-not-allowed"
                                        : pickedHere
                                          ? "border-primary bg-primary text-primary-foreground"
                                          : "border-border bg-background hover:border-primary/60",
                                    ].join(" ")}
                                  >
                                    {el.designator?.trim() || "—"}
                                  </button>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            );
            })}
          </div>
        )}
      </section>

      {showActions ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Button type="button" variant="outline" onClick={onBack}>
            Back to passengers
          </Button>
          <div className="flex flex-col items-stretch gap-2 sm:items-end">
            {pricingError ? <p className="text-sm text-destructive">{pricingError}</p> : null}
            <Button type="button" disabled={payBusy} onClick={() => void onContinueToPayment()}>
              {payBusy ? "Preparing…" : "Continue to card payment"}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
