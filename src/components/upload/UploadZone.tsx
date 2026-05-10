"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import UploadZoneIdle       from "./UploadZoneIdle";
import UploadZoneUploaded   from "./UploadZoneUploaded";
import UploadZoneProcessing from "./UploadZoneProcessing";

export type UploadState = "idle" | "dragging" | "uploaded" | "processing";

export default function UploadZone() {
  const [state, setState] = useState<UploadState>("idle");
  const [file,  setFile]  = useState<File | null>(null);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const inputRef          = useRef<HTMLInputElement>(null);
  const dragCount         = useRef(0); // prevents flicker when hovering child elements

  const accept = useCallback((f: File) => {
    if (!f.name.toLowerCase().endsWith(".txt")) {
      setError("Please upload a .txt file exported from WhatsApp");
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    setError("");
    setFile(f);
    setState("uploaded");
  }, []);

  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCount.current++;
    setState("dragging");
  };
  const onDragOver  = (e: React.DragEvent) => { e.preventDefault(); };
  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (--dragCount.current === 0) setState("idle");
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragCount.current = 0;
    setState("idle");
    const f = e.dataTransfer.files[0];
    if (f) accept(f);
  };
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) accept(f);
  };
  const onBrowse  = useCallback(() => inputRef.current?.click(), []);
  const onRemove  = () => {
    setFile(null); setState("idle"); setError("");
    if (inputRef.current) inputRef.current.value = "";
  };
  const onAnalyze = () => setState("processing");

  if (state === "processing")             return <UploadZoneProcessing />;
  if (state === "uploaded" && file)       return <UploadZoneUploaded file={file} onRemove={onRemove} onAnalyze={onAnalyze} />;

  return (
    <>
      <input ref={inputRef} type="file" accept=".txt" className="hidden" onChange={onFileChange} />
      <motion.div
        animate={shake ? { x: [0, -10, 10, -10, 10, 0] } : { x: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <UploadZoneIdle
          isDragging={state === "dragging"}
          onDragEnter={onDragEnter}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={onBrowse}
          error={error}
        />
      </motion.div>
    </>
  );
}
