export default function JoinLoading() {
  return (
    <main className="min-h-screen px-4 flex items-center justify-center" style={{ background: "#060810" }}>
      <div className="w-full max-w-[480px] rounded-[20px] p-8 animate-pulse" style={{ background: "#0C1121", border: "1px solid #1A2440" }}>
        <div className="h-8 w-40 rounded mb-4" style={{ background: "#111828" }} />
        <div className="h-5 w-64 rounded mb-6" style={{ background: "#111828" }} />
        <div className="h-28 w-full rounded-xl" style={{ background: "#111828" }} />
      </div>
    </main>
  );
}
