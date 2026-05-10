"use client";

import { useState } from "react";
import UploadNavbar      from "@/components/upload/UploadNavbar";
import InstructionsPanel from "@/components/upload/InstructionsPanel";
import UploadZone        from "@/components/upload/UploadZone";

export default function UploadPageClient() {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#060B0F" }}>
      <UploadNavbar />

      <div className="flex-1 w-full max-w-[1200px] mx-auto px-6 sm:px-10 lg:px-16 py-10 md:py-14">
        <div className="flex flex-col md:flex-row gap-10 lg:gap-16 md:items-start">

          {/* Left — Instructions Panel (45%) */}
          <div className="w-full md:w-[45%] shrink-0">
            <InstructionsPanel step={step} />
          </div>

          {/* Right — Upload Zone (55%) */}
          <div className="w-full md:flex-1 md:sticky md:top-8">
            <UploadZone onStepChange={setStep} />
          </div>

        </div>
      </div>
    </div>
  );
}
