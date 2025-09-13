import re
from quart import Quart
from quart_cors import cors

from logging.config import dictConfig

import config

app = Quart(__name__)
app.config.from_prefixed_env('QUART')
config_mode = "Production"
if app.config['DEBUG']:
    config_mode = 'Development'
    app.logger.info("Loading Development configuration...")
else:
    app = cors(app, allow_origin=re.compile("https://*.yip.cat*"))
app.config.from_object(f"config.{config_mode}")

### build blueprints
from blueprints.index import blueprint as index_blueprint
from blueprints.term import blueprint as term_blueprint
app.register_blueprint(index_blueprint)
app.register_blueprint(term_blueprint)
###end

async def static(location=None, filename=None):
    if filename is None: 
        return
    from quart import url_for
    if location is not None:
        return url_for(f'{location}.static', filename=filename)
    return url_for('static', filename=filename)

app.jinja_env.globals.update(static=static)

if __name__ == "__main__":
    if app.config['DEBUG']:
        app.run(port=5000)
    else:
        app.run(host="0.0.0.0", port=80)