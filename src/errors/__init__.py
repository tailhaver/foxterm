__all__ = [
    "FoxtermError",
    "PermissionError",
    "RequestError",
    "ServerError",
    "UnauthorizedError",
]
from ._foxterm_error import FoxtermError
from ._permission_error import PermissionError
from ._request_error import RequestError
from ._server_error import ServerError
from ._unauthorized_error import UnauthorizedError
