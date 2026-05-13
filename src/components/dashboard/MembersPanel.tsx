"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { DbProjectMember } from "@/types/database";

interface Props {
  projectId: string | null;
  ownerId: string | null;
}

function joinedAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.max(1, Math.floor(diff / 60000));
  if (mins < 60) return `Joined ${mins} mins ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Joined ${hrs}h ago`;
  return `Joined ${Math.floor(hrs / 24)}d ago`;
}

export default function MembersPanel({ projectId, ownerId }: Props) {
  const { data: session } = useSession();
  const [members, setMembers] = useState<DbProjectMember[]>([]);

  useEffect(() => {
    if (!projectId) return;

    supabase
      .from("project_members")
      .select("*")
      .eq("project_id", projectId)
      .then(({ data }) => {
        if (data) setMembers(data as DbProjectMember[]);
      });

    const channel = supabase
      .channel("members-" + projectId)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "project_members",
          filter: "project_id=eq." + projectId,
        },
        (payload) => {
          const row = payload.new as DbProjectMember;
          setMembers((prev) => {
            if (prev.some((m) => m.id === row.id)) return prev;
            return [...prev, row];
          });
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [projectId]);

  const meEmail = session?.user?.email ?? "";
  const sortedMembers = useMemo(() => [...members].sort((a, b) => new Date(a.joined_at).getTime() - new Date(b.joined_at).getTime()), [members]);

  return (
    <div className="rounded-xl p-5" style={{ background: "#0C1419", border: "1px solid #1A2E3A" }}>
      <div className="flex items-center gap-2 mb-4"><Users size={18} style={{ color: "#6366F1" }} /><h3 className="text-white font-semibold">Team Members</h3></div>

      {sortedMembers.length === 0 ? (
        <div className="rounded-lg p-4 text-sm" style={{ background: "#111E26", color: "#7A9BAD", border: "1px dashed #1A2E3A" }}>
          Share the invite code to add team members ?
        </div>
      ) : (
        <div className="space-y-3">
          {sortedMembers.map((member, index) => {
            const isOwner = Boolean(ownerId) && member.user_id === ownerId;
            const isMe = meEmail.length > 0 && member.user_email === meEmail;
            return (
              <motion.div key={member.id} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.25, delay: index * 0.05 }} className="rounded-lg px-3 py-2.5" style={{ background: "#111E26", border: "1px solid #1A2E3A" }}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-semibold" style={{ background: "#6366F1", color: "#060B0F", fontSize: 12 }}>{member.user_name.slice(0, 1).toUpperCase()}</div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-white text-sm font-medium truncate">{member.user_name}</p>
                        {isOwner && <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "#FFB34722", color: "#FFB347", border: "1px solid #FFB34740" }}>Owner</span>}
                        {isMe && <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "#6366F122", color: "#6366F1", border: "1px solid #6366F140" }}>You</span>}
                      </div>
                      <p className="text-xs truncate" style={{ color: "#7A9BAD" }}>{member.user_email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1"><span className="inline-block w-2 h-2 rounded-full" style={{ background: "#8B5CF6" }} /><span className="text-[10px]" style={{ color: "#7A9BAD" }}>Online</span></div>
                    <p className="text-[10px]" style={{ color: "#7A9BAD" }}>{joinedAgo(member.joined_at)}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
