import Link from "next/link";
import { defaultLocale } from "@/i18n/routing";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md mx-auto p-8">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-foreground mb-4">
          Page Not Found
        </h2>
        <p className="text-muted-foreground mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href={`/${defaultLocale}`}
          className="px-6 py-3 bg-primary hover:bg-primary-600 text-primary-foreground rounded-lg transition-colors inline-block font-medium"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
