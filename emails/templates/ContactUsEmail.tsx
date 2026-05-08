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

export type ContactUsEmailProps = {
  /** Visitor name from the form. */
  name: string;
  /** Visitor email (shown in body; delivery `to` is set by the API). */
  replyEmail: string;
  message: string;
  submittedAt: string;
};

export default function ContactUsEmail({ name, replyEmail, message, submittedAt }: ContactUsEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Message from {name}</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-slate-100 font-sans">
          <Container className="mx-auto max-w-[600px] rounded-2xl bg-white px-8 py-10 shadow-sm">
            <Section>
              <Text className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">
                TravelTourUp
              </Text>
              <Heading className="m-0 text-2xl font-bold text-slate-900">We received your message</Heading>
              <Text className="mt-3 text-base leading-relaxed text-slate-600">
                Thanks for reaching out. This is a copy of what you sent us on {submittedAt}.
              </Text>
            </Section>
            <Section className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-6">
              <Text className="m-0 text-xs font-semibold uppercase text-slate-500">From</Text>
              <Text className="mt-1 text-sm font-semibold text-slate-900">
                {name} ({replyEmail})
              </Text>
              <Hr className="my-4 border-slate-200" />
              <Text className="m-0 whitespace-pre-wrap text-sm text-slate-700">{message}</Text>
            </Section>
            <Hr className="my-8 border-slate-200" />
            <Text className="text-center text-xs text-slate-500">
              Our team will reply as soon as possible.{" "}
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
