from ._foxterm_error import FoxtermError


class ServerError(FoxtermError):
    def __init__(self, error_message: str | None = None) -> None:
        if error_message is None:
            error_message = "An internal server error has occurred."
        super().__init__(500, error_message)
