from __future__ import annotations

from logging import getLogger

from src.about import is_dev
from src.app import create_app

app = create_app(__name__)

if __name__ == "__main__":
    if app.config["DEBUG"]:
        app.run(port=5000)
    else:
        getLogger("hypercorn.access").disabled = True
        getLogger("hypercorn.error").disabled = True
        app.run(host="0.0.0.0", port=80 if not is_dev else 1080)  # noqa: S104
        # TODO: fix S104 above and add port env var
