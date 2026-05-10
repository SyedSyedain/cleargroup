"use client";

interface Msg { sender: string; text: string; time: string; nameColor: string }

const messages: Msg[] = [
  { sender: "Vivek", text: "bro deadline kal hai",            time: "11:44", nameColor: "#4ADE80" },
  { sender: "Rahul", text: "kaun kar raha hai frontend",      time: "11:44", nameColor: "#60A5FA" },
  { sender: "Vivek", text: "🔥🔥🔥",                          time: "11:55", nameColor: "#4ADE80" },
  { sender: "Rahul", text: "guys??",                          time: "12:01", nameColor: "#60A5FA" },
  { sender: "Vivek", text: "hello??",                         time: "12:08", nameColor: "#4ADE80" },
  { sender: "Priya", text: "kaun kar raha hai presentation",  time: "12:15", nameColor: "#F472B6" },
  { sender: "Rahul", text: "yaar kuch batao",                 time: "12:22", nameColor: "#60A5FA" },
  { sender: "Vivek", text: "bhai kuch hua?",                  time: "12:45", nameColor: "#4ADE80" },
];

// Single left-aligned WhatsApp-style bubble
function Bubble({ sender, text, time, nameColor }: Msg) {
  return (
    <div style={{ marginLeft: 12, marginBottom: 6, maxWidth: "75%" }}>
      <div style={{ background: "#1E3020", borderRadius: "2px 8px 8px 8px", padding: "8px 12px" }}>
        <p style={{ color: nameColor, fontSize: 11, fontWeight: 600, marginBottom: 3, lineHeight: 1 }}>
          {sender}
        </p>
        <p style={{ color: "white", fontSize: 12, lineHeight: 1.4 }}>{text}</p>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 9, textAlign: "right", marginTop: 4 }}>
          {time}
        </p>
      </div>
    </div>
  );
}

// Left panel — WhatsApp dark mode group chat showing the chaos
export default function ComparisonChatPanel() {
  return (
    <div className="h-full flex flex-col" style={{ background: "#0A1A0F" }}>

      {/* WhatsApp header */}
      <div
        className="flex items-center gap-3 px-4 py-3 shrink-0"
        style={{ background: "#1A2E1A" }}
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
          style={{ background: "#1A4D2E" }}
        >
          <span style={{ color: "#4ADE80", fontSize: 11, fontWeight: 700 }}>PA</span>
        </div>
        <div>
          <p style={{ color: "white", fontSize: 12, fontWeight: 700, lineHeight: 1, marginBottom: 3 }}>
            Project Alpha 🙈
          </p>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 10 }}>
            Rahul, Priya, Vivek, +3 more
          </p>
        </div>
      </div>

      {/* Message list — fills remaining height */}
      <div
        className="flex-1 overflow-hidden flex flex-col justify-end"
        style={{ padding: "10px 0 12px" }}
      >
        {messages.map((m, i) => <Bubble key={i} {...m} />)}
      </div>

    </div>
  );
}
