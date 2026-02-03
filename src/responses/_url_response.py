from dataclasses import dataclass

from src.responses._success_response import SuccessResponse


@dataclass(kw_only=True)
class URLResponse(SuccessResponse):
    url: str
