from __future__ import annotations

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from hypercorn.typing import (
        ASGIFramework,
        ASGIReceiveCallable,
        ASGISendCallable,
        HTTPScope,
    )

__all__ = ["ASGIMiddleware"]


class ASGIMiddleware:
    """
    Custom middleware to remove "dev." subdomain from HTTP requests.

    Entirely optional, but used to host a redirect from dev.site.tld to site.tld
    through something like CloudFlare
    """

    # this is my baby. she is deformed.
    # be nice to my baby.
    def __init__(self, app: ASGIFramework) -> None:
        self.app = app

    async def inner(self, scope: HTTPScope):
        if scope["type"] != "http":
            return scope
        headers = scope.get("headers", [])
        host = (list(filter(lambda e: e[0] == b"host", headers)) or [None])[0]
        if host is None or len(host) != 2:
            return scope
        if host[1].decode().startswith("dev."):
            index = headers.index(host)
            host = (host[0], host[1].decode().replace("dev.", "").encode())
            headers[index] = host
            scope["headers"] = headers
        return scope

    async def __call__(
        self, scope: HTTPScope, recv: ASGIReceiveCallable, send: ASGISendCallable
    ) -> None:
        scope = await self.inner(scope)
        await self.app(scope, recv, send)
