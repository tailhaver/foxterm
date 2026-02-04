from collections.abc import Iterator
from os import environ

from sqlalchemy import String, create_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker

engine = create_engine(environ.get("DATABASE_PATH", "sqlite:///"))


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "user"

    id: Mapped[int] = mapped_column(primary_key=True)
    login: Mapped[str] = mapped_column(String(39))
    permissions: Mapped[int] = mapped_column(default=1)

    def __iter__(self) -> Iterator:
        return iter([self.id, self.login, self.permissions])


Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)
