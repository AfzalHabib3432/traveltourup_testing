import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";

export type CancelBookingEmailProps = {
  bookingReference: string;
  guestName: string;
  /** Short explanation (e.g. product name or route). */
  summary?: string;
  manageUrl?: string;
};

export default function CancelBookingEmail({
  bookingReference,
  guestName,
  summary,
  manageUrl,
}: CancelBookingEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Booking cancelled — {bookingReference}</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-slate-100 font-sans">
          <Container className="mx-auto max-w-[600px] rounded-2xl bg-white px-8 py-10 shadow-sm">
            <Section>
              <Text className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">
                TravelTourUp
              </Text>
              <Heading className="m-0 text-2xl font-bold text-slate-900">Booking cancelled</Heading>
              <Text className="mt-3 text-base leading-relaxed text-slate-600">
                Hi {guestName}, your booking has been cancelled as requested.
              </Text>
            </Section>
            <Section className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-6">
              <Text className="m-0 text-xs font-semibold uppercase text-slate-500">Reference</Text>
              <Text className="mt-1 text-lg font-bold text-slate-900">{bookingReference}</Text>
              {summary ? (
                <Text className="mt-3 text-sm text-slate-600">{summary}</Text>
              ) : null}
            </Section>
            {manageUrl ? (
              <Section className="mt-8 text-center">
                <Link
                  href={manageUrl}
                  className="inline-block rounded-full bg-sky-600 px-8 py-3 text-sm font-semibold text-white no-underline"
                >
                  View account
                </Link>
              </Section>
            ) : null}
            <Hr className="my-8 border-slate-200" />
            <Text className="text-center text-xs text-slate-500">
              Questions?{" "}
              <Link href="mailto:support@traveltourup.com" className="text-sky-600 underline">
                support@traveltourup.com
              </Link>
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
