from typing import Optional

from pydantic import BaseModel, Field, field_validator


class MatchesQueryParams(BaseModel):
    map_id: Optional[str] = None
    date: Optional[str] = None

    @field_validator("map_id", "date")
    @classmethod
    def strip_optional_strings(cls, value: Optional[str]):
        if value is None:
            return None
        value = value.strip()
        return value or None


class EventsQueryParams(BaseModel):
    map_id: Optional[str] = None
    date: Optional[str] = None
    match_id: Optional[str] = None
    event_type: Optional[str] = None
    start_ts: Optional[int] = None
    end_ts: Optional[int] = None
    limit: int = Field(default=5000, ge=1, le=10000)

    @field_validator("map_id", "date", "match_id", "event_type")
    @classmethod
    def strip_event_filters(cls, value: Optional[str]):
        if value is None:
            return None
        value = value.strip()
        return value or None


class HeatmapQueryParams(BaseModel):
    map_id: Optional[str] = None
    event_type: Optional[str] = "Kill"

    @field_validator("map_id", "event_type")
    @classmethod
    def strip_heatmap_filters(cls, value: Optional[str]):
        if value is None:
            return None
        value = value.strip()
        return value or None
