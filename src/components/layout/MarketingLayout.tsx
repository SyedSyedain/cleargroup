import AnnouncementBanner from "./AnnouncementBanner";
import Navbar             from "./Navbar";
import Footer             from "./Footer";

// Wraps all landing/marketing pages — banner + nav + footer
// Upload and app pages import this layout selectively instead
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AnnouncementBanner />
      <Navbar />
      <main className="pt-16">{children}</main>
      <Footer />
    </>
  );
}
