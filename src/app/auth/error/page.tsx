"use client";

import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function AuthErrorPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4" style={{ background: "#060B0F" }}>
      <div className="w-full max-w-md rounded-2xl p-8" style={{ background: "#0C1419", border: "1px solid #1A2E3A" }}>
        <div className="flex items-center gap-2 mb-3"><AlertCircle size={18} style={{ color: "#FF6B6B" }} /><h1 className="text-white font-semibold text-xl">Authentication failed</h1></div>
        <p className="text-sm mb-6" style={{ color: "#7A9BAD" }}>We could not complete Google sign in. Please try again.</p>
        <Link href="/auth/signin" className="inline-flex px-4 py-2 rounded-lg font-medium" style={{ background: "#6366F1", color: "#060B0F" }}>
          Try again
        </Link>
      </div>
    </main>
  );
}
