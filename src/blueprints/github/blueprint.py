from os import environ

import aiohttp
from quart import (
    Blueprint,
    make_response,
    redirect,
    render_template,
    request,
    session,
    url_for,
)
from quart_auth import AuthUser, current_user, login_required, login_user, logout_user
from sqlalchemy import update

import src.errors as errors
from src.database import Session, User
from src.responses import SuccessResponse, URLResponse

blueprint = Blueprint(
    "github",
    __name__,
    template_folder="templates",
    static_folder="static",
    static_url_path="/static/github",
)


@blueprint.route("/github/get-login-url")
async def login():
    return URLResponse(
        url=f"https://github.com/login/oauth/authorize?client_id={environ.get('GITHUB_ID')}"
    )


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
        msg = "You are not logged in!"
        raise errors.UnauthorizedError(msg)
    logout_user()
    return SuccessResponse()


@blueprint.route("/github/callback", methods=["GET"])
async def callback():
    next = session.get("next")
    request_token = request.args.get("code")

    if request_token is None:
        msg = "Bad request. Expected arguments: 'request_token'"
        raise errors.RequestError(msg)

    try:
        access_token = await get_access_token(request_token)
        user_data = await get_user_data(access_token)
    except RuntimeError as e:
        raise errors.ServerError(e)

    with Session() as db_session:
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

    if next is not None:
        return redirect(next)

    response = await make_response(redirect(url_for("github.loggedin")))
    response.set_cookie("logged_in", str(await current_user.is_authenticated))
    return response


async def get_access_token(request_token: str) -> str:
    url = f"https://github.com/login/oauth/access_token?client_id={environ.get('GITHUB_ID')}&client_secret={environ.get('GITHUB_SECRET')}&code={request_token}"
    headers = {"accept": "application/json"}
    async with (
        aiohttp.ClientSession() as session,
        await session.post(url, headers=headers) as response,
    ):
        if not response.ok:
            msg = f"Unable to get access token from GitHub OAuth login flow! Received code HTTP {response.status}."
            raise RuntimeError(msg)
        try:
            data: dict = await response.json()
        except aiohttp.ContentTypeError:
            msg = "GitHub OAuth login flow did not return a JSON object, but still returned HTTP 200. If you see this, you're fucked."
            raise RuntimeError(msg)
        if data.get("access_token") is None:
            msg = "GitHub OAuth login flow did not return an access_token, but still returned HTTP 200. What. the fuck?"
            raise RuntimeError(msg)

        return data["access_token"]


async def get_user_data(access_token: str) -> dict:
    url = "https://api.github.com/user"
    headers = {"Authorization": f"token {access_token}"}
    async with (
        aiohttp.ClientSession() as session,
        await session.get(url, headers=headers) as response,
    ):
        if not response.ok:
            msg = f"Unable to get user data from the GitHub API! Received code HTTP {response.status}."
            raise RuntimeError(msg)
        try:
            data: dict = await response.json()
        except aiohttp.ContentTypeError:
            msg = "GitHub API did not return a JSON object, but still returned HTTP 200. What the hell happened."
            raise RuntimeError(msg)
        if data.get("id") is None:
            msg = "GitHub API did not return proper user data (missing 'id'), but still returned HTTP 200. Why. What."
            raise RuntimeError(msg)
