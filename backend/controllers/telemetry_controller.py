from fastapi import Request

from middlewares.exceptions import CustomException, InternalServerError
from models.telemetry_model import EventsQueryParams, HeatmapQueryParams, MatchesQueryParams
from services.telemetry_services import (
    get_events_service,
    get_heatmap_service,
    get_maps_service,
    get_matches_service,
    get_summary_service,
)
from utils.helpers import format_response


# -------------------------------------------------------------------
# SUMMARY
# -------------------------------------------------------------------
async def get_summary_controller(request: Request):
    try:
        result = await get_summary_service()
        return format_response(result, 200, "Summary fetched successfully")
    except CustomException:
        raise
    except Exception as exc:
        raise InternalServerError(str(exc))


# -------------------------------------------------------------------
# MATCHES
# -------------------------------------------------------------------
async def get_matches_controller(request: Request, params: MatchesQueryParams):
    try:
        result = await get_matches_service(params)
        return format_response(result, 200, "Matches fetched successfully")
    except CustomException:
        raise
    except Exception as exc:
        raise InternalServerError(str(exc))


# -------------------------------------------------------------------
# EVENTS
# -------------------------------------------------------------------
async def get_events_controller(request: Request, params: EventsQueryParams):
    try:
        result = await get_events_service(params)
        return format_response(result, 200, "Events fetched successfully")
    except CustomException:
        raise
    except Exception as exc:
        raise InternalServerError(str(exc))


# -------------------------------------------------------------------
# MAPS
# -------------------------------------------------------------------
async def get_maps_controller(request: Request):
    try:
        result = await get_maps_service()
        return format_response(result, 200, "Maps fetched successfully")
    except CustomException:
        raise
    except Exception as exc:
        raise InternalServerError(str(exc))


# -------------------------------------------------------------------
# HEATMAP
# -------------------------------------------------------------------
async def get_heatmap_controller(request: Request, params: HeatmapQueryParams):
    try:
        result = await get_heatmap_service(params)
        return format_response(result, 200, "Heatmap events fetched successfully")
    except CustomException:
        raise
    except Exception as exc:
        raise InternalServerError(str(exc))
