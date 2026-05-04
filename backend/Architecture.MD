# ARCHITECTURE.md — LILA BLACK Player Journey Visualization Tool

**Live Tool:** https://lila-frontend-assignment.vercel.app/
**Frontend Repo:** https://github.com/aniketsaini9/Lila_frontend_assignment
**Backend Repo:** https://github.com/aniketsaini9/python_backend
**Backend API:** https://python-backend-lila.onrender.com/

---

## What I Built and Why

| Layer | Choice | Why |
|---|---|---|
| Data pipeline | Python + PyArrow + Pandas | Same language as the parquet tooling; no translation layer needed |
| Backend | FastAPI | Auto OpenAPI docs, async support, minimal boilerplate for a read-only API |
| Frontend | React + TypeScript + Tailwind | Component model maps cleanly to UI structure; TypeScript catches API contract mismatches at compile time |
| Backend hosting | Render.com | Supports persistent uvicorn processes — Vercel serverless cannot run long-running servers |
| Frontend hosting | Vercel | Purpose-built for React; global CDN; zero-config deploy from GitHub |

---

## Data Flow

```
parquet files (5 days, Feb 10–14)
        │
        ▼
process.py
  ├── PyArrow reads each .parquet file per match
  ├── Bot detection via UUID v4 regex pattern
  ├── World coords → pixel coords (per-map calibration)
  ├── Timestamps normalized per match (0ms → duration ms)
  └── Output → events.json, matches.json, summary.json
        │
        ▼
FastAPI (main.py) — deployed on Render
  ├── All JSON loaded into memory at startup (~50MB)
  ├── GET /api/maps     → map metadata + minimap URLs
  ├── GET /api/matches  → filtered by map_id + date
  ├── GET /api/events   → filtered by map/date/match/event_type
  ├── GET /api/summary  → 5-day aggregate stats
  ├── GET /api/heatmap  → kill events for heatmap overlay
  └── GET /maps/{img}   → serves minimap PNG/JPG static images
        │  REST API (JSON over HTTPS)
        ▼
React Frontend — deployed on Vercel
  ├── FiltersBar  → Map / Date / Match / EventType dropdowns
  ├── MapView     → Minimap image + SVG overlay + zoom/pan/double-click
  ├── Timeline    → Scrubber + play/pause + speed controls (0.5x–4x)
  ├── SidePanel   → Live stats + survival curve chart + display toggles
  └── Legend      → Event and player type color reference
```

---

## Coordinate Mapping — The Tricky Part

Raw events store positions in Unreal Engine world space (float units). Minimap images are 1024×1024 pixels. Each map has a different scale and origin requiring individual calibration:

```python
MAP_CONFIG = {
    "AmbroseValley": {"scale": 900,  "origin_x": -370, "origin_z": -473},
    "GrandRift":     {"scale": 581,  "origin_x": -290, "origin_z": -290},
    "Lockdown":      {"scale": 1000, "origin_x": -500, "origin_z": -500},
}

def world_to_pixel(x, z, map_id):
    u = (x - origin_x) / scale      # normalize x → 0..1
    v = (z - origin_z) / scale      # normalize z → 0..1
    pixel_x = u * 1024
    pixel_y = (1 - v) * 1024        # flip Y axis: screen top-left vs world bottom-left
```

**Key decision:** The raw data has `x`, `y`, `z` axes where `y` is elevation (3D height). It is intentionally discarded — this is a top-down 2D minimap. `x` maps to horizontal pixel space and `z` maps to vertical pixel space after Y-axis flip.

The SVG overlay uses `viewBox="0 0 1024 1024"` with `preserveAspectRatio="xMidYMid meet"`, which means event dots rendered at pixel coordinates align correctly regardless of the container's screen dimensions.

---

## Assumptions Made

| Ambiguity | Assumption Made |
|---|---|
| Bot vs human detection | UUID v4 format = human; all other ID formats = bot |
| Timestamp format | Raw `ts` is epoch nanoseconds from Pandas Timestamp; converted to ms via `// 1_000_000` before normalization |
| Coordinate calibration | Scale and origin values derived by fitting known map extents to 1024×1024 pixel space |
| Zone names | Minimap images have no zone metadata; labels are approximated from visual inspection of the minimap images |
| Match ID cleaning | Raw match IDs carry `.nakama-0` suffix from Nakama game server — stripped during pipeline processing |
| BotKill vs Kill | Treated as equivalent kill events for heatmap and choke point analysis; distinguished visually by marker style |

---

## Major Trade-offs

| Decision | Considered | Decided | Why |
|---|---|---|---|
| Storage: in-memory JSON vs database | SQLite, PostgreSQL, DuckDB | In-memory JSON | 89K events fits in RAM; eliminates query latency; no DB setup for a read-only dataset |
| Filtering: server-side vs client-side | Full server filtering per request | Backend filters + up to 10K events per match to frontend | Keeps frontend logic simple; 10K events per match is manageable in browser memory |
| Timestamp normalization | Pipeline only vs frontend only | Pipeline + frontend safety layer | Pipeline is authoritative; frontend layer handles any edge cases from unnormalized data |
| Heatmap: default on vs off | Show immediately | Off by default | Heatmap fetches all kill events across all matches — large payload; avoids unnecessary load on first render |
| Backend: serverless vs persistent | Vercel Functions, Railway | Render persistent web service | FastAPI + uvicorn + StaticFiles for minimap images requires a long-running process; serverless cannot serve static files the same way |

---

## Scalability Considerations

At 10× data scale (~900K events):
- In-memory loading becomes impractical → migrate to PostgreSQL with composite indexes on `(match_id, map_id, date)`
- `/api/events` needs spatial indexing or pre-aggregated tile grids rather than raw coordinate arrays
- `process.py` pipeline can be parallelized across days using Python `multiprocessing`
- Heatmap should be pre-computed server-side into density grids rather than sending raw coordinates to the frontend

---

## Future Improvements

- **Custom data upload** — `/api/upload` endpoint accepting `.parquet` files; the pipeline in `process.py` is already modular and could run as a FastAPI `BackgroundTask`
- **User-defined zones** — Let designers draw and label map zones directly on the minimap
- **Cross-match aggregation** — Identify consistent choke points across many matches vs single-match outliers
- **Player tracking** — Click a player path to isolate their complete journey and event history
- **CSV export** — Download filtered event data for external analysis in spreadsheet tools

## Runtime Flow

```text
Processed parquet data
    -> output/events.json
    -> output/matches.json
    -> output/summary.json

database/database.py
    -> loads JSON into memory at startup

repositories/telemetry_repository.py
    -> filters in-memory datasets

services/telemetry_services.py
    -> validates map/date/timestamp filters

controllers/telemetry_controller.py
    -> wraps service results with standard response format

routes/telemetry_routes.py
    -> exposes HTTP endpoints and rate-limit decorators

main.py
    -> app creation, docs URLs, router registration, middleware, exception handlers

app_server.py
    -> dedicated ASGI entrypoint for Uvicorn and Render
```

## Folder Structure

```text
assignment_python_backend/
|-- main.py
|-- .env.example
|-- requirements.txt
|-- constants/
|   `-- __init__.py
|-- controllers/
|   |-- __init__.py
|   |-- health_controller.py
|   `-- telemetry_controller.py
|-- database/
|   |-- __init__.py
|   `-- database.py
|-- middlewares/
|   |-- __init__.py
|   |-- authenticator_middleware.py
|   |-- exception_handler.py
|   |-- exceptions.py
|   `-- logger_middleware.py
|-- models/
|   |-- __init__.py
|   `-- telemetry_model.py
|-- repositories/
|   |-- __init__.py
|   `-- telemetry_repository.py
|-- routes/
|   |-- __init__.py
|   |-- health_routes.py
|   `-- telemetry_routes.py
|-- services/
|   |-- __init__.py
|   |-- health_services.py
|   `-- telemetry_services.py
|-- utils/
|   |-- __init__.py
|   |-- helpers.py
|   |-- rate_limiter_middleware.py
|   `-- router_config.py
|-- scripts/
|   |-- main.py
|   `-- process.py
|-- output/
`-- minimaps/
