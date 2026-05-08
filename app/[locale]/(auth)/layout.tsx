/**
 * Minimal layout for authentication pages (login, signup).
 * No Navbar or Footer — focused experience for sign-in/sign-up flows.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-[100dvh] max-h-[100dvh] overflow-hidden">
      {children}
    </div>
  );
}
