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

export type PasswordResetEmailProps = {
  resetUrl: string;
  expiresInMinutes?: number;
  firstName?: string;
};

export default function PasswordResetEmail({
  resetUrl,
  expiresInMinutes = 60,
  firstName,
}: PasswordResetEmailProps) {
  const greeting = firstName ? `Hi ${firstName},` : "Hello,";

  return (
    <Html lang="en">
      <Head />
      <Preview>Reset your TravelTourUp password</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-slate-100 font-sans">
          <Container className="mx-auto max-w-[600px] rounded-2xl bg-white px-8 py-10 shadow-sm">
            <Section>
              <Text className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">
                TravelTourUp
              </Text>
              <Heading className="m-0 text-2xl font-bold text-slate-900">Password reset</Heading>
              <Text className="mt-3 text-base leading-relaxed text-slate-600">
                {greeting} we received a request to reset the password for your TravelTourUp account. Click the
                button below to choose a new password. This link expires in {expiresInMinutes} minutes.
              </Text>
            </Section>
            <Section className="mt-8 text-center">
              <Button
                href={resetUrl}
                className="rounded-full bg-sky-600 px-8 py-3 text-sm font-semibold text-white no-underline"
              >
                Reset password
              </Button>
            </Section>
            <Section className="mt-6 rounded-lg bg-amber-50 px-4 py-3">
              <Text className="m-0 text-xs leading-relaxed text-amber-900">
                If you didn&apos;t ask for a reset, you can ignore this message — your password will stay the same.
              </Text>
            </Section>
            <Text className="mt-6 break-all text-xs text-slate-500">
              Link not working? Copy and paste this URL into your browser:
              <br />
              <Link href={resetUrl} className="text-sky-600">
                {resetUrl}
              </Link>
            </Text>
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
