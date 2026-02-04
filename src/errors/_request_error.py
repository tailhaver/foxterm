from ._foxterm_error import FoxtermError


class RequestError(FoxtermError):
    """
    Raises an error that will return a response with code HTTP 400: Bad Request.

    Default message: "Malformed Request."
    """

    def __init__(self, error_message: str | None = None) -> None:
        if error_message is None:
            error_message = "Malformed request."
        super().__init__(400, error_message)
