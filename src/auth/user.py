from quart_auth import AuthUser
from sqlalchemy import update
from src.database import Session, User


class UserClass(AuthUser):
    def __init__(self, auth_id):
        super().__init__(auth_id)
        self._resolved = False
        self._id = None
        self._login = None
        self._permissions = None

    async def _resolve(self):
        if self._resolved:
            return
        if not await self.is_authenticated:
            return
        with Session() as session:
            user_data = session.get(User, self.auth_id)
            self._id = user_data.id
            self._login = user_data.login
            self._permissions = user_data.permissions
            self._resolved = True

    async def add_permission(self, permission_level: int) -> None:
        await self._resolve()
        with Session() as session:
            self._resolved = False
            session.execute(
                update(User)
                .where(User.id == self._id["id"])
                .values(permission_level=self._permissions | permission_level)
            )

    async def remove_permission(self, permission_level: int) -> None:
        await self._resolve()
        with Session() as session:
            self._resolved = False
            session.execute(
                update(User)
                .where(User.id == self._id["id"])
                .values(permission_level=self._permissions & (~permission_level))
            )
    
    async def has_permission(self, permission_level: int) -> bool:
        await self._resolve()
        if self._permissions is None: 
            return False
        return bool(self._permissions & permission_level)

    @property
    async def id(self):
        await self._resolve()
        return self._id

    @property
    async def login(self):
        await self._resolve()
        return self._login

    @property
    async def permissions(self):
        await self._resolve()
        return self._permissions