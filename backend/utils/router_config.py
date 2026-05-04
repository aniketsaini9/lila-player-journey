from fastapi import APIRouter


# -------------------------------------------------------------------
# ROUTER FACTORY
# -------------------------------------------------------------------
def create_router(prefix: str = "", tags: list | None = None) -> APIRouter:
    return APIRouter(prefix=prefix, tags=tags or [])
