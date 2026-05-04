import { useMemo, useState, useRef, useCallback, useEffect } from "react";
import { STATIC_BASE_URL, type BackendEvent } from "@/services/api";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const ZONE_LABELS: Record<string, { x: number; y: number; label: string }[]> = {
  Lockdown: [
    { x: 512, y: 180, label: "North Docks" },
    { x: 200, y: 350, label: "West Cliffs" },
    { x: 820, y: 320, label: "East Quarter" },
    { x: 512, y: 512, label: "Central Plaza" },
    { x: 300, y: 700, label: "South Market" },
    { x: 750, y: 680, label: "Warehouse Row" },
  ],
  AmbroseValley: [
    { x: 512, y: 150, label: "Northern Ridge" },
    { x: 200, y: 400, label: "West Valley" },
    { x: 800, y: 400, label: "East Outpost" },
    { x: 512, y: 512, label: "Valley Floor" },
    { x: 350, y: 700, label: "South Ruins" },
    { x: 720, y: 720, label: "Lowlands" },
  ],
  GrandRift: [
    { x: 512, y: 150, label: "Upper Rift" },
    { x: 180, y: 512, label: "West Bank" },
    { x: 840, y: 512, label: "East Bank" },
    { x: 512, y: 512, label: "Rift Core" },
    { x: 300, y: 800, label: "South Gorge" },
    { x: 750, y: 800, label: "Deep Cut" },
  ],
};

const MARKER_EVENT_COLORS: Record<string, string> = {
  Kill:          "#ef4444",
  Killed:        "#f97316",
  BotKill:       "#ef4444",
  BotKilled:     "#f97316",
  KilledByStorm: "#8b5cf6",
  Loot:          "#facc15",
};

const PATH_EVENTS   = new Set(["Position", "BotPosition"]);
const MARKER_EVENTS = new Set(["Kill","Killed","BotKill","BotKilled","KilledByStorm","Loot"]);

const MIN_ZOOM = 1;
const MAX_ZOOM = 8;

interface MapViewProps {
  minimapUrl?: string;
  events: BackendEvent[];
  heatmap: BackendEvent[];
  mapId?: string;
  showPaths: boolean;
  showEvents: boolean;
  showHeatmap: boolean;
}

const toNum = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const resolveMinimapUrl = (minimapUrl?: string) => {
  if (!minimapUrl) return "";
  if (/^https?:\/\//i.test(minimapUrl)) return minimapUrl;

  try {
    return new URL(minimapUrl, `${STATIC_BASE_URL}/`).toString();
  } catch {
    return "";
  }
};

const MapView = ({
  minimapUrl, events, heatmap, mapId, showPaths, showEvents, showHeatmap,
}: MapViewProps) => {
  const [imgError, setImgError] = useState(false);

  // ── Zoom + Pan state ──────────────────────────────────────
  const [zoom,    setZoom]    = useState(1);
  const [pan,     setPan]     = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ── Zoom helpers ──────────────────────────────────────────
  const clampZoom = (z: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));

  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const zoomIn  = useCallback(() => setZoom((z) => clampZoom(z * 1.5)), []);
  const zoomOut = useCallback(() => setZoom((z) => clampZoom(z / 1.5)), []);

  // ── Mouse wheel zoom ──────────────────────────────────────
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.85 : 1.18;
    setZoom((z) => clampZoom(z * delta));
  }, []);

  // ── Click + drag pan ──────────────────────────────────────
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
  }, [zoom, pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !dragStart.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPan({ x: dragStart.current.panX + dx, y: dragStart.current.panY + dy });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    dragStart.current = null;
  }, []);

  // ── Double click → zoom to point ─────────────────────────
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const cx = e.clientX - rect.left - rect.width  / 2;
    const cy = e.clientY - rect.top  - rect.height / 2;

    if (zoom >= MAX_ZOOM) {
      resetView();
    } else {
      const newZoom = clampZoom(zoom * 2);
      setZoom(newZoom);
      setPan((p) => ({
        x: p.x - cx * (newZoom / zoom - 1),
        y: p.y - cy * (newZoom / zoom - 1),
      }));
    }
  }, [zoom, resetView]);

  // ── Build SVG paths and markers ───────────────────────────
  const { paths, markerEvents } = useMemo(() => {
    const safe = events ?? [];
    const groups = new Map<string, BackendEvent[]>();

    for (const e of safe) {
      if (!PATH_EVENTS.has(e.event)) continue;
      const k = e.user_id || "unknown";
      groups.set(k, [...(groups.get(k) ?? []), e]);
    }

    const nextPaths = Array.from(groups.values())
      .map((items) => ({
        points: [...items]
          .sort((a, b) => toNum(a.ts_ms) - toNum(b.ts_ms))
          .map((e) => `${toNum(e.pixel_x)},${toNum(e.pixel_y)}`)
          .join(" "),
        isBot: items[0]?.is_bot ?? false,
      }))
      .filter((p) => p.points.includes(" "));

    return {
      paths: nextPaths,
      markerEvents: safe.filter((e) => MARKER_EVENTS.has(e.event)),
    };
  }, [events]);

  // In MapView.tsx, add after markerEvents block:
  const chokePoints = useMemo(() => {
    const kills = events.filter(e => e.event === "Kill" || e.event === "BotKill");
    const clusters: {x: number, y: number, count: number}[] = [];
    
    kills.forEach(kill => {
      const cx = toNum(kill.pixel_x);
      const cy = toNum(kill.pixel_y);
      const existing = clusters.find(c => 
        Math.abs(c.x - cx) < 40 && Math.abs(c.y - cy) < 40
      );
      if (existing) existing.count++;
      else clusters.push({x: cx, y: cy, count: 1});
    });
    
    return clusters.filter(c => c.count >= 3);
  }, [events]);
  const src = resolveMinimapUrl(minimapUrl);

  useEffect(() => {
    setImgError(false);
  }, [src]);

  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-2">

      {/* ── Zoom controls bar ─────────────────────────────────── */}
      <div className="flex shrink-0 items-center gap-2 px-1">
        <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
          Zoom
        </span>

        <Button
          variant="outline" size="icon"
          onClick={zoomOut}
          disabled={zoom <= MIN_ZOOM}
          className="h-7 w-7"
          title="Zoom out"
        >
          <ZoomOut className="h-3.5 w-3.5" />
        </Button>

        {/* Zoom level indicator + click to reset */}
        <button
          onClick={resetView}
          className="text-xs font-mono text-foreground bg-secondary/60 hover:bg-secondary px-2 py-1 rounded border border-border transition-colors min-w-[52px] text-center"
          title="Click to reset zoom"
        >
          {Math.round(zoom * 100)}%
        </button>

        <Button
          variant="outline" size="icon"
          onClick={zoomIn}
          disabled={zoom >= MAX_ZOOM}
          className="h-7 w-7"
          title="Zoom in"
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </Button>

        <Button
          variant="ghost" size="icon"
          onClick={resetView}
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          title="Reset view"
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </Button>

        {/* Hint text */}
        <span className="text-xs text-muted-foreground ml-2 hidden sm:block">
          Scroll to zoom · Drag to pan · Double-click to zoom in
        </span>

        {/* Event count badge */}
        <span className="ml-auto text-xs font-mono text-muted-foreground bg-secondary/60 px-2 py-1 rounded">
          {(events ?? []).length.toLocaleString()} events
        </span>
      </div>

      {/* ── Map container ─────────────────────────────────────── */}
      <div
        ref={containerRef}
        className={`
          relative min-h-0 w-full flex-1 max-h-full
          rounded-xl border border-border bg-card overflow-hidden
          select-none shadow-sm
          ${isDragging ? "cursor-grabbing" : zoom > 1 ? "cursor-grab" : "cursor-default"}
        `}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleClick}
      >
        {/* ── Zoomable + pannable inner layer ─────────────────── */}
        <div
          className="absolute inset-0 transition-none"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "center center",
            willChange: "transform",
          }}
        >
          {/* Minimap image */}
          {src && !imgError ? (
            <img
              src={src}
              alt="minimap"
              className="absolute inset-0 h-full w-full object-contain pointer-events-none"
              onError={() => setImgError(true)}
              draggable={false}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-muted text-sm text-muted-foreground">
              {src ? "Failed to load minimap" : "Select a map to begin"}
            </div>
          )}

          {/* SVG overlay */}
          <svg
            className="absolute inset-0 h-full w-full pointer-events-none"
            viewBox="0 0 1024 1024"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Heatmap */}
            {showHeatmap && (heatmap ?? []).map((e, i) => (
              <circle
                key={`h-${i}`}
                cx={toNum(e.pixel_x)} cy={toNum(e.pixel_y)}
                r={e.is_bot ? 20 : 32}
                fill="#ef4444" opacity={0.13}
              />
            ))}

            {/* Player paths */}
            {showPaths && paths.map((p, i) => (
              <polyline
                key={`p-${i}`}
                points={p.points} fill="none"
                stroke={p.isBot ? "#6b7280" : "#3b82f6"}
                strokeWidth={p.isBot ? 1 : 1.5}
                opacity={p.isBot ? 0.25 : 0.55}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            ))}

            {/* Event markers */}
            {showEvents && markerEvents.map((e, i) => {
              const color = MARKER_EVENT_COLORS[e.event] ?? "#ffffff";
              const cx = toNum(e.pixel_x);
              const cy = toNum(e.pixel_y);
              const r  = e.is_bot ? 3 : 5;
              return (
                <g key={`m-${e.user_id}-${e.ts_ms}-${i}`}>
                  <circle cx={cx} cy={cy} r={r + 5} fill={color} opacity={0.15} />
                  <circle
                    cx={cx} cy={cy} r={r}
                    fill={color} opacity={0.92}
                    stroke={e.is_bot ? "#f8fafc" : "none"}
                    strokeWidth={e.is_bot ? 1 : 0}
                    strokeDasharray={e.is_bot ? "2 2" : undefined}
                  />
                </g>
              );
             })}

            {/* Zone labels */}
            {(ZONE_LABELS[mapId ?? ""] ?? []).map((zone) => (
              <g key={zone.label}>
                <rect
                  x={zone.x - zone.label.length * 3.8}
                  y={zone.y - 11}
                  width={zone.label.length * 7.6}
                  height={16}
                  rx={4}
                  fill="#000000"
                  opacity={0.7}
                />
                <text
                  x={zone.x}
                  y={zone.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={13}
                  fontFamily="monospace"
                  fontWeight="bold"
                  fill="#ffffff"
                  opacity={1}
                  letterSpacing={0.8}
                >
                  {zone.label}
                </text>
              </g>
            ))}
            {chokePoints.map((cp, i) => (
              <g key={`cp-${i}`}>
                {/* Outer pulsing ring */}
                <circle
                  cx={cp.x} cy={cp.y}
                  r={22}
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth={1.5}
                  opacity={0.4}
                  strokeDasharray="4 3"
                />
                {/* Inner filled circle */}
                <circle
                  cx={cp.x} cy={cp.y}
                  r={13}
                  fill="#ef4444"
                  opacity={0.25}
                />
                {/* Kill count badge background */}
                <circle
                  cx={cp.x} cy={cp.y}
                  r={10}
                  fill="#7f1d1d"
                  opacity={0.9}
                />
                {/* Kill count text */}
                <text
                  x={cp.x} y={cp.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={9}
                  fontFamily="monospace"
                  fontWeight="bold"
                  fill="#fca5a5"
                >
                  {cp.count}🔥
                </text>
              </g>
            ))}
          </svg>
        </div>

        {/* ── Fixed overlay labels (don't zoom) ─────────────────── */}
        <div className="absolute left-3 top-3 rounded bg-background/80 px-2 py-1 text-xs text-muted-foreground font-mono uppercase pointer-events-none z-10">
          Live Map View
        </div>

        {/* Zoom level badge (fixed position) */}
        {zoom > 1 && (
          <div className="absolute right-3 bottom-3 rounded bg-background/90 border border-border px-2 py-1 text-xs font-mono text-primary pointer-events-none z-10">
            {Math.round(zoom * 100)}% · drag to pan
          </div>
        )}
      </div>
    </div>
  );
};

export default MapView;
