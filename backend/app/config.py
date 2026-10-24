from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy.engine import URL


class Settings(BaseSettings):
    """Application settings loaded from environment variables or backend/.env."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "E-KLIK API"
    app_version: str = "0.1.0"
    app_env: str = "development"
    debug: bool = False
    log_level: str = "INFO"

    db_host: str = "127.0.0.1"
    db_port: int = Field(default=3306, ge=1, le=65535)
    db_user: str = "eklik_user"
    db_password: str = ""
    db_name: str = "eklik"

    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    max_request_bytes: int = Field(default=1_048_576, ge=1_024)

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def database_url(self) -> URL:
        return URL.create(
            drivername="mysql+pymysql",
            username=self.db_user,
            password=self.db_password,
            host=self.db_host,
            port=self.db_port,
            database=self.db_name,
            query={"charset": "utf8mb4"},
        )


@lru_cache
def get_settings() -> Settings:
    return Settings()