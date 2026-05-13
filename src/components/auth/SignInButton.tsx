"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { signIn, signOut, useSession } from "next-auth/react";
import { ChevronDown, User } from "lucide-react";

interface Props {
  compact?: boolean;
}

export default function SignInButton({ compact = false }: Props) {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  if (status === "loading") {
    return <div className="h-10 w-28 rounded-lg" style={{ background: "#111E26", border: "1px solid #1A2E3A" }} />;
  }

  if (!session?.user) {
    return (
      <button
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        className="rounded-lg font-medium transition-colors"
        style={{
          padding: compact ? "8px 12px" : "10px 14px",
          background: "transparent",
          border: "1px solid #1A2E3A",
          color: "#6366F1",
          fontSize: compact ? 13 : 14,
        }}
      >
        Sign in
      </button>
    );
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-lg font-medium flex items-center gap-2"
        style={{
          padding: compact ? "7px 10px" : "8px 12px",
          background: "#111E26",
          border: "1px solid #1A2E3A",
          color: "#E8F4F8",
          fontSize: compact ? 13 : 14,
        }}
      >
        {session.user.image ? (
          <Image
            src={session.user.image}
            alt={session.user.name ?? "User"}
            width={28}
            height={28}
            className="w-7 h-7 rounded-full object-cover"
          />
        ) : (
          <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "#6366F1", color: "#060B0F" }}>
            <User size={14} />
          </div>
        )}
        <span className="max-w-[120px] truncate">{session.user.name ?? "User"}</span>
        <ChevronDown size={14} style={{ color: "#7A9BAD" }} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl p-2" style={{ background: "#0C1419", border: "1px solid #1A2E3A", boxShadow: "0 16px 32px rgba(0,0,0,0.35)" }}>
          <p className="px-3 py-2 text-xs break-all" style={{ color: "#7A9BAD" }}>{session.user.email}</p>
          <Link href="/dashboard" className="block px-3 py-2 rounded-lg text-sm" style={{ color: "#E8F4F8" }} onClick={() => setOpen(false)}>
            My Projects
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full text-left px-3 py-2 rounded-lg text-sm"
            style={{ color: "#FF6B6B" }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
