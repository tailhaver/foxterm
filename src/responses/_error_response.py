from dataclasses import dataclass

from src.responses._base_response import FoxtermResponse


@dataclass(kw_only=True)
class ErrorResponse(FoxtermResponse):
    success: bool = False
    error: str
