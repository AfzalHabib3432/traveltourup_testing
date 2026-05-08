import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Row,
  Column,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";

export type BookingConfirmationEmailProps = {
  bookingReference: string;
  guestName: string;
  destination: string;
  /** Human-readable date range or itinerary summary. */
  dates: string;
  /** Formatted total (e.g. "USD 1,240.00"). */
  total: string;
  /** Optional deep link to manage the booking in the app. */
  manageUrl?: string;
  productLabel?: string;
};

export default function BookingConfirmationEmail({
  bookingReference,
  guestName,
  destination,
  dates,
  total,
  manageUrl,
  productLabel = "Trip",
}: BookingConfirmationEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>
        Booking confirmed — {destination} ({bookingReference})
      </Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-slate-100 font-sans">
          <Container className="mx-auto max-w-[600px] rounded-2xl bg-white px-8 py-10 shadow-sm">
            <Section>
              <Text className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">
                TravelTourUp
              </Text>
              <Heading className="m-0 text-2xl font-bold text-slate-900">You&apos;re booked!</Heading>
              <Text className="mt-3 text-base leading-relaxed text-slate-600">
                Hi {guestName}, thanks for booking with TravelTourUp. Your {productLabel.toLowerCase()} is confirmed.
                Keep this email for your records.
              </Text>
            </Section>
            <Section className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-6">
              <Row>
                <Column>
                  <Text className="m-0 text-xs font-semibold uppercase text-slate-500">Confirmation</Text>
                  <Text className="mt-1 text-lg font-bold text-slate-900">{bookingReference}</Text>
                </Column>
                <Column className="text-right">
                  <Text className="m-0 text-xs font-semibold uppercase text-slate-500">Total</Text>
                  <Text className="mt-1 text-lg font-bold text-sky-700">{total}</Text>
                </Column>
              </Row>
              <Hr className="my-4 border-slate-200" />
              <Text className="m-0 text-sm font-semibold text-slate-800">{destination}</Text>
              <Text className="mt-1 text-sm text-slate-600">{dates}</Text>
            </Section>
            {manageUrl ? (
              <Section className="mt-8 text-center">
                <Link
                  href={manageUrl}
                  className="inline-block rounded-full bg-sky-600 px-8 py-3 text-sm font-semibold text-white no-underline"
                >
                  View booking
                </Link>
              </Section>
            ) : null}
            <Hr className="my-8 border-slate-200" />
            <Text className="text-center text-xs text-slate-500">
              Questions about this booking?{" "}
              <Link href="mailto:support@traveltourup.com" className="text-sky-600 underline">
                We&apos;re here to help
              </Link>
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
