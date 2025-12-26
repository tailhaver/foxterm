import aiohttp
from quart import (
    Blueprint,
    render_template,
    request,
    session,
    redirect,
    url_for,
    make_response,
)
from quart_auth import AuthUser, login_user, logout_user, login_required, current_user
from os import environ
from sqlalchemy import update

from src.database import Session, User

blueprint = Blueprint(
    "github",
    __name__,
    template_folder="templates",
    static_folder="static",
    static_url_path="/static/github",
)


@blueprint.route("/github/get-login-url")
async def login():
    return {
        "url": f"https://github.com/login/oauth/authorize?client_id={environ.get('GITHUB_ID')}"
    }


@blueprint.route("/github/loggedin")
async def loggedin():
    return await render_template("logged_in.jinja")


@blueprint.route("/github/logout")
@login_required
async def logout():
    logout_user()
    return await render_template("logged_out.jinja")


@blueprint.route("/github/logout-term")
async def logout_term():
    if not await current_user.is_authenticated:
        return {"success": False}, 401
    logout_user()
    return {"success": True}


@blueprint.route("/github/callback", methods=["GET"])
async def callback():
    args = request.args
    next = session.get("next")
    request_token = args.get("code")

    access_token = await get_access_token(request_token)
    user_data = await get_user_data(access_token)
    if user_data.get("id") is not None:
        db_session = Session()
        if db_session.query(User).filter(User.id == user_data["id"]).count() == 0:
            db_session.add(User(id=user_data["id"], login=user_data["login"]))
        elif (
            db_session.query(User).filter(User.login == user_data["login"]).count() == 0
        ):
            db_session.execute(
                update(User)
                .where(User.id == user_data["id"])
                .values(login=user_data["login"])
            )
        db_session.commit()
        db_session.close()
    login_user(AuthUser(user_data["id"]))
    if next:
        return redirect(next)
    response = await make_response(redirect(url_for("github.loggedin")))
    response.set_cookie("logged_in", str(await current_user.is_authenticated))
    return response


async def get_access_token(request_token):
    url = f"https://github.com/login/oauth/access_token?client_id={environ.get('GITHUB_ID')}&client_secret={environ.get('GITHUB_SECRET')}&code={request_token}"
    headers = {"accept": "application/json"}
    async with aiohttp.ClientSession() as session:
        async with session.post(url, headers=headers) as response:
            return (await response.json())["access_token"]


async def get_user_data(access_token):
    url = "https://api.github.com/user"
    headers = {"Authorization": f"token {access_token}"}
    async with aiohttp.ClientSession() as session:
        async with session.get(url, headers=headers) as response:
            return await response.json()
