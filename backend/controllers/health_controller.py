from fastapi import Request

from middlewares.exceptions import CustomException, InternalServerError
from services.health_services import get_health_service, get_ready_service
from utils.helpers import format_response


# -------------------------------------------------------------------
# HEALTH
# -------------------------------------------------------------------
async def health_controller(request: Request | None = None):
    try:
        result = await get_health_service()
        return format_response(result, 200, "Service is healthy")
    except CustomException:
        raise
    except Exception as exc:
        raise InternalServerError(str(exc))


# -------------------------------------------------------------------
# READY
# -------------------------------------------------------------------
async def ready_controller(request: Request | None = None):
    try:
        result = await get_ready_service()
        return format_response(result, 200, "Service is ready")
    except CustomException:
        raise
    except Exception as exc:
        raise InternalServerError(str(exc))
