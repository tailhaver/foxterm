"""Config file for quart app"""


class Config:
    DEBUG = False
    TESTING = False


class Production(Config):
    SERVER_NAME = "yip.cat"


class Development(Config):
    DEBUG = True
    TESTING = True
    AUTH_COOKIE_SECURE = False
