

# Game Analytics Tool for Level Designers

A dark-themed, map-centric analytics UI for visualizing player behavior across game matches.

## Layout & Structure

### 1. Filters Bar (Top)
- Horizontal bar with dropdowns: Map, Date, Match, Event Type (Kill/Death/Loot/Storm)
- "Reset Filters" button on the right
- Compact, single-row layout with dark styling

### 2. Map Visualization (Center — hero element)
- Large container taking ~60-70% of viewport height
- Placeholder minimap image with an SVG overlay layer for future markers/paths/heatmaps
- Mock event markers (colored dots) plotted on the map based on mock coordinate data
- Clean border, subtle glow to make it the focal point

### 3. Timeline (Below Map)
- Horizontal slider for match time (0:00 → match end)
- Play/Pause button + current timestamp label
- Compact, unobtrusive design

### 4. Legend (Below Timeline or bottom-left of map)
- Color-coded event types: Kill (red), Death (black/gray), Loot (yellow), Storm (purple)
- Human vs Bot style indicators (solid vs dashed circles)

### 5. Side Panel (Right, collapsible)
- Summary stats: Total Players, Total Kills, Match Duration
- Toggle switches: Show Paths, Show Events, Toggle Heatmap
- Collapsible via a small toggle button to maximize map space

## Design
- Dark theme with deep grays (#0f1117, #1a1d27) and subtle borders
- Accent colors from the legend palette
- Clean typography, generous spacing
- Map area visually dominant — everything else is secondary

## Components
- `FiltersBar` — dropdowns + reset button
- `MapView` — map image + SVG overlay with mock markers
- `Timeline` — slider + playback controls
- `Legend` — color/style key
- `SidePanel` — stats + toggles, collapsible
- `Index` — orchestrates layout and shared state via useState

## Mock Data
- Predefined list of events with x/y coordinates, type, timestamp, and human/bot flag
- Mock match list, map list, and date options for dropdowns

