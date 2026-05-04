from database.database import is_dataset_ready


# -------------------------------------------------------------------
# HEALTH
# -------------------------------------------------------------------
async def get_health_service():
    return {"status": "ok", "service": "lila-black-data-api"}


# -------------------------------------------------------------------
# READY
# -------------------------------------------------------------------
async def get_ready_service():
    return {
        "status": "ready" if is_dataset_ready() else "degraded",
        "datasets_loaded": is_dataset_ready(),
    }
