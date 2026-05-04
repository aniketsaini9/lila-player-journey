class CustomException(Exception):
    def __init__(
        self,
        message: str,
        status_code: int,
        error_type: str,
        details: list | None = None,
    ):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.error_type = error_type
        self.details = details or []


class BadRequest(CustomException):
    def __init__(self, message: str = "Bad request", details: list | None = None):
        super().__init__(message, 400, "Bad Request", details)


class UnauthorizedException(CustomException):
    def __init__(self, message: str = "Unauthorized", details: list | None = None):
        super().__init__(message, 401, "Unauthorized", details)


class ForbiddenException(CustomException):
    def __init__(self, message: str = "Forbidden", details: list | None = None):
        super().__init__(message, 403, "Forbidden", details)


class ResourceNotFound(CustomException):
    def __init__(self, message: str = "Resource not found", details: list | None = None):
        super().__init__(message, 404, "Not Found", details)


class ValidationException(CustomException):
    def __init__(self, message: str = "Validation failed", details: list | None = None):
        super().__init__(message, 422, "Validation Error", details)


class InternalServerError(CustomException):
    def __init__(self, message: str = "Internal server error", details: list | None = None):
        super().__init__(message, 500, "Internal Server Error", details)
