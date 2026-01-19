from ._foxterm_error import FoxtermError


class UnauthorizedError(FoxtermError):
    def __init__(self, error_message: str | Exception | None = None) -> None:
        if error_message is None:
            error_message = "You are not authorized to run this command."
        super().__init__(401, error_message)
