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

export type PaymentReceiptEmailProps = {
  receiptId: string;
  guestName: string;
  /** Formatted amount paid. */
  amount: string;
  /** ISO or human-readable timestamp string. */
  paidAt: string;
  /** Short line item description (e.g. flight route or hotel name). */
  itemSummary: string;
  receiptUrl?: string;
  paymentMethodLabel?: string;
};

export default function PaymentReceiptEmail({
  receiptId,
  guestName,
  amount,
  paidAt,
  itemSummary,
  receiptUrl,
  paymentMethodLabel = "Card",
}: PaymentReceiptEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Payment receipt {receiptId} — TravelTourUp</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-slate-100 font-sans">
          <Container className="mx-auto max-w-[600px] rounded-2xl bg-white px-8 py-10 shadow-sm">
            <Section>
              <Text className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">
                TravelTourUp
              </Text>
              <Heading className="m-0 text-2xl font-bold text-slate-900">Payment received</Heading>
              <Text className="mt-3 text-base leading-relaxed text-slate-600">
                Hi {guestName}, we&apos;ve successfully processed your payment. Thank you for choosing TravelTourUp.
              </Text>
            </Section>
            <Section className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-6">
              <Row>
                <Column>
                  <Text className="m-0 text-xs font-semibold uppercase text-slate-500">Receipt</Text>
                  <Text className="mt-1 text-lg font-bold text-slate-900">{receiptId}</Text>
                </Column>
                <Column className="text-right">
                  <Text className="m-0 text-xs font-semibold uppercase text-slate-500">Amount</Text>
                  <Text className="mt-1 text-lg font-bold text-emerald-700">{amount}</Text>
                </Column>
              </Row>
              <Hr className="my-4 border-slate-200" />
              <Text className="m-0 text-sm text-slate-600">
                <span className="font-semibold text-slate-800">Item:</span> {itemSummary}
              </Text>
              <Text className="mt-2 text-sm text-slate-600">
                <span className="font-semibold text-slate-800">Paid:</span> {paidAt}
              </Text>
              <Text className="mt-2 text-sm text-slate-600">
                <span className="font-semibold text-slate-800">Method:</span> {paymentMethodLabel}
              </Text>
            </Section>
            {receiptUrl ? (
              <Section className="mt-8 text-center">
                <Link
                  href={receiptUrl}
                  className="inline-block rounded-full border border-slate-300 bg-white px-8 py-3 text-sm font-semibold text-slate-800 no-underline"
                >
                  Download receipt
                </Link>
              </Section>
            ) : null}
            <Hr className="my-8 border-slate-200" />
            <Text className="text-center text-xs text-slate-500">
              Billing questions?{" "}
              <Link href="mailto:billing@traveltourup.com" className="text-sky-600 underline">
                billing@traveltourup.com
              </Link>
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
