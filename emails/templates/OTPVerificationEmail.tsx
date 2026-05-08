import {
  Body,
  Button,
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

export type OTPVerificationEmailProps = {
  /** One-time code or short token to display. */
  code: string;
  /** Short label for the email purpose, e.g. "Sign in", "Confirm email". */
  purpose: string;
  /** Optional magic / confirmation link when the flow uses a button instead of typing the code. */
  actionUrl?: string;
  expiresInMinutes?: number;
};

export default function OTPVerificationEmail({
  code,
  purpose,
  actionUrl,
  expiresInMinutes = 15,
}: OTPVerificationEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>
        {purpose} — your verification code for TravelTourUp
      </Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-slate-100 font-sans">
          <Container className="mx-auto max-w-[600px] rounded-2xl bg-white px-8 py-10 shadow-sm">
            <Section className="text-center">
              <Text className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">
                TravelTourUp
              </Text>
              <Heading className="m-0 text-2xl font-bold text-slate-900">{purpose}</Heading>
              <Text className="mt-3 text-base leading-relaxed text-slate-600">
                Use the verification code below to continue. For your security, never share this code with anyone.
              </Text>
            </Section>
            <Section className="mt-8 rounded-xl border border-slate-200 bg-slate-50 px-6 py-8 text-center">
              <Text className="m-0 text-xs font-medium uppercase tracking-wider text-slate-500">Your code</Text>
              <Text className="mt-2 text-4xl font-bold tracking-[0.25em] text-slate-900">{code}</Text>
              <Text className="mt-3 text-sm text-slate-500">Expires in {expiresInMinutes} minutes</Text>
            </Section>
            {actionUrl ? (
              <Section className="mt-8 text-center">
                <Text className="text-sm text-slate-600">Or confirm in one tap:</Text>
                <Button
                  href={actionUrl}
                  className="mt-3 rounded-full bg-sky-600 px-8 py-3 text-sm font-semibold text-white no-underline"
                >
                  Continue securely
                </Button>
              </Section>
            ) : null}
            <Hr className="my-8 border-slate-200" />
            <Text className="text-center text-xs text-slate-500">
              Didn&apos;t request this? You can safely ignore this email. Need help?{" "}
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
