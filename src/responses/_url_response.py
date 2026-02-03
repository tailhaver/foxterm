from dataclasses import dataclass

from src.responses._success_response import SuccessResponse


@dataclass(kw_only=True)
class URLResponse(SuccessResponse):
<<<<<<< HEAD
    """
    Dataclass used to return a URL from the Foxterm backend. Each kwarg is a key in
    the response's JSON object.

    This is, currently, only ever used to send the GitHub OAuth link to the frontend.

    Keys:
        success (bool) = True
        url (str)
    """

=======
>>>>>>> 15f0347 (add responses/ folder, move blueprints into dedicated blueprint.py file)
    url: str
