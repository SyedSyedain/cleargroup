"use client";

/**
 * Reads the prepared chat data from sessionStorage, calls /api/analyze,
 * stores the result back into sessionStorage, and signals completion.
 * The 30-second AbortController covers the timeout requirement.
 */
import { useState, useEffect, useRef } from "react";

interface StoredStats {
  totalMessages: number;
  participants:  string[];
  dateRange:     { start: string; end: string };
}

interface ApiResponse {
  success?:  boolean;
  analysis?: unknown;
  metadata?: unknown;
  error?:    string;
}

export function useAnalysis(onError: (msg: string) => void) {
  const [apiDone, setApiDone] = useState(false);
  // Stable ref avoids stale-closure issues without adding onError to the dep array
  const onErrorRef = useRef(onError);
  useEffect(() => { onErrorRef.current = onError; }, [onError]);

  useEffect(() => {
    const controller = new AbortController();
    const timer      = setTimeout(() => controller.abort(), 30_000);

    // Data was written to sessionStorage by UploadZoneUploaded.handleAnalyze()
    const chatData = sessionStorage.getItem("chatData") ?? "";
    let stats: StoredStats = { totalMessages: 0, participants: [], dateRange: { start: "", end: "" } };
    try {
      const raw = sessionStorage.getItem("chatStats");
      if (raw) stats = JSON.parse(raw) as StoredStats;
    } catch { /* keep defaults */ }

    fetch("/api/analyze", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      signal:  controller.signal,
      body: JSON.stringify({
        formattedChat: chatData,
        stats: {
          totalMessages: stats.totalMessages,
          participants:  stats.participants,
          dateRange:     stats.dateRange,
        },
      }),
    })
      .then(async (res) => {
        clearTimeout(timer);
        const data = (await res.json()) as ApiResponse;
        if (res.ok && data.success) {
          sessionStorage.setItem("analysisResult", JSON.stringify(data.analysis));
          sessionStorage.setItem("chatStats",      JSON.stringify(data.metadata));
          sessionStorage.setItem("participants",   JSON.stringify(stats.participants));
          setApiDone(true);
        } else {
          onErrorRef.current(data.error ?? "Analysis failed. Please try again.");
        }
      })
      .catch((err: Error) => {
        clearTimeout(timer);
        onErrorRef.current(
          err.name === "AbortError"
            ? "Analysis is taking too long. Please try with a shorter date range."
            : "Analysis failed. Please try again."
        );
      });

    return () => { controller.abort(); clearTimeout(timer); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally runs once on mount — reads from sessionStorage, not React state

  return { apiDone };
}
