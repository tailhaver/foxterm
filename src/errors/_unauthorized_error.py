from ._foxterm_error import FoxtermError


class UnauthorizedError(FoxtermError):
    """
    Raises an error that will return a response with code HTTP 401: Unauthorized.

    Default message: "You are not authorized to run this command."
    """

    def __init__(self, error_message: str | Exception | None = None) -> None:
        if error_message is None:
            error_message = "You are not authorized to run this command."
        super().__init__(401, error_message)
