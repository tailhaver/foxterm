from dataclasses import dataclass


@dataclass(kw_only=True)
class FoxtermResponse:
    """
    Base dataclass for all responses from the Foxterm backend. Each kwarg is a key in
    the response's JSON object.

    Keys:
        success (bool)
    """

    success: bool
