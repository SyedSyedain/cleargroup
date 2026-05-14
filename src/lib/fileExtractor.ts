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
    try {
      const zip = await JSZip.loadAsync(file)
      const files = Object.values(zip.files)
      const txtFile = files.find((f) => !f.dir && (f.name.endsWith('.txt') || f.name.includes('chat')))
      if (!txtFile) {
        throw new Error('No chat file found inside the zip. Please export your chat Without Media and try again.')
      }
      return await txtFile.async('string')
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      if (message.includes('No chat file')) throw error
      throw new Error('Could not read the zip file. Try exporting as .txt instead.')
    }
  }

  throw new Error("Please upload a .txt or .zip WhatsApp export file");
}
