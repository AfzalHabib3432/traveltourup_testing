import BookingLayoutClient from "./BookingLayoutClient";

export default function BookingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <BookingLayoutClient>{children}</BookingLayoutClient>;
}
