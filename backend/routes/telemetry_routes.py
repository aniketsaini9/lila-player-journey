from typing import Optional

from fastapi import Query, Request

from controllers.telemetry_controller import (
    get_events_controller,
    get_heatmap_controller,
    get_maps_controller,
    get_matches_controller,
    get_summary_controller,
)
from models.telemetry_model import EventsQueryParams, HeatmapQueryParams, MatchesQueryParams
from utils.router_config import create_router
from utils.rate_limiter_middleware import limiter


router = create_router(tags=["Telemetry"])


# -------------------------------------------------------------------
# SUMMARY
# -------------------------------------------------------------------
@router.get("/summary")
@limiter.limit("30/minute")
async def summary_route(request: Request):
    return await get_summary_controller(request)


# -------------------------------------------------------------------
# MATCHES
# -------------------------------------------------------------------
@router.get("/matches")
@limiter.limit("30/minute")
async def matches_route(
    request: Request,
    map_id: Optional[str] = Query(None),
    date: Optional[str] = Query(None),
):
    params = MatchesQueryParams(map_id=map_id, date=date)
    return await get_matches_controller(request, params)


# -------------------------------------------------------------------
# EVENTS
# -------------------------------------------------------------------
@router.get("/events")
@limiter.limit("30/minute")
async def events_route(
    request: Request,
    map_id: Optional[str] = Query(None),
    date: Optional[str] = Query(None),
    match_id: Optional[str] = Query(None),
    event_type: Optional[str] = Query(None),
    start_ts: Optional[int] = Query(None),
    end_ts: Optional[int] = Query(None),
    limit: int = Query(5000),
):
    params = EventsQueryParams(
        map_id=map_id,
        date=date,
        match_id=match_id,
        event_type=event_type,
        start_ts=start_ts,
        end_ts=end_ts,
        limit=limit,
    )
    return await get_events_controller(request, params)


# -------------------------------------------------------------------
# MAPS
# -------------------------------------------------------------------
@router.get("/maps")
@limiter.limit("30/minute")
async def maps_route(request: Request):
    return await get_maps_controller(request)


# -------------------------------------------------------------------
# HEATMAP
# -------------------------------------------------------------------
@router.get("/heatmap")
@limiter.limit("30/minute")
async def heatmap_route(
    request: Request,
    map_id: Optional[str] = Query(None),
    event_type: Optional[str] = Query("Kill"),
):
    params = HeatmapQueryParams(map_id=map_id, event_type=event_type)
    return await get_heatmap_controller(request, params)
