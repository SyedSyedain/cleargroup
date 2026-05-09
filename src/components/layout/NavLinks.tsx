"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "@/constants";
import { cn } from "@/lib/utils";

// Desktop center navigation — hidden on mobile, shows active dot on matching route
export default function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex items-center gap-8">
      {NAV_LINKS.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "relative text-sm font-medium transition-colors duration-200",
              isActive
                ? "text-cg-text"
                : "text-cg-muted hover:text-cg-text"
            )}
          >
            {link.label}
            {isActive && (
              <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-cg-primary" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
