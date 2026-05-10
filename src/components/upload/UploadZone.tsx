"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import UploadZoneIdle       from "./UploadZoneIdle";
import UploadZoneUploaded   from "./UploadZoneUploaded";
import UploadZoneProcessing from "./UploadZoneProcessing";
import { parseWhatsAppChat }   from "@/lib/parser";
import { extractChatFromFile } from "@/lib/fileExtractor";
import { SAMPLE_CHAT }         from "@/lib/sampleChat";
import type { ParsedChat }     from "@/types/chat";

export type UploadState = "idle" | "dragging" | "uploaded" | "processing";

interface Props {
  onStepChange?: (step: 1 | 2 | 3) => void;
}

export default function UploadZone({ onStepChange }: Props) {
  const [state,      setState]      = useState<UploadState>("idle");
  const [file,       setFile]       = useState<File | null>(null);
  const [parsedChat, setParsedChat] = useState<ParsedChat | null>(null);
  const [error,      setError]      = useState("");
  const [shake,      setShake]      = useState(false);
  const inputRef  = useRef<HTMLInputElement>(null);
  const dragCount = useRef(0);

  const setStateAndStep = useCallback((newState: UploadState) => {
    setState(newState);
    if (onStepChange) {
      const step = newState === "uploaded" ? 2 : newState === "processing" ? 3 : 1;
      onStepChange(step as 1 | 2 | 3);
    }
  }, [onStepChange]);

  const triggerError = useCallback((msg: string) => {
    setError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 500);
  }, []);

  const accept = useCallback(async (f: File) => {
    const name = f.name.toLowerCase();
    if (!name.endsWith(".txt") && !name.endsWith(".zip")) {
      triggerError("Please upload a WhatsApp export file (.txt or .zip format)");
      return;
    }
    if (f.size > 50 * 1024 * 1024) {
      triggerError("File too large. Maximum 50MB.");
      return;
    }
    try {
      const text   = await extractChatFromFile(f);
      const parsed = parseWhatsAppChat(text);
      setParsedChat(parsed);
      setFile(f);
      setError("");
      setStateAndStep("uploaded");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      // Surface specific extraction errors; use generic message for parse failures
      const isExtractError = msg.startsWith("Could not find") || msg.startsWith("Could not open") || msg.startsWith("Please upload");
      triggerError(isExtractError ? msg
        : "This doesn't look like a WhatsApp export. Please export your chat from WhatsApp and try again.");
    }
  }, [triggerError, setStateAndStep]);

  const loadSample = useCallback(() => {
    const parsed   = parseWhatsAppChat(SAMPLE_CHAT);
    const blob     = new Blob([SAMPLE_CHAT], { type: "text/plain" });
    const fakeFile = new File([blob], "WhatsApp Chat - Project Alpha.txt", { type: "text/plain" });
    setParsedChat(parsed);
    setFile(fakeFile);
    setError("");
    setStateAndStep("uploaded");
  }, [setStateAndStep]);

  const onDragEnter = (e: React.DragEvent) => { e.preventDefault(); dragCount.current++; setState("dragging"); };
  const onDragOver  = (e: React.DragEvent) => { e.preventDefault(); };
  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (--dragCount.current === 0) setState("idle");
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); dragCount.current = 0; setState("idle");
    const f = e.dataTransfer.files[0];
    if (f) accept(f);
  };
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) accept(f);
  };
  const onBrowse  = useCallback(() => inputRef.current?.click(), []);
  const onRemove  = () => {
    setFile(null); setParsedChat(null); setError("");
    setStateAndStep("idle");
    if (inputRef.current) inputRef.current.value = "";
  };
  const onAnalyze = () => setStateAndStep("processing");

  if (state === "processing")                        return <UploadZoneProcessing />;
  if (state === "uploaded" && file && parsedChat)    return (
    <UploadZoneUploaded file={file} parsedChat={parsedChat} onRemove={onRemove} onAnalyze={onAnalyze} />
  );

  return (
    <>
      <input ref={inputRef} type="file" accept=".txt,.zip" className="hidden" onChange={onFileChange} />
      <motion.div
        animate={shake ? { x: [0, -10, 10, -10, 10, 0] } : { x: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <UploadZoneIdle
          isDragging={state === "dragging"}
          onDragEnter={onDragEnter} onDragOver={onDragOver}
          onDragLeave={onDragLeave} onDrop={onDrop}
          onClick={onBrowse}
          onLoadSample={loadSample}
          error={error}
        />
      </motion.div>
    </>
  );
}
