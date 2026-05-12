import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { supabase } from "@/lib/supabase";
import { authOptions } from "@/lib/auth";
import type { AnalysisMetadata, AnalysisResult, Task } from "@/types/analysis";

interface CreateProjectBody {
  analysisResult?: AnalysisResult;
  chatStats?: AnalysisMetadata;
  participants?: string[];
  projectName?: string;
}

interface ProjectRow {
  id: string;
  invite_code: string;
}

function generateInviteCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

async function getUniqueInviteCode() {
  let inviteCode = generateInviteCode();
  let isUnique = false;

  while (!isUnique) {
    const { data } = await supabase
      .from("projects")
      .select("id")
      .eq("invite_code", inviteCode)
      .maybeSingle();

    if (!data) {
      isUnique = true;
    } else {
      inviteCode = generateInviteCode();
    }
  }

  return inviteCode;
}

function mapTasksForInsert(projectId: string, tasks: Task[]) {
  return tasks.map((task) => ({
    project_id: projectId,
    task_id: task.id,
    assignee: task.assignee,
    task: task.task,
    status: task.status,
    deadline: task.deadline,
  }));
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateProjectBody;
    const { analysisResult, chatStats, participants, projectName } = body;

    if (!analysisResult) {
      return NextResponse.json({ error: "Analysis result required" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const inviteCode = await getUniqueInviteCode();

    const { data: project, error } = await supabase
      .from("projects")
      .insert({
        name: projectName || "My Project",
        invite_code: inviteCode,
        owner_id: null,
        analysis_result: analysisResult,
        chat_stats: chatStats || {},
        participants: participants || [],
      })
      .select("id, invite_code")
      .single<ProjectRow>();

    if (error || !project) throw error || new Error("Failed to create project");

    if (session?.user?.email) {
      const { data: user } = await supabase
        .from("users")
        .select("id")
        .eq("email", session.user.email)
        .maybeSingle();

      if (user) {
        await supabase.from("projects").update({ owner_id: user.id }).eq("id", project.id);

        await supabase.from("project_members").upsert({
          project_id: project.id,
          user_id: user.id,
          user_name: session.user.name || "Owner",
          user_email: session.user.email,
        });
      }
    }

    if (analysisResult.tasks.length > 0) {
      await supabase.from("tasks").insert(mapTasksForInsert(project.id, analysisResult.tasks));
    }

    return NextResponse.json({
      success: true,
      projectId: project.id,
      inviteCode: project.invite_code,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Create project error:", error);
    return NextResponse.json({ error: "Failed to create project", details: message }, { status: 500 });
  }
}
