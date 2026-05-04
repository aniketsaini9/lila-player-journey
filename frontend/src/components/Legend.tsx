const EVENTS = [
  { label: "Kill",       color: "#ef4444", description: "Player kill" },
  { label: "Death",      color: "#f97316", description: "Player death" },
  { label: "Loot",       color: "#eab308", description: "Item pickup" },
  { label: "Storm",      color: "#a855f7", description: "Storm death" },
];

const Legend = () => {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-2.5 shadow-sm">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">

        {/* ── Event types ─────────────────────────────────────── */}
        {EVENTS.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5 group cursor-default">
            <span
              className="h-2.5 w-2.5 rounded-full ring-2 ring-transparent group-hover:ring-white/20 transition-all"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
              {item.label}
            </span>
          </div>
        ))}

        {/* ── Divider ─────────────────────────────────────────── */}
        <div className="h-4 w-px bg-border mx-1" />

        {/* ── Player types ────────────────────────────────────── */}
        <div className="flex items-center gap-1.5 group cursor-default">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-500 ring-2 ring-transparent group-hover:ring-white/20 transition-all" />
          <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
            Human
          </span>
        </div>

        <div className="flex items-center gap-1.5 group cursor-default">
          <span className="h-2.5 w-2.5 rounded-full border border-dashed border-muted-foreground/60" />
          <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
            Bot
          </span>
        </div>

        {/* ── Path types ──────────────────────────────────────── */}
        <div className="h-4 w-px bg-border mx-1" />

        <div className="flex items-center gap-1.5">
          <div className="w-6 h-0.5 bg-blue-500 opacity-70 rounded" />
          <span className="text-xs text-muted-foreground">Human path</span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="w-6 h-0.5 bg-gray-500 opacity-50 rounded" style={{
            backgroundImage: "repeating-linear-gradient(90deg, #6b7280 0, #6b7280 3px, transparent 3px, transparent 6px)"
          }} />
          <span className="text-xs text-muted-foreground">Bot path</span>
        </div>

      </div>
    </div>
  );
};

export default Legend;