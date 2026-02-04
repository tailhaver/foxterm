from ._foxterm_error import FoxtermError


class ServerError(FoxtermError):
    """
    Raises an error that will return a response with code HTTP 500: Internal Server Error.

    Default message: "An internal server error has occurred."
    """

    def __init__(self, error_message: str | None = None) -> None:
        if error_message is None:
            error_message = "An internal server error has occurred."
        super().__init__(500, error_message)
