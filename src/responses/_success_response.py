from dataclasses import dataclass

from src.responses._base_response import FoxtermResponse


@dataclass(kw_only=True)
class SuccessResponse(FoxtermResponse):
    """
    Base success response from the Foxterm backend. Each kwarg is a key in
    the response's JSON object.

    Keys:
        success (bool) = True
    """

    success: bool = True
