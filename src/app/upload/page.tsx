import UploadPageClient from "@/components/upload/UploadPageClient";
import PageTransition from "@/components/ui/PageTransition";

export const metadata = {
  title: "Upload your chat - ClearGroup",
  description: "Upload your WhatsApp group export and get an instant project breakdown.",
};

export default function UploadPage() {
  return (
    <PageTransition>
      <UploadPageClient />
    </PageTransition>
  );
}
