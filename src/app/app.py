from __future__ import annotations

import re

from quart import Quart
from quart_auth import QuartAuth
from quart_cors import cors

from src.auth import User
from src.blueprints import blueprints

from .middleware import ASGIMiddleware
from .static import static


def create_app(import_name: str) -> Quart:
    app = Quart(import_name)
    app.config.from_prefixed_env("QUART")
    app.asgi_app = ASGIMiddleware(app.asgi_app)
    if app.config["DEBUG"]:
        config_mode = "Development"
        app.logger.info("Loading Development configuration...")
    else:
        config_mode = "Production"
        app = cors(app, allow_origin=re.compile("https://*.yip.cat*"))
    app.config.from_object(f"src.config.{config_mode}")

    auth_manager = QuartAuth(app)
    auth_manager.user_class = User

    for blueprint in blueprints:
        app.register_blueprint(blueprint)

    app.jinja_env.globals.update(static=static)
    auth_manager.init_app(app)

    return app
