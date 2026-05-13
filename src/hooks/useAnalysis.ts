"use client";

/**
 * Reads prepared chat data from sessionStorage, calls /api/analyze,
 * stores the result, and signals completion or a typed error.
 */
import { useState, useEffect, useRef, useCallback } from "react";
import type { AnalysisResult, AnalysisMetadata, ErrorType } from "@/types/analysis";

interface StoredStats {
  totalMessages: number;
  participants:  string[];
  dateRange:     { start: string; end: string };
}

interface ApiResponse {
  success?:  boolean;
  analysis?: AnalysisResult;
  metadata?: AnalysisMetadata;
  error?:    string;
  message?:  string;
  details?:  string;
}

type OnError = (type: ErrorType, message: string) => void;

function mapError(res: Response, data: ApiResponse): [ErrorType, string] {
  if (res.status === 429)                             return ["rate_limit",    data.message ?? "Too many requests. Please wait a minute and try again."];
  if (res.status === 400 && data.error === "Chat too short") return ["chat_too_short", data.message ?? "Not enough messages to analyze."];
  return ["api_failed", data.details ?? data.message ?? data.error ?? "Analysis failed. Please try again."];
}

export function useAnalysis(onError: OnError) {
  const [apiDone,     setApiDone]     = useState(false);
  const [retryCount,  setRetryCount]  = useState(0);
  const onErrorRef = useRef(onError);
  useEffect(() => { onErrorRef.current = onError; }, [onError]);

  const retry = useCallback(() => {
    setApiDone(false);
    setRetryCount((c) => c + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const chatData = sessionStorage.getItem("chatData") ?? "";
    let stats: StoredStats = { totalMessages: 0, participants: [], dateRange: { start: "", end: "" } };
    try {
      const raw = sessionStorage.getItem("chatStats");
      if (raw) stats = JSON.parse(raw) as StoredStats;
    } catch { /* keep defaults */ }

    // Allow larger chats enough time to finish model inference.
    // 120-300s window based on selected message volume.
    const timeoutMs = Math.min(
      300_000,
      Math.max(120_000, 90_000 + stats.totalMessages * 500)
    );
    const timer = setTimeout(() => controller.abort(), timeoutMs);

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
          const [type, msg] = mapError(res, data);
          onErrorRef.current(type, msg);
        }
      })
      .catch((err: Error) => {
        clearTimeout(timer);
        if (err.name === "AbortError") {
          onErrorRef.current(
            "timeout",
            "Analysis is taking longer than expected. Please wait and retry, or reduce the date range."
          );
        } else {
          onErrorRef.current("network_error", "Connection failed. Check your internet and try again.");
        }
      });

    return () => { controller.abort(); clearTimeout(timer); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryCount]); // re-runs on retry; reads from sessionStorage so no other deps needed

  return { apiDone, retry };
}
