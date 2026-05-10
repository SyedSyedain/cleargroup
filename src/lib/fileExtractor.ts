/**
 * Extracts raw WhatsApp chat text from either a .txt or .zip export file.
 * Keeps the async zip logic isolated so parser.ts stays pure/sync.
 */
import JSZip from "jszip";

// ── Helpers ───────────────────────────────────────────────────────────────────

function readBlobAsText(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader    = new FileReader();
    reader.onload   = (e) => resolve((e.target?.result as string) ?? "");
    reader.onerror  = ()  => reject(new Error("Failed to read file"));
    reader.readAsText(blob, "utf-8");
  });
}

function isChatFile(name: string): boolean {
  const n = name.toLowerCase();
  // WhatsApp zip always contains "_chat.txt"; fall back to any .txt
  return !name.includes("/") // skip files inside sub-folders (rare)
    ? n.endsWith(".txt")
    : n.split("/").pop()?.endsWith(".txt") ?? false;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Read a WhatsApp export file (either .txt or .zip) and return the raw chat text.
 * @throws {Error} With a user-readable message on any failure.
 */
export async function extractChatFromFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();

  if (name.endsWith(".txt")) {
    return readBlobAsText(file);
  }

  if (name.endsWith(".zip")) {
    let zip: JSZip;
    try {
      zip = await JSZip.loadAsync(file);
    } catch {
      throw new Error("Could not open the zip file. Make sure it is a valid WhatsApp export.");
    }

    // Prefer _chat.txt, then any .txt at root, then any .txt anywhere
    const entries   = Object.values(zip.files).filter((f) => !f.dir);
    const chatEntry =
      entries.find((f) => f.name.toLowerCase().endsWith("_chat.txt")) ??
      entries.find((f) => isChatFile(f.name));

    if (!chatEntry) {
      throw new Error(
        "Could not find chat file inside the zip. Please try exporting Without Media instead."
      );
    }

    return chatEntry.async("string");
  }

  throw new Error("Please upload a .txt or .zip WhatsApp export file");
}
