from quart_auth import AuthUser
from database import Session, User

class UserClass(AuthUser):
    def __init__(self, auth_id):
        super().__init__(auth_id)
        self._resolved = False
        self._id = None
        self._login = None
        self._level = None
    
    async def _resolve(self):
        if self._resolved:
            return
        if not await self.is_authenticated:
            return
        with Session() as session:
            user_data = session.get(User, self.auth_id)
            self._id = user_data.id
            self._login = user_data.login
            self._level = user_data.level
            self._resolved = True
    
    @property
    async def id(self):
        await self._resolve()
        return self._id
    
    @property
    async def login(self):
        await self._resolve()
        return self._login
    
    @property
    async def level(self):
        await self._resolve()
        return self._level