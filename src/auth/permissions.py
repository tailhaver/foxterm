class Permissions:
    DEFAULT = 1
    ADMIN = 2
    VIEW_USERS = 4
    MODIFY_USERS = 8
    UPLOAD_IMAGES = 16

    @staticmethod
    def sort() -> list:
        """Sorts a list of all available permissions by their value, making for
        easier indexing without knowing the name.

        Returns:
            list: Sorted list of all Permission integer values
        """
        # tl;dr: shitty list comprehension that returns only uppercase, non_private variables
        # DO NOT DO THIS! THIS IS BAD!!!!! probably. idk im just a fox dont listen to me
        _current = [
            value
            for name, value in vars(Permissions).items()
            if not name.startswith("_") and name.isupper()
        ]
        return sorted(_current)
