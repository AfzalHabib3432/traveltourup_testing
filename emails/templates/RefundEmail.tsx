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

export type RefundEmailProps = {
  refundId: string;
  guestName: string;
  amount: string;
  summary?: string;
  receiptUrl?: string;
};

export default function RefundEmail({ refundId, guestName, amount, summary, receiptUrl }: RefundEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Refund processed — {refundId}</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-slate-100 font-sans">
          <Container className="mx-auto max-w-[600px] rounded-2xl bg-white px-8 py-10 shadow-sm">
            <Section>
              <Text className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">
                TravelTourUp
              </Text>
              <Heading className="m-0 text-2xl font-bold text-slate-900">Refund on the way</Heading>
              <Text className="mt-3 text-base leading-relaxed text-slate-600">
                Hi {guestName}, we&apos;ve processed your refund. It may take a few business days to appear on your
                statement.
              </Text>
            </Section>
            <Section className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-6">
              <Row>
                <Column>
                  <Text className="m-0 text-xs font-semibold uppercase text-slate-500">Refund ID</Text>
                  <Text className="mt-1 text-lg font-bold text-slate-900">{refundId}</Text>
                </Column>
                <Column className="text-right">
                  <Text className="m-0 text-xs font-semibold uppercase text-slate-500">Amount</Text>
                  <Text className="mt-1 text-lg font-bold text-emerald-700">{amount}</Text>
                </Column>
              </Row>
              {summary ? <Text className="mt-4 text-sm text-slate-600">{summary}</Text> : null}
            </Section>
            {receiptUrl ? (
              <Section className="mt-8 text-center">
                <Link
                  href={receiptUrl}
                  className="inline-block rounded-full bg-sky-600 px-8 py-3 text-sm font-semibold text-white no-underline"
                >
                  View details
                </Link>
              </Section>
            ) : null}
            <Hr className="my-8 border-slate-200" />
            <Text className="text-center text-xs text-slate-500">
              Need help?{" "}
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
