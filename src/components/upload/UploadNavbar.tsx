import Link from "next/link";
import { Zap } from "lucide-react";
import SignInButton from "@/components/auth/SignInButton";

// Minimal 56px navbar for the upload flow — no landing nav clutter
export default function UploadNavbar() {
  return (
    <nav
      className="h-14 flex items-center justify-between px-6 shrink-0"
      style={{ background: "#060B0F", borderBottom: "1px solid #1A2E3A" }}
    >
      {/* Logo — links back to landing page */}
      <Link href="/" className="inline-flex items-center gap-2.5 group">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cg-primary to-cg-secondary flex items-center justify-center shrink-0">
          <Zap className="w-3.5 h-3.5 text-white fill-white" />
        </div>
        <span className="text-cg-text font-semibold text-[15px] group-hover:text-white transition-colors duration-150">
          ClearGroup
        </span>
      </Link>

      {/* Sign in — sea green text button */}
      <SignInButton compact />
    </nav>
  );
}
