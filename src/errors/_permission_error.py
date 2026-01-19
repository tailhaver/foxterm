from ._foxterm_error import FoxtermError


class PermissionError(FoxtermError):
    def __init__(self, error_message: str | None = None) -> None:
        if error_message is None:
            error_message = "You do not have permission to run this command."
        super().__init__(403, error_message)
