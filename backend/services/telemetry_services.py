from datetime import datetime

from middlewares.exceptions import BadRequest, ResourceNotFound
from models.telemetry_model import EventsQueryParams, HeatmapQueryParams, MatchesQueryParams
from repositories.telemetry_repository import (
    find_map_by_id,
    get_summary,
    list_events,
    list_heatmap_events,
    list_maps,
    list_matches,
)


# -------------------------------------------------------------------
# SUMMARY
# -------------------------------------------------------------------
async def get_summary_service():
    return get_summary()


# -------------------------------------------------------------------
# MATCHES
# -------------------------------------------------------------------
async def get_matches_service(params: MatchesQueryParams):
    if params.map_id and not find_map_by_id(params.map_id):
        raise ResourceNotFound("Map not found")

    if params.date:
        _validate_date(params.date)

    return list_matches(map_id=params.map_id, date=params.date)


# -------------------------------------------------------------------
# EVENTS
# -------------------------------------------------------------------
async def get_events_service(params: EventsQueryParams):
    if params.map_id and not find_map_by_id(params.map_id):
        raise ResourceNotFound("Map not found")

    if params.date:
        _validate_date(params.date)

    if params.start_ts is not None and params.end_ts is not None and params.start_ts > params.end_ts:
        raise BadRequest("start_ts must be less than or equal to end_ts")

    return list_events(
        map_id=params.map_id,
        date=params.date,
        match_id=params.match_id,
        event_type=params.event_type,
        start_ts=params.start_ts,
        end_ts=params.end_ts,
        limit=params.limit,
    )


# -------------------------------------------------------------------
# MAPS
# -------------------------------------------------------------------
async def get_maps_service():
    return list_maps()


# -------------------------------------------------------------------
# HEATMAP
# -------------------------------------------------------------------
async def get_heatmap_service(params: HeatmapQueryParams):
    if params.map_id and not find_map_by_id(params.map_id):
        raise ResourceNotFound("Map not found")

    return list_heatmap_events(map_id=params.map_id, event_type=params.event_type)


# -------------------------------------------------------------------
# HELPERS
# -------------------------------------------------------------------
def _validate_date(value: str):
    try:
        datetime.strptime(value, "%Y-%m-%d")
    except ValueError as exc:
        raise BadRequest("date must be in YYYY-MM-DD format") from exc
