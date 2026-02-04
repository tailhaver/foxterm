from ._foxterm_error import FoxtermError


class PermissionError(FoxtermError):
    """
    Raises an error that will return a response with code HTTP 403: Forbidden.

    Default message: "You do not have permission to run this command."
    """

    def __init__(self, error_message: str | None = None) -> None:
        if error_message is None:
            error_message = "You do not have permission to run this command."
        super().__init__(403, error_message)
