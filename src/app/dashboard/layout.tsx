import type { ReactNode } from "react";
import Sidebar      from "@/components/dashboard/Sidebar";
import MobileTabBar from "@/components/dashboard/MobileTabBar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex" style={{ minHeight: "100vh", background: "#060810" }}>

      {/* Desktop sidebar — hidden on mobile */}
      <div className="hidden md:flex shrink-0" style={{ width: 240 }}>
        <Sidebar />
      </div>

      {/* Main scrollable content */}
      <main
        className="flex-1 overflow-y-auto"
        style={{ height: "100vh", background: "#060810" }}
      >
        {children}
      </main>

      {/* Mobile bottom tab bar — md:hidden handled inside component */}
      <MobileTabBar />

    </div>
  );
}
