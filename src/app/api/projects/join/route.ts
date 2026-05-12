import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { supabase } from "@/lib/supabase";
import { authOptions } from "@/lib/auth";
import type { AnalysisMetadata, AnalysisResult } from "@/types/analysis";

interface JoinProjectBody {
  inviteCode?: string;
  userName?: string;
  userEmail?: string;
}

interface ProjectJoinRow {
  id: string;
  name: string;
  analysis_result: AnalysisResult;
  chat_stats: AnalysisMetadata;
  participants: string[];
  invite_code: string;
}

export async function POST(request: NextRequest) {
  try {
    const { inviteCode, userName, userEmail } = (await request.json()) as JoinProjectBody;

    if (!inviteCode) {
      return NextResponse.json({ error: "Invite code required" }, { status: 400 });
    }

    const { data: project, error } = await supabase
      .from("projects")
      .select("id, name, analysis_result, chat_stats, participants, invite_code")
      .eq("invite_code", inviteCode.toUpperCase().trim())
      .maybeSingle<ProjectJoinRow>();

    if (error || !project) {
      return NextResponse.json({ error: "Invalid invite code. Project not found." }, { status: 404 });
    }

    const session = await getServerSession(authOptions);

    if (session?.user?.email) {
      const { data: user } = await supabase
        .from("users")
        .select("id")
        .eq("email", session.user.email)
        .maybeSingle();

      if (user) {
        await supabase.from("project_members").upsert({
          project_id: project.id,
          user_id: user.id,
          user_name: session.user.name || userName || "Member",
          user_email: session.user.email || userEmail || "",
        });
      }
    }

    return NextResponse.json({
      success: true,
      projectId: project.id,
      projectName: project.name,
      analysisResult: project.analysis_result,
      chatStats: project.chat_stats,
      participants: project.participants,
      inviteCode: project.invite_code,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Failed to join project", details: message }, { status: 500 });
  }
}
