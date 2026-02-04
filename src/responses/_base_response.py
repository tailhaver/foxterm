from dataclasses import dataclass


@dataclass(kw_only=True)
class FoxtermResponse:
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> ddaec17 (docs: add docstrings for middleware, `src.errors`, and `src.responses`)
    """
    Base dataclass for all responses from the Foxterm backend. Each kwarg is a key in
    the response's JSON object.

    Keys:
        success (bool)
    """

<<<<<<< HEAD
=======
>>>>>>> 15f0347 (add responses/ folder, move blueprints into dedicated blueprint.py file)
=======
>>>>>>> ddaec17 (docs: add docstrings for middleware, `src.errors`, and `src.responses`)
    success: bool
