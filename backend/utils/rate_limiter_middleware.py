from fastapi.responses import JSONResponse

try:
    from slowapi import Limiter
    from slowapi.errors import RateLimitExceeded
    from slowapi.middleware import SlowAPIMiddleware
    from slowapi.util import get_remote_address
except ImportError:  # pragma: no cover - optional dependency
    class _NoOpLimiter:
        def limit(self, _limit: str):
            def decorator(func):
                return func

            return decorator

    limiter = _NoOpLimiter()

    def init_rate_limiter(app):
        app.state.limiter = limiter

else:
    limiter = Limiter(key_func=get_remote_address)

    def init_rate_limiter(app):
        app.state.limiter = limiter
        app.add_middleware(SlowAPIMiddleware)

        @app.exception_handler(RateLimitExceeded)
        async def rate_limit_handler(request, exc):
            return JSONResponse(
                status_code=429,
                content={
                    "success": False,
                    "status_code": 429,
                    "error_type": "Rate Limit Exceeded",
                    "message": "Too many requests. Please try again later.",
                    "details": [],
                },
            )
