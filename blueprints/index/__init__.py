from quart import Blueprint, render_template, request

blueprint = Blueprint(
    'index', 
    __name__,
    template_folder='templates',
    static_folder='static',
    static_url_path='/static/index'
)

@blueprint.route('/')
async def index():
    return await render_template('index.jinja')

@blueprint.route('/legacy')
async def legacy():
    return await render_template('legacy.jinja')