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
  if (res.status === 429)                             return ["rate_limit",    data.message ?? "AI is busy. Trying backup systems automatically..."];
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

    console.log("[useAnalysis] Starting analysis");
    console.log("[useAnalysis] Chat length:", chatData.length);
    console.log("[useAnalysis] Participants:", stats.participants);
    console.log("[useAnalysis] Total messages:", stats.totalMessages);

    // Guard: empty chat data means the upload flow didn't complete
    if (!chatData || chatData.trim().length < 50) {
      onErrorRef.current("api_failed", "Chat data is missing. Please re-upload and try again.");
      return;
    }

    // Guard: no participants means parser failed silently
    if (!stats.participants || stats.participants.length === 0) {
      onErrorRef.current("api_failed", "No participants found in chat. Please check your export file.");
      return;
    }

    // Allow larger chats enough time to finish model inference.
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
        console.log("[useAnalysis] Response status:", res.status);

        // Parse the body — could be HTML on a Vercel 504 timeout
        let data: ApiResponse = {};
        try {
          data = (await res.json()) as ApiResponse;
        } catch {
          // Response body wasn't valid JSON (e.g. Vercel gateway timeout returns HTML)
          console.error("[useAnalysis] Response was not JSON. Status:", res.status);
          if (res.status === 504 || res.status === 502 || res.status === 524) {
            onErrorRef.current(
              "timeout",
              "Analysis timed out. Try selecting a shorter date range (last 3 days) and retry."
            );
          } else {
            onErrorRef.current(
              "api_failed",
              `Server returned status ${res.status}. Please try again.`
            );
          }
          return;
        }

        if (res.ok && data.success) {
          console.log("[useAnalysis] Analysis complete, saving to sessionStorage");
          sessionStorage.setItem("analysisResult", JSON.stringify(data.analysis));
          sessionStorage.setItem("chatStats",      JSON.stringify(data.metadata));
          sessionStorage.setItem("participants",   JSON.stringify(stats.participants));
          setApiDone(true);
        } else {
          console.error("[useAnalysis] API error response:", data);
          const [type, msg] = mapError(res, data);
          onErrorRef.current(type, msg);
        }
      })
      .catch((err: Error) => {
        clearTimeout(timer);
        console.error("[useAnalysis] Fetch error:", err.name, err.message);
        if (err.name === "AbortError") {
          onErrorRef.current(
            "timeout",
            "Analysis is taking longer than expected. Please retry, or select a shorter date range."
          );
        } else {
          // Only genuine network failures reach here now
          onErrorRef.current(
            "network_error",
            "Could not reach the server. Please check your internet connection and try again."
          );
        }
      });

    return () => { controller.abort(); clearTimeout(timer); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryCount]); // re-runs on retry; reads from sessionStorage so no other deps needed

  return { apiDone, retry };
}
