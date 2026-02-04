from dataclasses import dataclass

from src.responses._base_response import FoxtermResponse


@dataclass(kw_only=True)
class SuccessResponse(FoxtermResponse):
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> ddaec17 (docs: add docstrings for middleware, `src.errors`, and `src.responses`)
    """
    Base success response from the Foxterm backend. Each kwarg is a key in
    the response's JSON object.

    Keys:
        success (bool) = True
    """

<<<<<<< HEAD
=======
>>>>>>> 15f0347 (add responses/ folder, move blueprints into dedicated blueprint.py file)
=======
>>>>>>> ddaec17 (docs: add docstrings for middleware, `src.errors`, and `src.responses`)
    success: bool = True
