from __future__ import annotations

from quart import Blueprint, render_template, request

from src.errors import FoxtermError

blueprint = Blueprint("error_handler", __name__)


@blueprint.app_errorhandler(404)
async def http_404_handler(e: Exception):  # noqa: ARG001
    return await render_template("404.jinja", page=request.host), 404


@blueprint.app_errorhandler(FoxtermError)
async def foxterm_error_handler(e: FoxtermError):
    return {"success": False, "error": e.error}, e.status_code
