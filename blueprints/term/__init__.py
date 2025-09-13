from quart import Blueprint, request, current_app
import logging
import os

blueprint = Blueprint(
    'term',
    __name__,
    template_folder='templates',
    static_folder='static',
    static_url_path='/static/term'
)
logger = None

@blueprint.route('/ls', methods=['GET'])
async def ls():
    cwd = request.args.get("cwd")
    path = request.args.get("path")
    home = "static/filesystem"
    cwd = cwd.replace("~", home).rstrip("/")
    searchpath = ""
    if path is None:
        searchpath = f"{cwd}"
    elif not isinstance(path, str):
        return "", 400
    elif path[0] == "/":
        searchpath = f"{home}{path}"
    else:
        searchpath = f"{cwd}/{path}"
    if not os.path.exists(searchpath):
        return "", 404
    files = os.listdir(searchpath)
    return {k: {"isDir": os.path.isdir(f"{searchpath}/{k}")} for k in files}    
    # if isinstance(path, str): 
    #     path = path.rstrip("/")
    # if path is not None and os.path.isdir(f"{home}/{path}"):
    #     home = f"{home}/{path}"
    # files = os.listdir(home)
    # return {k: {"isDir": os.path.isdir(f"{home}/{k}")} for k in files}

@blueprint.route('/cat', methods=['GET'])
async def cat():
    cwd = request.args.get("cwd")
    path = request.args.get("path")
    if cwd is None or path is None:
        return "", 400
    home = "static/filesystem"
    cwd = cwd.replace("~", "").rstrip("/")
    filepath = f"{home}/{cwd + '/' if cwd else ''}{path}"
    if not os.path.exists(filepath):
        return "", 404
    with open(filepath, "r", encoding="utf-8") as fp:
        lines = fp.readlines()
    return lines
    
@blueprint.route('/cd', methods=['GET'])
async def cd():
    home = "static/filesystem"
    cwd = request.args.get("cwd")
    path = request.args.get("path", "")
    if cwd is None or path is None:
        return "", 400
    if path == "~":
        filepath = f"{home}"
    elif path[0] == "/":
        filepath = f"{home}{path}"
    else:
        cwd = cwd.replace("~", "").rstrip("/")
        filepath = f"{home}/{cwd + '/' if cwd else ''}{path}"
    if not os.path.isdir(filepath):
        return "", 403
    return "", 200

@blueprint.before_app_serving
def after():
    global logger
    logger = current_app.logger
