from dataclasses import dataclass


@dataclass(kw_only=True)
class FoxtermResponse:
<<<<<<< HEAD
    """
    Base dataclass for all responses from the Foxterm backend. Each kwarg is a key in
    the response's JSON object.

    Keys:
        success (bool)
    """

=======
>>>>>>> 15f0347 (add responses/ folder, move blueprints into dedicated blueprint.py file)
    success: bool
