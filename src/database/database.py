from os import environ

from sqlalchemy import Integer, String, create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from sqlalchemy.orm import Mapped, mapped_column

engine = create_engine(environ.get("DATABASE_PATH", "sqlite:///"))


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "user"

    id: Mapped[int] = mapped_column(primary_key=True)
    login: Mapped[str] = mapped_column(String(39))
    level: Mapped[int] = mapped_column(default=1)


Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)
