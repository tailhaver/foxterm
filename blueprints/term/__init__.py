from quart import Blueprint, request, current_app
import os

from about import is_dev, version

blueprint = Blueprint(
    'term',
    __name__,
    template_folder='templates',
    static_folder='static',
    static_url_path='/static/term'
)
logger = None

links = {
    "readme.md": "README.md"
}

@blueprint.route('/ls', methods=['GET'])
async def ls():
    cwd = request.args.get("cwd")
    path = request.args.get("path")
    home = "static/filesystem"
    cwd = cwd.replace("~", home).rstrip("/")
    searchpath = ""
    if path is None:
        searchpath = f"{cwd}"
    elif ".." in path or ".." in cwd:
        return "", 403
    elif not isinstance(path, str):
        return "", 400
    elif path[0] == "/":
        searchpath = f"{home}{path}"
    else:
        searchpath = f"{cwd}/{path}"
    if not os.path.exists(searchpath):
        return "", 404
    logger.info(os.path.abspath(searchpath))
    files = [*os.listdir(searchpath), *links.keys()]
    return {k: {"isDir": os.path.isdir(f"{searchpath}/{k}")} for k in files}

def _replace_data(line: str):
    if "<{version}>" in line:
        line = line.replace("<{version}>", version)
    return line

@blueprint.route('/cat', methods=['GET'])
async def cat():
    cwd = request.args.get("cwd")
    path = request.args.get("path")
    if cwd is None or path is None:
        return "", 400
    if ".." in path or ".." in cwd:
        return "", 403
    home = "static/filesystem"
    cwd = cwd.replace("~", "").rstrip("/")
    if path.lower() in links.keys():
        filepath = links[path.lower()]
    else:
        filepath = f"{home}/{cwd + '/' if cwd else ''}{path}"
    if not os.path.exists(filepath):
        return "", 404
    with open(filepath, "r", encoding="utf-8") as fp:
        lines = fp.readlines()
    for line in list(filter(lambda e: "<{" in e and "}>" in e, lines)):
        index = lines.index(line)
        lines[index] = _replace_data(line)
    return lines
    
@blueprint.route('/cd', methods=['GET'])
async def cd():
    home = "static/filesystem"
    cwd = request.args.get("cwd")
    path = request.args.get("path", "")
    if cwd is None or path is None:
        return "", 400
    if len(path) == 0:
        return "", 400
    elif path == "~":
        filepath = f"{home}"
    elif path[0] == "/":
        filepath = f"{home}{path}"
    else:
        cwd = cwd.replace("~", "").rstrip("/")
        filepath = f"{home}/{cwd + '/' if cwd else ''}{path}"
    if not os.path.isdir(filepath):
        return "", 403
    return "", 200

@blueprint.route('/login-text', methods=["GET"])
async def login_text():
    commit_hash = ""
    if os.path.exists(".git/refs/heads/dev"):
        with open(".git/refs/heads/dev") as fp:
            commit_hash = fp.readline().strip("\n")
        
    return f"foxterm {version}{' dev' if is_dev else ''}" + \
        f"{' build ]8;;https://github.com/tailhaver/foxterm/commit/' + commit_hash + "\\" + commit_hash[:7] + "]8;;\\" if commit_hash else ''}" + \
        "\r\npowered by ]8;;https://xtermjs.org/\\xterm.js]8;;", 200

@blueprint.before_app_serving
def after():
    global logger
    logger = current_app.logger
