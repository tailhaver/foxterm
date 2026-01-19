class FoxtermError(Exception):
    def __init__(self, status_code: int, error: str | Exception) -> None:
        if isinstance(error, Exception):
            error = str(error)
        self.status_code = status_code
        self.error = error
