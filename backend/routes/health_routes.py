from controllers.health_controller import health_controller, ready_controller
from utils.router_config import create_router


router = create_router(tags=["Health"])


# -------------------------------------------------------------------
# ROUTES
# -------------------------------------------------------------------
@router.get("/health")
async def health_route():
    return await health_controller()


@router.get("/ready")
async def ready_route():
    return await ready_controller()
