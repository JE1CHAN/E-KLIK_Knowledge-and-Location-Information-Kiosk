from datetime import datetime
from typing import Literal

from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: Literal["ok", "degraded"]
    service: str
    version: str
    database: Literal["up", "down"]
    timestamp: datetime