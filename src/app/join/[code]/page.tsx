"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useSession, signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Loader2, Users, Zap } from "lucide-react";
import type { AnalysisMetadata, AnalysisResult } from "@/types/analysis";

interface JoinResponse {
  success?: boolean;
  error?: string;
  details?: string;
  projectId?: string;
  projectName?: string;
  analysisResult?: AnalysisResult;
  chatStats?: AnalysisMetadata;
  participants?: string[];
}

interface JoinPageProps {
  params: { code: string };
}

function prettyDate(iso: string | undefined) {
  if (!iso) return "Recently";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Recently";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function JoinPage({ params }: JoinPageProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const code = useMemo(() => decodeURIComponent(params.code || "").toUpperCase(), [params.code]);

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [project, setProject] = useState<{ id: string; name: string; participants: number; tasks: number; createdAt?: string } | null>(null);

  useEffect(() => {
    const preload = async () => {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/projects/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode: code }),
      });
      const data = (await res.json()) as JoinResponse;
      if (!res.ok || !data.success || !data.projectId) {
        setError(data.error || "Could not find this invite.");
        setLoading(false);
        return;
      }
      const participantCount = data.participants?.length ?? 0;
      const taskCount = data.analysisResult?.tasks.length ?? 0;
      const createdAt = data.chatStats?.analyzedAt;
      setProject({ id: data.projectId, name: data.projectName || "Shared Project", participants: participantCount, tasks: taskCount, createdAt });
      setLoading(false);
    };
    void preload();
  }, [code]);

  const handleJoin = async () => {
    if (!project) return;
    if (!session?.user && !name.trim()) {
      setError("Please enter your name as it appears in chat.");
      return;
    }

    setJoining(true);
    setError(null);

    const res = await fetch("/api/projects/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        inviteCode: code,
        userName: session?.user?.name || name.trim(),
        userEmail: session?.user?.email || "",
      }),
    });

    const data = (await res.json()) as JoinResponse;
    if (!res.ok || !data.success || !data.projectId || !data.analysisResult) {
      setError(data.error || "Unable to join this project.");
      setJoining(false);
      return;
    }

    sessionStorage.setItem("analysisResult", JSON.stringify(data.analysisResult));
    sessionStorage.setItem("chatStats", JSON.stringify(data.chatStats || {}));
    sessionStorage.setItem("participants", JSON.stringify(data.participants || []));
    sessionStorage.setItem("inviteCode", code);
    sessionStorage.setItem("projectId", data.projectId);

    const member = session?.user?.name || name.trim();
    sessionStorage.setItem("memberName", member);
    router.push(`/dashboard?project=${data.projectId}&member=${encodeURIComponent(member)}`);
  };

  return (
    <main className="min-h-screen px-4 flex items-center justify-center" style={{ background: "#060B0F" }}>
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4 }} className="w-full max-w-[480px] rounded-[20px] p-8" style={{ background: "#0C1419", border: "1px solid #1A2E3A", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
        <div className="flex items-center gap-2.5 mb-6"><div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)" }}><Zap size={16} style={{ color: "#060B0F" }} /></div><p className="text-white font-semibold">ClearGroup</p></div>
        <h1 className="text-white font-bold" style={{ fontSize: 28 }}>You&apos;ve been invited!</h1>
        <p className="mt-1 mb-6" style={{ color: "#7A9BAD" }}>Join your team&apos;s project on ClearGroup</p>

        <div className="rounded-xl p-4 mb-6" style={{ background: "#111E26", border: "1px solid #1A2E3A" }}>
          {loading ? (
            <div className="flex items-center gap-2" style={{ color: "#7A9BAD" }}><Loader2 size={16} className="animate-spin" /> Loading project details...</div>
          ) : project ? (
            <>
              <p className="text-white font-semibold">{project.name}</p>
              <div className="mt-2 text-sm" style={{ color: "#7A9BAD" }}>
                <p>{project.participants} participants</p>
                <p>{project.tasks} tasks found</p>
                <p>Created {prettyDate(project.createdAt)}</p>
              </div>
            </>
          ) : (
            <p style={{ color: "#FF6B6B" }}>Project not found</p>
          )}
        </div>

        {session?.user ? (
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 rounded-full overflow-hidden" style={{ background: "#1A2E3A" }}>{session.user.image ? <Image src={session.user.image} alt={session.user.name || "Member"} width={40} height={40} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Users size={16} style={{ color: "#6366F1" }} /></div>}</div><div><p className="text-white font-medium">{session.user.name}</p><p className="text-xs" style={{ color: "#7A9BAD" }}>{session.user.email}</p></div></div>
            <button onClick={() => void handleJoin()} disabled={joining || loading || !project} className="w-full py-3 rounded-lg font-semibold" style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)", color: "#060B0F", opacity: joining ? 0.7 : 1 }}>{joining ? "Joining..." : `Join as ${session.user.name || "Member"}`}</button>
          </div>
        ) : (
          <div className="mb-4">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Rahul, Priya..." className="w-full rounded-lg px-4 py-3 mb-2 text-sm outline-none" style={{ background: "#111E26", border: "1px solid #1A2E3A", color: "#E8F4F8" }} />
            <p className="text-xs mb-3" style={{ color: "#7A9BAD" }}>Your name (as it appears in the chat)</p>
            <button onClick={() => void handleJoin()} disabled={joining || loading || !project} className="w-full py-3 rounded-lg font-semibold" style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)", color: "#060B0F", opacity: joining ? 0.7 : 1 }}>{joining ? "Joining..." : "Join Project ?"}</button>
            <button onClick={() => signIn("google", { callbackUrl: `/join/${code}` })} className="w-full mt-3 py-3 rounded-lg font-medium" style={{ background: "#111E26", border: "1px solid #1A2E3A", color: "#E8F4F8" }}>Sign in with Google instead</button>
          </div>
        )}

        {error && <p className="text-sm" style={{ color: "#FF6B6B" }}>{error}</p>}
      </motion.div>
    </main>
  );
}
