import os

import anyio
from quart import Blueprint, current_app, request
from quart_auth import current_user
from sqlalchemy import func, select

import src.errors as errors
from src.about import is_dev, version
from src.auth import Permissions
from src.database import Session, User
from src.responses import SuccessResponse

links = {"readme.md": "README.md"}

blueprint = Blueprint(
    "term",
    __name__,
    template_folder="templates",
    static_folder="static",
    static_url_path="/static/term",
)
logger = None


@blueprint.before_app_serving
def after():
    global logger
    logger = current_app.logger


@blueprint.route("/ls", methods=["GET"])
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
<<<<<<< HEAD
    if not await anyio.Path(searchpath).exists():
        return "", 404
    files = [*os.listdir(searchpath), *links.keys()]
    return {k: {"isDir": await anyio.Path(f"{searchpath}/{k}").is_dir()} for k in files}
=======
    if not os.path.exists(searchpath):
        return "", 404
    logger.info(os.path.abspath(searchpath))
    files = [*os.listdir(searchpath), *links.keys()]
    return {k: {"isDir": os.path.isdir(f"{searchpath}/{k}")} for k in files}
>>>>>>> 15f0347 (add responses/ folder, move blueprints into dedicated blueprint.py file)


def _replace_data(line: str) -> str:
    if "<{version}>" in line:
        line = line.replace("<{version}>", version)
    return line


@blueprint.route("/cat", methods=["GET"])
async def cat():
    cwd = request.args.get("cwd")
    path = request.args.get("path")
    if cwd is None or path is None:
        return "", 400
    if ".." in path or ".." in cwd:
        return "", 403
    home = "static/filesystem"
    cwd = cwd.replace("~", "").rstrip("/")
    if path.lower() in links:
        filepath = links[path.lower()]
    else:
        filepath = f"{home}/{cwd + '/' if cwd else ''}{path}"
<<<<<<< HEAD

    if not await anyio.Path(filepath).exists():
=======
    if not os.path.exists(filepath):
>>>>>>> 15f0347 (add responses/ folder, move blueprints into dedicated blueprint.py file)
        return "", 404
    async with await anyio.open_file(filepath, encoding="utf-8") as fp:
        lines = await fp.readlines()
    for line in list(filter(lambda e: "<{" in e and "}>" in e, lines)):
        index = lines.index(line)
        lines[index] = _replace_data(line)
    return lines


@blueprint.route("/cd", methods=["GET"])
async def cd():
    home = "static/filesystem"
    cwd = request.args.get("cwd")
    path = request.args.get("path", "")
    if cwd is None or path is None:
        return "", 400
    if len(path) == 0:
        return "", 400
    if path == "~":
        filepath = f"{home}"
    elif path[0] == "/":
        filepath = f"{home}{path}"
    else:
        cwd = cwd.replace("~", "").rstrip("/")
        filepath = f"{home}/{cwd + '/' if cwd else ''}{path}"
<<<<<<< HEAD

    if not await anyio.Path(filepath).is_dir():
=======
    if not os.path.isdir(filepath):
>>>>>>> 15f0347 (add responses/ folder, move blueprints into dedicated blueprint.py file)
        return "", 403
    return "", 200


@blueprint.route("/login-text", methods=["GET"])
async def login_text():
    commit_hash = ""
<<<<<<< HEAD
    path = anyio.Path(".git/refs/heads/dev")
    if await path.exists():
        async with await anyio.open_file(path) as fp:
=======
    if os.path.exists(".git/refs/heads/dev"):
        async with await anyio.open_file(".git/refs/heads/dev") as fp:
>>>>>>> 15f0347 (add responses/ folder, move blueprints into dedicated blueprint.py file)
            commit_hash = (await fp.readline()).strip("\n")

    return (
        f"foxterm {version}{' dev' if is_dev else ''}"
        + f"{' build ]8;;https://github.com/tailhaver/foxterm/commit/' + commit_hash + '\\' + commit_hash[:7] + ']8;;\\' if commit_hash else ''}"
        + "\r\npowered by ]8;;https://xtermjs.org/\\xterm.js]8;;",
        200,
    )


@blueprint.route("/current-user", methods=["GET"])
async def get_current_user():
    return {"login": await current_user.login}  # TODO: make UserResponse obj


@blueprint.route("/admin/view_users", methods=["GET"])
async def view_users():
    if not await current_user.has_permission(
        Permissions.ADMIN | Permissions.VIEW_USERS
    ):
        raise errors.PermissionError()

    return SuccessResponse()


@blueprint.route("/admin/users-source", methods=["GET"])
async def users_source():
    if not await current_user.has_permission(
        Permissions.ADMIN | Permissions.VIEW_USERS
    ):
        raise errors.PermissionError()

    draw = int(request.args.get("draw", 0))
    start = int(request.args.get("start", 0))
    limit = int(request.args.get("length", 10))
    search_value = request.args.get("search[value]", "")
    order_dir = request.args.get("order[0][dir]", "asc")
    order_col = int(request.args.get("order[0][column]", "0"))
    filters = True
    match order_col:
        case 0:
            sort = User.id
        case 1:
            sort = User.login
        case 2:
            sort = User.permissions
        case _:
            sort = User.login
            _col = order_col - 2
            filters = User.permissions.bitwise_and(Permissions.sort()[_col])
            if order_dir == "asc":
                filters = filters == Permissions.sort()[_col]
            else:
                filters = filters != Permissions.sort()[_col]
    match order_dir:
        case "asc":
            sort = sort.asc()
        case _:
            sort = sort.desc()
    try:
        with Session() as db_session:
            data = [
                [e.id, e.login, e.permissions]
                for e in db_session.execute(
                    select(User)
                    .where(User.login.contains(search_value))
                    .where(filters)
                    .order_by(sort)
                    .offset(start)
                    .limit(limit)
                )
                .scalars()
                .all()
            ]
            total_records = db_session.scalar(select(func.count()).select_from(User))
            filtered_records = db_session.scalar(
                select(func.count())
                .select_from(User)
                .where(User.login.contains(search_value))
            )
    except Exception:
        raise errors.ServerError()
    return {  # TODO: make dataclass obj
        "draw": draw,
        "recordsTotal": total_records,
        "recordsFiltered": filtered_records,
        "data": data,
    }
