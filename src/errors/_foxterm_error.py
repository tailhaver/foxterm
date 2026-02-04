class FoxtermError(Exception):
    """
    Default error class used to return a JSON object with error information
    from a Foxterm backend request rather than returning one manually.
    """

    def __init__(self, status_code: int, error: str | Exception) -> None:
        """Throws an error to be caught by the Quart application, to return a set
        JSON object and status code.

        Args:
            status_code (int): HTTP status code to return the response with.
            error (str | Exception): An error string, or an Exception to be stringified.
        """
        if isinstance(error, Exception):
            error = str(error)
        self.status_code = status_code
        self.error = error
