from dataclasses import dataclass

from src.responses._base_response import FoxtermResponse


@dataclass(kw_only=True)
class ErrorResponse(FoxtermResponse):
<<<<<<< HEAD
    """
    Base error response from the Foxterm backend. Each kwarg is a key in
    the response's JSON object.

    Keys:
        success (bool) = False
        error (str)
    """

=======
>>>>>>> 15f0347 (add responses/ folder, move blueprints into dedicated blueprint.py file)
    success: bool = False
    error: str
