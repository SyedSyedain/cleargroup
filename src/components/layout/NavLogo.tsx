import Link from "next/link";
import { Zap } from "lucide-react";

// Brand logo — gradient icon square, app name, and tagline
export default function NavLogo() {
  return (
    <Link href="/" className="flex items-center gap-3 shrink-0">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cg-primary to-cg-secondary flex items-center justify-center shrink-0">
        <Zap className="w-4 h-4 text-white fill-white" />
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-cg-text font-semibold text-lg leading-none">
          ClearGroup
        </span>
        <span className="text-cg-muted leading-none text-[11px]">
          AI Project Intelligence
        </span>
      </div>
    </Link>
  );
}
