import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { PanelRightClose, PanelRightOpen, Users, Swords, Clock, Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { BackendEvent, SummaryResponse } from "@/services/api";
import { useMemo } from "react";

interface SidePanelProps {
  isOpen: boolean;
  onToggle: () => void;
  showPaths: boolean;
  showEvents: boolean;
  showHeatmap: boolean;
  onTogglePaths: (v: boolean) => void;
  onToggleEvents: (v: boolean) => void;
  onToggleHeatmap: (v: boolean) => void;
  summary?: SummaryResponse;
  events?: BackendEvent[];
  maxTime?: number;
}

// Format ms → "M:SS" or "Nms"
const formatDuration = (ms: number) => {
  if (!ms || ms <= 1) return "--";
  if (ms < 1000) return `${Math.round(ms)}ms`;
  const totalSecs = Math.floor(ms / 1000);
  const m = Math.floor(totalSecs / 60);
  const s = totalSecs % 60;
  return m > 0
    ? `${m}m ${s.toString().padStart(2, "0")}s`
    : `${s}s`;
};

const SidePanel = ({
  isOpen, onToggle,
  showPaths, showEvents, showHeatmap,
  onTogglePaths, onToggleEvents, onToggleHeatmap,
  summary, events = [], maxTime = 0,
}: SidePanelProps) => {

  // Calculate stats from current match events
  const humanPlayers = new Set(
    events.filter((e) => !e.is_bot).map((e) => e.user_id)
  ).size;

  const botPlayers = new Set(
    events.filter((e) => e.is_bot).map((e) => e.user_id)
  ).size;

  const kills = events.filter((e) =>
    e.event === "Kill" || e.event === "BotKill"
  ).length;

  const loots = events.filter((e) => e.event === "Loot").length;

  const stormDeaths = events.filter(
    (e) => e.event === "KilledByStorm"
  ).length;

  const totalEvents = events.length;

  const survivalData = useMemo(() => {
    if (!events.length || !maxTime || maxTime <= 1) return [];

    const minTs = events.reduce((m, e) => Math.min(m, Number(e.ts_ms)), Infinity);
    const deaths = events
      .filter(e => e.event === "Killed" || e.event === "KilledByStorm")
      .map(e => Number(e.ts_ms) - minTs)
      .sort((a, b) => a - b);

    if (!deaths.length) return [];

    const totalPlayers = new Set(events.filter(e => !e.is_bot).map(e => e.user_id)).size || 1;
    const BUCKETS = 10;
    const bucketSize = maxTime / BUCKETS;

    return Array.from({ length: BUCKETS + 1 }, (_, i) => {
      const t = i * bucketSize;
      const deadCount = deaths.filter(d => d <= t).length;
      const alive = Math.max(0, totalPlayers - deadCount);
      return {
        t: Math.round(t / 1000) + "s",
        alive,
      };
    });
  }, [events, maxTime]);

  return (
    <div className="relative flex h-full">

      {/* ── Toggle button ────────────────────────────────────── */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className="absolute -left-10 top-0 h-8 w-8 text-muted-foreground hover:text-foreground"
        title={isOpen ? "Close panel" : "Open panel"}
      >
        {isOpen
          ? <PanelRightClose className="h-4 w-4" />
          : <PanelRightOpen  className="h-4 w-4" />
        }
      </Button>

      {/* ── Panel content ────────────────────────────────────── */}
      {isOpen && (
        <div className="h-full w-60 overflow-y-auto space-y-5 rounded-xl border border-border bg-card p-4 shadow-sm">

          {/* ── Match Summary ─────────────────────────────────── */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Match Summary
            </h3>

            <div className="grid grid-cols-2 gap-2">
              {/* Players */}
              <div className="rounded-lg bg-secondary/50 p-2.5 space-y-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" />
                  Players
                </div>
                <div className="text-lg font-bold text-foreground">
                  {humanPlayers}
                  <span className="text-xs font-normal text-muted-foreground ml-1">human</span>
                </div>
                <div className="text-xs text-muted-foreground">{botPlayers} bots</div>
              </div>

              {/* Kills */}
              <div className="rounded-lg bg-secondary/50 p-2.5 space-y-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Swords className="h-3 w-3" />
                  Kills
                </div>
                <div className="text-lg font-bold text-red-400">{kills}</div>
                <div className="text-xs text-muted-foreground">{stormDeaths} storm</div>
              </div>
            </div>

            {/* More stats */}
            <div className="space-y-2 pt-1">
              {[
                {
                  icon: <Activity className="h-3 w-3" />,
                  label: "Total Events",
                  value: totalEvents.toLocaleString(),
                },
                {
                  icon: <span className="text-yellow-400 text-xs">📦</span>,
                  label: "Loot Pickups",
                  value: loots.toLocaleString(),
                },
                {
                  icon: <Clock className="h-3 w-3" />,
                  label: "Duration",
                  value: formatDuration(maxTime),
                },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    {stat.icon}
                    {stat.label}
                  </div>
                  <span className="font-medium text-foreground tabular-nums">
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border" />

          {/* ── Display Toggles ───────────────────────────────── */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Display
            </h3>

            <div className="space-y-3">
              {[
                {
                  label: "Player Paths",
                  description: "Movement trails",
                  checked: showPaths,
                  onChange: onTogglePaths,
                  color: "text-blue-400",
                  dot: "bg-blue-400",
                },
                {
                  label: "Events",
                  description: "Kills, loot, deaths",
                  checked: showEvents,
                  onChange: onToggleEvents,
                  color: "text-red-400",
                  dot: "bg-red-400",
                },
                {
                  label: "Heatmap",
                  description: "Activity density",
                  checked: showHeatmap,
                  onChange: onToggleHeatmap,
                  color: "text-orange-400",
                  dot: "bg-orange-400",
                },
              ].map((toggle) => (
                <div
                  key={toggle.label}
                  className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${toggle.checked ? toggle.dot : "bg-muted-foreground/30"}`} />
                    <div>
                      <div className="text-sm font-medium text-foreground leading-none">
                        {toggle.label}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {toggle.description}
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={toggle.checked}
                    onCheckedChange={toggle.onChange}
                    className="shrink-0"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ── Overall Stats (from summary API) ─────────────── */}
          {survivalData.length > 0 && (
            <>
              <div className="border-t border-border" />
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Survival Curve
                </h3>
                <p className="text-xs text-muted-foreground">Players alive over time</p>
                <ResponsiveContainer width="100%" height={80}>
                  <LineChart data={survivalData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                    <XAxis
                      dataKey="t"
                      tick={{ fontSize: 9, fill: "#6b7280" }}
                      tickLine={false}
                      axisLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fontSize: 9, fill: "#6b7280" }}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1c1c1c",
                        border: "1px solid #333",
                        borderRadius: "6px",
                        fontSize: "11px",
                        color: "#e2e8f0",
                      }}
                      formatter={(v: number) => [v, "alive"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="alive"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 3, fill: "#3b82f6" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
          {summary && Object.keys(summary).length > 0 && (
            <>
              <div className="border-t border-border" />
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Dataset (5 Days)
                </h3>
                {[
                  { label: "Total Matches", value: summary.total_matches?.toLocaleString() },
                  { label: "Total Players", value: summary.total_players?.toLocaleString() },
                  { label: "Total Events",  value: summary.total_events?.toLocaleString() },
                ].map((s) => s.value && (
                  <div key={s.label} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="font-mono font-medium text-foreground">{s.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SidePanel;
