# LILA BLACK — Player Journey Visualization Tool

A web-based tool for LILA Games Level Designers to explore player behavior across maps, matches, and event types using 5 days of production telemetry data.

**Live Tool:** https://lila-frontend-assignment.vercel.app/
**Backend API:** https://python-backend-lila.onrender.com/lila-black/

> **Note:** The backend runs on Render's free tier and may take ~30 seconds to respond on first load after a period of inactivity. This is a cold start delay — the tool will work normally after the initial load.

---

## Features

- **Live minimap visualization** — player paths and events rendered on the correct minimap using calibrated world-to-pixel coordinate conversion
- **Human vs bot distinction** — human players shown as solid blue paths, bots as grey dashed trails
- **Event markers** — Kill (red), Death (orange), Loot (yellow), Storm Death (purple) rendered as distinct SVG markers
- **Filter by map, date, match, and event type** — all dropdowns cascade correctly
- **Timeline playback** — scrub through a match or play it at 0.5x, 1x, 2x, 4x speed
- **Heatmap overlay** — toggle kill density heatmap across all matches for the selected map
- **Choke point detection** — automatically identifies zones with 3+ kills in close proximity
- **Zone labels** — named areas overlaid on each minimap for spatial reference
- **Survival curve** — live chart in the side panel showing players alive over time
- **Zoom and pan** — scroll to zoom (up to 8x), drag to pan, double-click to zoom to point

---

## Tech Stack

| Layer | Technology |
|---|---|
| Data pipeline | Python 3.12, PyArrow, Pandas |
| Backend | FastAPI, Uvicorn |
| Frontend | React 18, TypeScript, Tailwind CSS, Vite |
| Charts | Recharts |
| Backend hosting | Render.com |
| Frontend hosting | Vercel |

---

## Repository Structure

```
python_backend/               ← Backend repo
├── scripts/
│   └── process.py            ← Data pipeline: parquet → JSON
├── app/
│   └── main.py               ← FastAPI server
├── output/                   ← Generated JSON data files
│   ├── events.json
│   ├── matches.json
│   └── summary.json
├── minimaps/                 ← Minimap images served as static files
│   ├── AmbroseValley_Minimap.png
│   ├── GrandRift_Minimap.png
│   └── Lockdown_Minimap.jpg
└── requirements.txt

Lila_frontend_assignment/     ← Frontend repo
├── src/
│   ├── pages/
│   │   └── Index.tsx         ← Root component, state management
│   ├── components/
│   │   ├── MapView.tsx       ← Minimap + SVG overlay + zoom/pan
│   │   ├── FiltersBar.tsx    ← Map/Date/Match/EventType dropdowns
│   │   ├── Timeline.tsx      ← Playback controls + scrubber
│   │   ├── SidePanel.tsx     ← Stats + survival curve + toggles
│   │   └── Legend.tsx        ← Color reference
│   └── services/
│       └── api.ts            ← Axios API client + TypeScript types
├── ARCHITECTURE.md
├── INSIGHTS.md
└── package.json
```

---

## Local Setup

### Backend

```bash
git clone https://github.com/aniketsaini9/python_backend.git
cd python_backend

# Install dependencies
pip install -r requirements.txt

# Run the data pipeline (requires player_data/ folder with parquet files)
python scripts/process.py

# Start the API server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

API will be available at `http://localhost:8000`
Interactive docs at `http://localhost:8000/docs`

### Frontend

```bash
git clone https://github.com/aniketsaini9/Lila_frontend_assignment.git
cd Lila_frontend_assignment

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend will be available at `http://localhost:5173`

---

## Environment Variables

### Frontend

Create a `.env` file in the frontend root if pointing to a local backend:

```env
VITE_API_BASE_URL=http://localhost:8000
```

By default `src/services/api.ts` points to the deployed Render backend. No env vars are required to use the deployed version.

### Backend

No environment variables required. The backend reads data from the `output/` directory which is populated by running `process.py`.

---

## API Endpoints

| Endpoint | Description |
|---|---|
| `GET /api/maps` | All maps with available dates and minimap URLs |
| `GET /api/matches?map_id=&date=` | Matches filtered by map and date |
| `GET /api/events?map_id=&date=&match_id=&event_type=&limit=` | Events with full filter support |
| `GET /api/summary` | 5-day aggregate statistics |
| `GET /api/heatmap?map_id=&event_type=` | Kill events for heatmap rendering |
| `GET /maps/{filename}` | Minimap image files |

---

## Data Pipeline

Raw `.parquet` files from the Nakama game server are processed by `scripts/process.py`:

1. Read all parquet files across 5 days using PyArrow
2. Decode byte-encoded event names
3. Detect bots via UUID v4 pattern matching on `user_id`
4. Convert world coordinates to pixel coordinates using per-map calibration
5. Normalize timestamps per match (each match starts at 0ms)
6. Strip `.nakama-0` suffix from match IDs
7. Export `events.json`, `matches.json`, `summary.json` to `output/`

---

## Documentation

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — System design, coordinate mapping approach, trade-offs
- [`INSIGHTS.md`](./INSIGHTS.md) — Three data insights discovered using the tool