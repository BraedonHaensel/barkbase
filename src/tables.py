import sqlalchemy
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class Owner(Base):
    __tablename__ = 'owner'
    name = sqlalchemy.Column(sqlalchemy.String(length=100), primary_key=True)
    # id = sqlalchemy.Column(sqlalchemy.Integer, primary_key=True)
    # first_name = sqlalchemy.Column(sqlalchemy.String(length=100))
    # last_name = sqlalchemy.Column(sqlalchemy.String(length=100))
    # active = sqlalchemy.Column(sqlalchemy.Boolean, default=True)
