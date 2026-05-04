import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RotateCcw, Map, Calendar, Gamepad2, Filter } from "lucide-react";
import type { MapApiItem, MatchApiItem } from "@/services/api";

export type EventFilterType = "all" | "Kill" | "Loot" | "Killed" | "KilledByStorm" | "BotKill" | "BotKilled";

const EVENT_FILTERS: { value: EventFilterType; label: string; color: string }[] = [
  { value: "all",           label: "All Events",      color: "bg-primary" },
  { value: "Kill",          label: "Kill",            color: "bg-red-500" },
  { value: "Killed",        label: "Death",           color: "bg-orange-500" },
  { value: "BotKill",       label: "Bot Kill",        color: "bg-red-400" },
  { value: "BotKilled",     label: "Bot Death",       color: "bg-orange-400" },
  { value: "Loot",          label: "Loot",            color: "bg-yellow-500" },
  { value: "KilledByStorm", label: "Storm Death",     color: "bg-purple-500" },
];

  const formatDuration = (ms: number) => {
    if (!ms || ms <= 1) return "--";
    const totalSecs = Math.floor(ms / 1000);
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return m > 0 ? `${m}m${s.toString().padStart(2,"0")}s` : `${s}s`;
  };
  
interface FiltersBarProps {
  maps: MapApiItem[];
  matches: MatchApiItem[];
  selectedMap: string;
  selectedDate: string;
  selectedMatch: string;
  selectedEventType: EventFilterType;
  onMapChange: (v: string) => void;
  onDateChange: (v: string) => void;
  onMatchChange: (v: string) => void;
  onEventTypeChange: (v: EventFilterType) => void;
  onReset: () => void;
}

// Label above each dropdown
const FieldLabel = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <div className="flex items-center gap-1 mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
    {icon}
    <span>{text}</span>
  </div>
);

const FiltersBar = ({
  maps, matches, selectedMap, selectedDate, selectedMatch,
  selectedEventType, onMapChange, onDateChange, onMatchChange,
  onEventTypeChange, onReset,
}: FiltersBarProps) => {
  const selectedMapObject = maps.find((m) => m.map_id === selectedMap);
  const dates = selectedMapObject?.dates ?? [];

  // Format match ID for display — show last 8 chars
  const formatMatchId = (id: string) =>
    id.length > 16 ? `...${id.slice(-12)}` : id;

  return (
    <div className="rounded-xl border border-border bg-card px-5 py-4 shadow-sm">
      <div className="flex flex-wrap items-end gap-4">

        {/* ── Map ─────────────────────────────────────────────── */}
        <div className="flex flex-col min-w-[160px]">
          <FieldLabel icon={<Map className="h-3 w-3" />} text="Map" />
          <Select value={selectedMap} onValueChange={onMapChange}>
            <SelectTrigger className="w-full bg-secondary/60 border-border hover:bg-secondary transition-colors">
              <SelectValue placeholder="Select map..." />
            </SelectTrigger>
            <SelectContent>
              {(maps ?? []).map((m) => (
                <SelectItem key={m.map_id} value={m.map_id}>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    {m.map_id}
                    <span className="text-xs text-muted-foreground ml-1">
                      ({m.total_matches} matches)
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* ── Date ────────────────────────────────────────────── */}
        <div className="flex flex-col min-w-[150px]">
          <FieldLabel icon={<Calendar className="h-3 w-3" />} text="Date" />
          <Select value={selectedDate || undefined} onValueChange={onDateChange} disabled={!dates.length}>
            <SelectTrigger className="w-full bg-secondary/60 border-border hover:bg-secondary transition-colors disabled:opacity-50">
              <SelectValue placeholder="Select date..." />
            </SelectTrigger>
            <SelectContent>
              {dates.map((d) => (
                <SelectItem key={d} value={d}>
                  {new Date(d).toLocaleDateString("en-US", {
                    weekday: "short", month: "short", day: "numeric"
                  })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* ── Match ───────────────────────────────────────────── */}
        <div className="flex flex-col min-w-[200px]">
          <FieldLabel icon={<Gamepad2 className="h-3 w-3" />} text={`Match ${matches.length ? `(${matches.length})` : ""}`} />
          <Select value={selectedMatch || undefined} onValueChange={onMatchChange} disabled={!matches.length}>
            <SelectTrigger className="w-full bg-secondary/60 border-border hover:bg-secondary transition-colors disabled:opacity-50">
              <SelectValue placeholder={matches.length ? "Select match..." : "No matches"} />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {(matches ?? []).map((m) => (
                <SelectItem key={m.match_id} value={m.match_id}>
                  <div className="flex items-center gap-2 w-full">
                    <span className="font-mono text-xs">{formatMatchId(m.match_id)}</span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      👤{m.human_count} 🤖{m.bot_count} · {formatDuration(m.duration_ms)}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* ── Event Type ──────────────────────────────────────── */}
        <div className="flex flex-col min-w-[160px]">
          <FieldLabel icon={<Filter className="h-3 w-3" />} text="Event Type" />
          <Select value={selectedEventType} onValueChange={(v) => onEventTypeChange(v as EventFilterType)}>
            <SelectTrigger className="w-full bg-secondary/60 border-border hover:bg-secondary transition-colors">
              <SelectValue placeholder="Filter events..." />
            </SelectTrigger>
            <SelectContent>
              {EVENT_FILTERS.map(({ value, label, color }) => (
                <SelectItem key={value} value={value}>
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${color}`} />
                    {label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* ── Reset ───────────────────────────────────────────── */}
        <div className="flex flex-col justify-end ml-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="text-muted-foreground hover:text-foreground hover:border-primary transition-colors gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FiltersBar;