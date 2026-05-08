"use client";

import { Link } from "@/i18n/navigation";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Building2, ChevronUp, Loader2, Shield } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { isRtlLocale } from "@/lib/i18n/rtl";
import { parseIsoCurrencyAmountLine } from "@/lib/currency/format-display";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { Sheet, SheetContent, SheetTitle } from "@/components/admin_ui/ui/sheet";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { postStaysBooking } from "@/lib/http/stays.client";

const BOOKING_STORAGE_KEY = "booking-details";

type SessionBookingDetails = {
  type?: string;
  title?: string;
  price?: string;
  options?: { label: string; value: string }[];
  subtitle?: string;
};

type StaysQuoteSession = {
  quote_id?: string;
  total_amount?: string;
  currency?: string;
  check_in?: string;
  check_out?: string;
};

/**
 * Duffel Stays booking step: `quote_id` from URL; organisation balance when `payment` is omitted.
 * Customer-card / 3DS flows need a `payment` object per Duffel “Paying with customer cards” (not enabled here).
 */
export function HotelCheckoutDuffel({ quoteId }: { quoteId: string }) {
  const router = useRouter();
  const t = useTranslations("Hotels.checkout");
  const locale = useLocale();
  const isRtl = isRtlLocale(locale);
  const { currencyCode, formatPrice } = useCurrency();

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [givenName, setGivenName] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [bornOn, setBornOn] = useState("1990-01-01");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [bookingDetails, setBookingDetails] = useState<SessionBookingDetails | null>(null);
  const [staysQuoteSession, setStaysQuoteSession] = useState<StaysQuoteSession | null>(null);
  const [mobileOrderSummaryOpen, setMobileOrderSummaryOpen] = useState(false);
  const [lgUp, setLgUp] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setLgUp(mq.matches);
    const onChange = () => setLgUp(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (lgUp) setMobileOrderSummaryOpen(false);
  }, [lgUp]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = sessionStorage.getItem(BOOKING_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SessionBookingDetails;
        setBookingDetails(parsed);
      }
    } catch {
      setBookingDetails(null);
    }
    try {
      const rawQuote = sessionStorage.getItem("ttu_stays_quote");
      if (rawQuote) {
        const parsed = JSON.parse(rawQuote) as StaysQuoteSession;
        setStaysQuoteSession(parsed);
      }
    } catch {
      setStaysQuoteSession(null);
    }
  }, []);

  const summaryBookingLine = useMemo(() => {
    const st = (bookingDetails?.type ?? "Hotel").toLowerCase();
    const cat =
      st === "hotel" ? t("summaryTypeHotel") : st === "car" ? t("summaryTypeCar") : t("summaryTypeFlight");
    return `${cat} ${t("summaryBookingWord")}`;
  }, [bookingDetails?.type, t]);

  const summaryTitle = bookingDetails?.title ?? t("defaultSummaryTitle");
  const summaryPrimaryPrice = useMemo(() => {
    if (staysQuoteSession?.currency && staysQuoteSession?.total_amount) {
      const n = Number.parseFloat(staysQuoteSession.total_amount);
      if (Number.isFinite(n)) {
        return formatPrice(n, staysQuoteSession.currency, locale);
      }
    }
    const parsed = parseIsoCurrencyAmountLine(bookingDetails?.price);
    if (parsed) return formatPrice(parsed.amount, parsed.currency, locale);
    return bookingDetails?.price ?? "—";
  }, [
    bookingDetails?.price,
    staysQuoteSession?.currency,
    staysQuoteSession?.total_amount,
    formatPrice,
    locale,
  ]);

  const chargedInDuffelCopy = useMemo(() => {
    if (staysQuoteSession?.currency && staysQuoteSession?.total_amount) {
      return `${staysQuoteSession.currency} ${staysQuoteSession.total_amount}`;
    }
    return parseIsoCurrencyAmountLine(bookingDetails?.price)
      ? bookingDetails?.price ?? null
      : null;
  }, [
    bookingDetails?.price,
    staysQuoteSession?.currency,
    staysQuoteSession?.total_amount,
  ]);

  const showChargeBasis =
    chargedInDuffelCopy &&
    staysQuoteSession?.currency &&
    staysQuoteSession.currency.toUpperCase() !== currencyCode.toUpperCase();

  const summaryOptions = useMemo(() => {
    if (bookingDetails?.options?.length) return bookingDetails.options;
    const rows: { label: string; value: string }[] = [];
    if (staysQuoteSession?.check_in && staysQuoteSession?.check_out) {
      rows.push({
        label: t("rowLabelStay"),
        value: `${staysQuoteSession.check_in} - ${staysQuoteSession.check_out}`,
      });
    }
    if (quoteId) {
      rows.push({ label: t("rowLabelQuote"), value: quoteId });
    }
    return rows;
  }, [bookingDetails?.options, staysQuoteSession?.check_in, staysQuoteSession?.check_out, quoteId, t]);

  /** Mirrors flight `canPreparePay`: valid lead email, names, DOB `YYYY-MM-DD`; hotel also requires phone. */
  const canConfirmBooking = useMemo(() => {
    if (!quoteId?.trim()) return false;
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    const identityOk =
      Boolean(givenName.trim()) &&
      Boolean(familyName.trim()) &&
      /^\d{4}-\d{2}-\d{2}$/.test(bornOn);
    const phoneOk = Boolean(phone.trim());
    return emailOk && identityOk && phoneOk;
  }, [quoteId, email, phone, givenName, familyName, bornOn]);

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setMessage(null);
      if (!quoteId?.trim()) {
        setMessage(t("errorMissingQuoteId"));
        return;
      }
      if (!canConfirmBooking) {
        setMessage(t("errorFillAllFields"));
        return;
      }

      setSubmitting(true);
      try {
        const idem =
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `stay-${Date.now()}`;

        const j = await postStaysBooking(
          {
            quote_id: quoteId,
            email: email.trim(),
            phone_number: phone.trim(),
            guests: [
              {
                given_name: givenName.trim(),
                family_name: familyName.trim(),
                born_on: bornOn,
              },
            ],
          },
          idem,
        );

        sessionStorage.removeItem("ttu_stays_quote");
        const bookingId = typeof j.id === "string" ? j.id.trim() : "";
        const ref =
          typeof j.booking_ref_no === "string" && j.booking_ref_no.trim()
            ? j.booking_ref_no.trim()
            : bookingId;
        if (bookingId) {
          router.push(`/profile/bookings/${encodeURIComponent(bookingId)}`);
        } else {
          router.push(`/profile/bookings?highlight=${encodeURIComponent(ref)}`);
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : t("errorBookingFailed");
        const suffix = t("errorAppendNewQuote");
        setMessage(
          msg.includes("expired") || msg.includes("quote") ? `${msg} ${suffix}` : msg,
        );
      } finally {
        setSubmitting(false);
      }
    },
    [quoteId, email, phone, givenName, familyName, bornOn, router, canConfirmBooking, t],
  );

  const renderOrderSummaryCard = (sticky: boolean) => (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-card shadow-sm",
        sticky && "sticky top-24",
      )}
    >
      <div className="flex items-center gap-3 border-b border-border bg-muted px-6 py-4">
        <Building2 className="shrink-0 text-xl text-primary" aria-hidden />
        <h3 className="text-lg font-bold text-foreground">{t("orderSummaryTitle")}</h3>
      </div>
      <div className="p-6">
        <div className="mb-6">
          <p className="mb-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {summaryBookingLine}
          </p>
          <h4 className="text-xl font-bold text-foreground">{summaryTitle}</h4>
          {bookingDetails?.subtitle ? (
            <p className="mt-1 text-sm text-muted-foreground">{bookingDetails.subtitle}</p>
          ) : null}
        </div>
        <div className="mb-6 space-y-4">
          {summaryOptions.map((opt, i) => (
            <div key={`${opt.label}-${i}`} className="flex justify-between gap-2 text-sm">
              <span className="text-start text-muted-foreground">{opt.label}</span>
              <span className="max-w-[55%] text-end font-medium text-foreground">{opt.value}</span>
            </div>
          ))}
          <div className="flex justify-between gap-2 text-sm">
            <span className="text-start text-muted-foreground">{t("quoteTotalLabel")}</span>
            <span className="text-end font-medium text-foreground">{summaryPrimaryPrice}</span>
          </div>
        </div>
        <hr className="my-4 border-border border-dashed" />
        <div className="mb-2 flex items-end justify-between gap-2">
          <span className="font-medium text-muted-foreground">{t("totalAmountLabel")}</span>
          <span className="text-3xl font-bold text-primary">{summaryPrimaryPrice}</span>
        </div>
        {showChargeBasis ? (
          <p className="text-end text-xs text-muted-foreground">{`Charged in ${chargedInDuffelCopy}`}</p>
        ) : null}
        <p className="text-end text-xs text-muted-foreground">{t("includesRoomTaxes")}</p>
      </div>
      <div className="flex items-center justify-center gap-2 bg-muted px-6 py-4 text-xs text-muted-foreground">
        <Shield className="h-4 w-4 shrink-0" aria-hidden />
        <span>{t("secureCheckout")}</span>
      </div>
    </div>
  );

  return (
    <>
      <div
        className={cn(
          "container mx-auto sm:px-4",
          // lgUp === false && "pb-[calc(5rem+env(safe-area-inset-bottom))]",
        )}
        dir={isRtl ? "rtl" : "ltr"}
      >
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("quoteLabel")} <span className="font-mono text-xs">{quoteId}</span>
            {summaryPrimaryPrice !== "—" ? (
              <>
                {" "}
                {t("headerPriceSeparator")} {summaryPrimaryPrice}
              </>
            ) : null}
          </p>
        </div>
        
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
        <div className="space-y-6 lg:col-span-2">
          <section className="relative rounded-2xl border border-border bg-card/60 shadow-sm md:p-8 sm:px-4">
            {submitting ? (
              <div
                className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-2xl bg-background/70 backdrop-blur-sm"
                role="status"
                aria-live="polite"
                aria-busy
              >
                <Loader2 className="h-10 w-10 animate-spin text-primary" aria-hidden />
                <span className="text-sm font-medium text-foreground">{t("bookingInProgress")}</span>
              </div>
            ) : null}

            <h2 className="mb-6 text-2xl font-bold text-foreground px-4">{t("guestDetailsTitle")}</h2>

            {message ? (
              <div className="mb-4 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {message}
              </div>
            ) : null}

            <form onSubmit={onSubmit} className="space-y-6">
              <div className="space-y-3 rounded-xl border border-border bg-card/80 p-4 md:p-5">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/80 pb-3">
                  <div>
                    <p className="text-base font-semibold text-foreground">
                      {t("guestIndex", { current: 1, total: 1 })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("quoteLabel")} <span className="font-mono">{quoteId}</span>
                    </p>
                  </div>
                  <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
                    {t("leadGuestBadge")}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Input
                    label={t("firstNameLabel")}
                    value={givenName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGivenName(e.target.value)}
                    required
                  />
                  <Input
                    label={t("lastNameLabel")}
                    value={familyName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFamilyName(e.target.value)}
                    required
                  />

                </div>
                <div className="grid grid-cols-1 gap-3 ">
                  <Input
                    label={t("dobLabel")}
                    type="date"
                    value={bornOn}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBornOn(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-3 border-t border-border/60 pt-4 sm:col-span-2">
                  <h3 className="text-sm font-semibold text-foreground">{t("contactDetailsTitle")}</h3>
                  <p className="text-xs text-muted-foreground">{t("contactDetailsHint")}</p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Input
                      label={t("emailLabel")}
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                      required
                    />
                    <Input
                      label={t("phoneLabel")}
                      type="tel"
                      placeholder={t("phonePlaceholder")}
                      autoComplete="tel"
                      value={phone}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 px-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="inline-flex w-full items-center justify-center gap-2 py-4 text-base font-bold shadow-lg sm:w-auto"
                  disabled={!canConfirmBooking || submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
                      {t("bookingInProgress")}
                    </>
                  ) : (
                    t("confirmBooking")
                  )}
                </Button>
                {!canConfirmBooking ? (
                  <p className="mt-2 text-xs text-muted-foreground">{t("hintIncompleteForm")}</p>
                ) : (
                  <p className="mt-2 text-xs text-muted-foreground">{t("hintChargesDuffel")}</p>
                )}
              </div>
            </form>
          </section>
        </div>

        {(lgUp === true || lgUp === null) && (
          <div className="hidden lg:block lg:col-span-1">{renderOrderSummaryCard(true)}</div>
        )}
      </div>
    </div>

      {lgUp === false ? (
        <>
          <div
            dir={isRtl ? "rtl" : "ltr"}
            className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 shadow-[0_-4px_24px_rgba(0,0,0,0.1)] backdrop-blur supports-[backdrop-filter]:bg-card/90 lg:hidden dark:shadow-[0_-4px_24px_rgba(0,0,0,0.35)]"
          >
            <div className="mx-auto w-full max-w-6xl px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2.5">
              <button
                type="button"
                onClick={() => setMobileOrderSummaryOpen(true)}
                className="flex w-full min-w-0 items-center justify-between gap-2 rounded-lg px-0.5 py-1 text-start transition-opacity hover:opacity-90 active:opacity-80"
                aria-expanded={mobileOrderSummaryOpen}
                aria-label={t("viewOrderSummaryAria")}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    {t("totalAmountLabel")}
                  </p>
                  <p className="truncate text-base font-bold text-primary sm:text-lg">{summaryPrimaryPrice}</p>
                </div>
                <ChevronUp className="h-5 w-5 shrink-0 text-primary transition-transform duration-200" aria-hidden />
              </button>
            </div>
          </div>

          <Sheet open={mobileOrderSummaryOpen} onOpenChange={setMobileOrderSummaryOpen}>
            <SheetContent
              side="bottom"
              className="flex h-auto max-h-[90vh] flex-col gap-0 overflow-hidden rounded-t-2xl border-0 p-0 max-sm:px-0"
            >
              <SheetTitle className="sr-only">{t("sheetOrderSummaryTitle")}</SheetTitle>
              <div className="max-h-[min(90vh,860px)] overflow-y-auto overscroll-contain px-3 py-1 pb-6 pt-0 sm:px-4 dropdown-scrollbar">
                {renderOrderSummaryCard(false)}
              </div>
            </SheetContent>
          </Sheet>
        </>
      ) : null}
    </>
  );
}
