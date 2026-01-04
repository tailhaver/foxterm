class Permissions:
    DEFAULT = 1
    ADMIN = 2
    VIEW_USERS = 4
    MODIFY_USERS = 8
    UPLOAD_IMAGES = 16

    @staticmethod
    def sort():
        _current = [
            value
            for name, value in vars(Permissions).items()
            if not name.startswith("_") and name.isupper()
        ]
        return sorted(_current)
