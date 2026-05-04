import os
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from middlewares.authenticator_middleware import AuthenticatorMiddleware
from middlewares.exception_handler import ExceptionHandlerMiddleware
from middlewares.exceptions import CustomException
from middlewares.logger_middleware import LoggerMiddleware
from routes.health_routes import router as health_router
from routes.telemetry_routes import router as telemetry_router
from utils.rate_limiter_middleware import init_rate_limiter

try:
    from dotenv import load_dotenv
except ImportError:  # pragma: no cover - optional dependency
    def load_dotenv():
        return False


# -------------------------------------------------------------------
# CONFIGURATION
# -------------------------------------------------------------------
load_dotenv()

APP_NAME = os.getenv("APP_NAME", "LILA BLACK Data API")
API_PREFIX = os.getenv("API_PREFIX", "/lila-black/api/v1")
LEGACY_API_PREFIX = os.getenv("LEGACY_API_PREFIX", "/api")
DOCS_PREFIX = os.getenv("DOCS_PREFIX", "/lila-black")
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", "*").split(",")
    if origin.strip()
]


# -------------------------------------------------------------------
# APPLICATION
# -------------------------------------------------------------------
app = FastAPI(
    title=APP_NAME,
    docs_url=f"{DOCS_PREFIX}/docs",
    redoc_url=f"{DOCS_PREFIX}/redoc",
    openapi_url=f"{DOCS_PREFIX}/openapi.json",
    swagger_ui_parameters={"persistAuthorization": True},
)

init_rate_limiter(app)


def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    schema = get_openapi(title=app.title, version="1.0.0", routes=app.routes)
    schema["components"] = schema.get("components", {})
    schema["components"]["securitySchemes"] = {
        "BearerAuth": {"type": "http", "scheme": "bearer", "bearerFormat": "JWT"}
    }
    schema["security"] = [{"BearerAuth": []}]
    app.openapi_schema = schema
    return schema


app.openapi = custom_openapi


# -------------------------------------------------------------------
# EXCEPTION HANDLERS
# -------------------------------------------------------------------
@app.exception_handler(CustomException)
async def custom_exception_handler(request: Request, exc: CustomException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "status_code": exc.status_code,
            "error_type": exc.error_type,
            "message": exc.message,
            "details": exc.details,
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    first_error = exc.errors()[0] if exc.errors() else {}
    message = first_error.get("msg", "Invalid request data").replace("Value error, ", "").strip()
    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "status_code": 422,
            "error_type": "Validation Error",
            "message": message,
            "details": exc.errors(),
        },
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "status_code": exc.status_code,
            "error_type": "HTTP Error",
            "message": exc.detail,
            "details": [],
        },
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "status_code": 500,
            "error_type": "Internal Server Error",
            "message": "Something went wrong",
            "details": [],
        },
    )


# -------------------------------------------------------------------
# STATIC FILES
# -------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent
MINIMAPS_DIR = BASE_DIR / "minimaps"
app.mount("/maps", StaticFiles(directory=MINIMAPS_DIR), name="maps")


# -------------------------------------------------------------------
# ROUTERS
# -------------------------------------------------------------------
app.include_router(health_router)
app.include_router(telemetry_router, prefix=API_PREFIX)
app.include_router(telemetry_router, prefix=LEGACY_API_PREFIX)


# -------------------------------------------------------------------
# MIDDLEWARES
# -------------------------------------------------------------------
app.add_middleware(AuthenticatorMiddleware)
app.add_middleware(ExceptionHandlerMiddleware)
app.add_middleware(LoggerMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS if ALLOWED_ORIGINS != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
