import re
from quart import Quart, request, render_template
from quart_cors import cors
from quart_auth import QuartAuth

from logging import getLogger

from src.about import is_dev
from src.auth import User


class ASGIMiddleware:
    # this is my baby. she is deformed.
    # be nice to my baby.
    def __init__(self, app) -> None:
        self.app = app

    async def inner(self, scope):
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

    async def __call__(self, scope, recv, send):
        scope = await self.inner(scope)
        await self.app(scope, recv, send)


app = Quart(__name__)
app.config.from_prefixed_env("QUART")
app.asgi_app = ASGIMiddleware(app.asgi_app)
config_mode = "Production"

if app.config["DEBUG"]:
    config_mode = "Development"
    app.logger.info("Loading Development configuration...")
else:
    app = cors(app, allow_origin=re.compile("https://*.yip.cat*"))
app.config.from_object(f"src.config.{config_mode}")

auth_manager = QuartAuth(app)
auth_manager.user_class = User

from src.blueprints import (  # noqa: E402
    index_blueprint,
    term_blueprint,
    github_blueprint,
)

for blueprint in [index_blueprint, term_blueprint, github_blueprint]:
    app.register_blueprint(blueprint)


async def static(location=None, filename=None):
    if filename is None:
        return
    from quart import url_for

    if location is not None:
        return url_for(f"{location}.static", filename=filename)
    return url_for("static", filename=filename)


app.jinja_env.globals.update(static=static)
auth_manager.init_app(app)


@app.errorhandler(404)
async def http_404(e):
    return await render_template("404.jinja", page=request.host), 404


if __name__ == "__main__":
    if app.config["DEBUG"]:
        app.run(port=5000)
    else:
        getLogger("hypercorn.access").disabled = True
        getLogger("hypercorn.error").disabled = True
        app.run(host="0.0.0.0", port=80 if not is_dev else 1080)
