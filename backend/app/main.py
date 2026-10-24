import logging
from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.concurrency import run_in_threadpool
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.api import health
from app.config import get_settings
from app.database import check_database, dispose_engine
from app.logging_config import configure_logging

settings = get_settings()
configure_logging(settings.log_level)
logger = logging.getLogger("eklik")


def error_response(status_code: int, code: str, message: str, **extra: object) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={"error": {"code": code, "message": message, **extra}},
    )


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    logger.info("Starting %s v%s (%s)", settings.app_name, settings.app_version, settings.app_env)
    if not await run_in_threadpool(check_database):
        logger.warning("Database unreachable at startup; running in degraded mode.")
    yield
    dispose_engine()
    logger.info("Shutdown complete.")


async def limit_request_size(request: Request, call_next):
    """Reject requests whose declared body size exceeds the configured limit.

    This checks Content-Length only. In production, also enforce a body limit
    at the reverse proxy (for example nginx client_max_body_size).
    """
    content_length = request.headers.get("content-length")
    if content_length is not None:
        try:
            if int(content_length) > settings.max_request_bytes:
                return error_response(413, "payload_too_large", "Request body is too large.")
        except ValueError:
            return error_response(400, "bad_request", "Invalid Content-Length header.")
    return await call_next(request)


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(_request: Request, exc: StarletteHTTPException) -> JSONResponse:
        return error_response(exc.status_code, "http_error", str(exc.detail))

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(_request: Request, exc: RequestValidationError) -> JSONResponse:
        issues = [
            {"field": ".".join(str(part) for part in err["loc"]), "message": err["msg"]}
            for err in exc.errors()
        ]
        return error_response(422, "validation_error", "Request validation failed.", details=issues)

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        logger.exception("Unhandled error on %s %s", request.method, request.url.path)
        return error_response(500, "internal_error", "Something went wrong on the server.")


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        lifespan=lifespan,
        docs_url="/docs" if settings.debug else None,
        redoc_url=None,
        openapi_url="/openapi.json" if settings.debug else None,
    )

    # Middleware added last runs outermost. The size limit is added first so CORS
    # wraps it, which means even 413 responses carry CORS headers.
    app.middleware("http")(limit_request_size)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=False,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["Content-Type", "Accept"],
    )

    register_exception_handlers(app)
    app.include_router(health.router)
    return app


app = create_app()
