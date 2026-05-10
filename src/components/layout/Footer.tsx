import Link from "next/link";
import { Zap } from "lucide-react";

const navLinks = [
  { label: "Features",     href: "#features"     },
  { label: "How it works", href: "#how-it-works" },
  { label: "Privacy",      href: "#"             },
  { label: "Contact",      href: "#"             },
];

// Site footer — logo + nav links + tagline + copyright
export default function Footer() {
  return (
    <footer className="bg-cg-bg border-t border-cg-border" role="contentinfo">
      <div className="max-w-container mx-auto px-6 pt-12 pb-6">

        {/* Three-column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mb-10">

          {/* Left — logo + tagline */}
          <div>
            <Link href="/" className="inline-flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cg-primary to-cg-secondary flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4 text-white fill-white" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-cg-text font-semibold text-base leading-none">ClearGroup</span>
                <span className="text-cg-muted text-[11px] leading-none">AI Project Intelligence</span>
              </div>
            </Link>
            <p className="text-cg-muted text-small leading-relaxed max-w-[220px]">
              Turn WhatsApp group chaos into a clear project dashboard — in 30&nbsp;seconds.
            </p>
          </div>

          {/* Center — nav links */}
          <div className="flex flex-col gap-3 sm:items-center">
            <p className="text-cg-muted text-[11px] font-semibold uppercase tracking-wider mb-1">
              Navigation
            </p>
            {navLinks.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="text-cg-muted text-small hover:text-cg-text transition-colors duration-200 w-fit"
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Right — tagline */}
          <div className="sm:text-right">
            <p className="text-cg-muted text-[11px] font-semibold uppercase tracking-wider mb-3">
              Built for
            </p>
            <p className="text-cg-muted text-small leading-relaxed">
              Made with ❤️ for<br />
              Indian college students
            </p>
          </div>

        </div>

        {/* Bottom copyright bar */}
        <div className="border-t border-cg-border pt-5 flex flex-col sm:flex-row items-center justify-center gap-1">
          <p className="text-cg-muted text-[12px] text-center">
            © 2026 ClearGroup &bull; Your chats are never stored or shared
          </p>
        </div>

      </div>
    </footer>
  );
}
