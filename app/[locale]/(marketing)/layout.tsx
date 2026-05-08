import Navbar from "@/components/shared/Navbar";
import Breadcrumb from "@/components/shared/Breadcrumb";
import Footer from "@/components/shared/Footer";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
        <Navbar />
        <Breadcrumb />
        {children}
        <Footer />
    </>
  );
}
