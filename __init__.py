from logging import getLogger
from os import environ

from dotenv import load_dotenv

from src.app import create_app

load_dotenv()

app = create_app(__name__)

if __name__ == "__main__":
    if app.config["DEBUG"]:
        app.run(port=environ.get("PORT", 5000))
    else:
        getLogger("hypercorn.access").disabled = True
        getLogger("hypercorn.error").disabled = True
        app.run(host="127.0.0.1", port=environ.get("PORT", 80))
