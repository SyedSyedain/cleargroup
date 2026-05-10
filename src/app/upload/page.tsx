import UploadNavbar      from "@/components/upload/UploadNavbar";
import InstructionsPanel from "@/components/upload/InstructionsPanel";
import UploadZone        from "@/components/upload/UploadZone";

export const metadata = {
  title: "Upload your chat — ClearGroup",
  description: "Upload your WhatsApp group export and get an instant project breakdown.",
};

// Standalone upload page — no landing navbar, no footer, own minimal chrome
export default function UploadPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#060B0F" }}>
      <UploadNavbar />

      {/* Two-column layout: 45% instructions / 55% upload zone */}
      <div className="flex-1 w-full max-w-[1200px] mx-auto px-6 sm:px-10 lg:px-16 py-10 md:py-14">
        <div className="flex flex-col md:flex-row gap-10 lg:gap-16 md:items-start">

          {/* Left — Instructions Panel (45%) */}
          <div className="w-full md:w-[45%] shrink-0">
            <InstructionsPanel />
          </div>

          {/* Right — Upload Zone (55%) */}
          <div className="w-full md:flex-1 md:sticky md:top-8">
            <UploadZone />
          </div>

        </div>
      </div>
    </div>
  );
}
