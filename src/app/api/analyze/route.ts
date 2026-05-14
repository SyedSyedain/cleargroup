import { NextRequest, NextResponse } from "next/server";
import { buildFallbackAnalysis } from "@/lib/fallbackAnalysis";
import type { AnalysisMetadata } from "@/types/analysis";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

interface RequestStats {
  totalMessages: number;
  participants: string[];
  dateRange: { start: string; end: string };
}

interface RequestBody {
  formattedChat: string;
  stats: RequestStats;
}

export async function POST(req: NextRequest) {
  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { formattedChat, stats } = body;
  if (!formattedChat?.trim()) {
    return NextResponse.json({ error: "formattedChat is required" }, { status: 400 });
  }

  const metadata: AnalysisMetadata = {
    messagesAnalyzed: stats?.totalMessages ?? 0,
    participants: stats?.participants ?? [],
    analyzedAt: new Date().toISOString(),
  };

  const analysis = buildFallbackAnalysis(formattedChat, stats?.participants ?? []);
  return NextResponse.json({ success: true, analysis, metadata, fallback: true });
}
