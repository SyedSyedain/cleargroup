import UploadPageClient from "@/components/upload/UploadPageClient";

export const metadata = {
  title: "Upload your chat — ClearGroup",
  description: "Upload your WhatsApp group export and get an instant project breakdown.",
};

// Server component — just exports metadata and delegates to client shell
export default function UploadPage() {
  return <UploadPageClient />;
}
