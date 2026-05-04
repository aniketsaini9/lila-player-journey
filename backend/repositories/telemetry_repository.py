from typing import Optional

from database.database import EVENTS, MATCHES, SUMMARY


# -------------------------------------------------------------------
# SUMMARY
# -------------------------------------------------------------------
def get_summary():
    return SUMMARY


# -------------------------------------------------------------------
# MATCHES
# -------------------------------------------------------------------
def list_matches(map_id: Optional[str] = None, date: Optional[str] = None):
    result = MATCHES
    if map_id:
        result = [item for item in result if item["map_id"] == map_id]
    if date:
        result = [item for item in result if item["date"] == date]
    return result


# -------------------------------------------------------------------
# EVENTS
# -------------------------------------------------------------------
def list_events(
    map_id: Optional[str] = None,
    date: Optional[str] = None,
    match_id: Optional[str] = None,
    event_type: Optional[str] = None,
    start_ts: Optional[int] = None,
    end_ts: Optional[int] = None,
    limit: int = 5000,
):
    result = EVENTS

    if map_id:
        result = [item for item in result if item["map_id"] == map_id]
    if date:
        result = [item for item in result if item["date"] == date]
    if match_id:
        result = [item for item in result if item["match_id"] == match_id]
    if event_type:
        result = [item for item in result if item["event"] == event_type]
    if start_ts is not None:
        result = [item for item in result if item["ts_ms"] >= start_ts]
    if end_ts is not None:
        result = [item for item in result if item["ts_ms"] <= end_ts]

    return result[:limit]


# -------------------------------------------------------------------
# MAPS
# -------------------------------------------------------------------
def list_maps():
    maps = {}

    for item in MATCHES:
        map_id = item["map_id"]
        date = item["date"]

        if map_id not in maps:
            maps[map_id] = {
                "map_id": map_id,
                "dates": set(),
                "total_matches": 0,
            }

        maps[map_id]["dates"].add(date)
        maps[map_id]["total_matches"] += 1

    result = []
    for map_id, data in maps.items():
        ext = "jpg" if map_id == "Lockdown" else "png"
        result.append(
            {
                "map_id": map_id,
                "dates": sorted(list(data["dates"])),
                "total_matches": data["total_matches"],
                "minimap_url": f"/maps/{map_id}_Minimap.{ext}",
            }
        )

    return result


# -------------------------------------------------------------------
# HEATMAP
# -------------------------------------------------------------------
def list_heatmap_events(map_id: Optional[str] = None, event_type: Optional[str] = "Kill"):
    result = EVENTS

    if map_id:
        result = [item for item in result if item["map_id"] == map_id]
    if event_type:
        result = [item for item in result if item["event"] == event_type]

    return result


# -------------------------------------------------------------------
# LOOKUPS
# -------------------------------------------------------------------
def find_map_by_id(map_id: str):
    for item in MATCHES:
        if item["map_id"] == map_id:
            return {"map_id": map_id}
    return None
