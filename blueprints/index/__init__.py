from quart import Blueprint, render_template, send_from_directory
from about import is_dev

blueprint = Blueprint(
    'index', 
    __name__,
    template_folder='templates',
    static_folder='static',
    static_url_path='/static/index'
)

@blueprint.route('/')
async def index():
    return await render_template('index.jinja', dev=" secret dev build" if is_dev else "")

@blueprint.route('/legacy')
async def legacy():
    return await render_template('legacy.jinja')

@blueprint.route('/88x31')
@blueprint.route('/88x31.png')
async def badge88x31():
    return await send_from_directory('static/images', file_name='88x31.png')