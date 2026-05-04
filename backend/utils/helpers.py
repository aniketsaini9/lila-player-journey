from datetime import date, datetime

from fastapi.responses import JSONResponse


# -------------------------------------------------------------------
# SERIALIZATION
# -------------------------------------------------------------------
def serialize_value(value):
    if isinstance(value, datetime):
        return value.isoformat()
    if isinstance(value, date):
        return value.isoformat()
    if isinstance(value, dict):
        return {key: serialize_value(item) for key, item in value.items()}
    if isinstance(value, list):
        return [serialize_value(item) for item in value]
    if isinstance(value, set):
        return [serialize_value(item) for item in sorted(value)]
    return value


# -------------------------------------------------------------------
# RESPONSE
# -------------------------------------------------------------------
def format_response(data, status_code: int = 200, message: str = "Success"):
    return JSONResponse(
        status_code=status_code,
        content={
            "success": True,
            "status_code": status_code,
            "message": message,
            "data": serialize_value(data),
        },
    )
