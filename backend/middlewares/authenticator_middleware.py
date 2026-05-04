from starlette.middleware.base import BaseHTTPMiddleware


class AuthenticatorMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        request.state.user = None
        auth_header = request.headers.get("Authorization")

        if auth_header:
            request.state.user = {"token": auth_header.replace("Bearer ", "").strip()}

        return await call_next(request)
