import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, SkipForward } from "lucide-react";

interface TimelineProps {
  currentTime: number;
  maxTime: number;
  isPlaying: boolean;
  playbackSpeed: number;
  visibleCount: number;
  totalCount: number;
  onTimeChange: (time: number) => void;
  onTogglePlay: () => void;
  onPlaybackSpeedChange: (speed: number) => void;
}

const SPEED_OPTIONS = [0.5, 1, 2, 4] as const;

const formatTime = (ms: number) => {
  if (ms <= 0) return "0ms";
  if (ms < 1000) return `${Math.round(ms)}ms`;

  const totalSecs = Math.floor(ms / 1000);
  const m = Math.floor(totalSecs / 60);
  const s = totalSecs % 60;

  return m > 0 ? `${m}:${s.toString().padStart(2, "0")}` : `${s}s`;
};

const Timeline = ({
  currentTime,
  maxTime,
  isPlaying,
  playbackSpeed,
  onTimeChange,
  visibleCount,
  totalCount,
  onTogglePlay,
  onPlaybackSpeedChange,
}: TimelineProps) => {
  const safeMax = Math.max(maxTime, 1);
  const progress = Math.round((currentTime / safeMax) * 100);
  const hasData = safeMax > 1;

  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Match Timeline
        </span>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-muted-foreground">{progress}% complete</span>

          <div className="flex items-center gap-1 rounded-md border border-border bg-secondary/40 p-0.5">
            {SPEED_OPTIONS.map((speed) => (
              <button
                key={speed}
                type="button"
                onClick={() => onPlaybackSpeedChange(speed)}
                className={`rounded px-2 py-0.5 text-[11px] font-mono transition-colors ${
                  playbackSpeed === speed
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
                title={`Set playback speed to ${speed}x`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onTogglePlay}
          disabled={!hasData}
          className="h-8 w-8 shrink-0 text-primary transition-colors hover:bg-primary/10 hover:text-primary"
          title={isPlaying ? "Pause" : "Play match"}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onTimeChange(0)}
          disabled={!hasData || currentTime === 0}
          className="h-8 w-8 shrink-0 text-muted-foreground transition-colors hover:text-foreground"
          title="Replay from start"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onTimeChange(safeMax)}
          disabled={!hasData || currentTime === safeMax}
          className="h-8 w-8 shrink-0 text-muted-foreground transition-colors hover:text-foreground"
          title="Skip to end (show all events)"
        >
          <SkipForward className="h-3.5 w-3.5" />
        </Button>

        <div className="flex-1 px-2">
          <Slider
            value={[currentTime]}
            min={0}
            max={safeMax}
            step={1}
            onValueChange={([v]) => onTimeChange(v)}
            disabled={!hasData}
            className="w-full"
          />
        </div>

        <div className="flex min-w-[80px] shrink-0 flex-col items-end">
          <span className="text-sm font-mono font-medium text-foreground leading-none">{formatTime(currentTime)}</span>
          <span className="mt-0.5 text-xs font-mono text-muted-foreground leading-none">/ {formatTime(safeMax)}</span>
        </div>
      </div>
<span className="text-xs font-mono bg-secondary/60 px-2 py-0.5 rounded border border-border text-foreground">
  {visibleCount.toLocaleString()} / {totalCount.toLocaleString()} events
</span>
      <div className="mt-2 h-0.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-primary transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default Timeline;
