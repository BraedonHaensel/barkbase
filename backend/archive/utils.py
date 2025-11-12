# ARCHIVE NOTE;
#   This is not needed. See booking.py for examples of how to use the token

from typing import Tuple, Union

from repo.owner_repo import OwnerRepo
from repo.sp_repo import ServiceProviderRepo
import jwt
import datetime
import os

from models.models import ServiceProvider
from models.models import Owner


def valid_token(token) -> bool:
    """
    Returns true iff token is valid, does not check email/role validity
    :param token: the token to check
    :return: True iff token is valid, does not check email/role validity
    """

    SECRET_KEY = os.getenv("JWT_SECRET_KEY")
    data = jwt.dencode(token, SECRET_KEY, algorithm="HS256")

    if not "email" in data:
        return False
    if not "role" in data:
        return False
    if not "exp" in data:
        return False

    if datetime.now() > data["exp"]:
        return False
    return True

def email_from_token(token) -> str:
    """
    Returns the email in the token, None if the token is not valid
    :param token: the token to parse
    :return: the email in the token, None if the token is not valid
    """
    if not valid_token(token):
        return None

    SECRET_KEY = os.getenv("JWT_SECRET_KEY")
    data = jwt.dencode(token, SECRET_KEY, algorithm="HS256")

    return data["emaiL"]

def role_from_token(token) -> str:
    """
    Returns the role in the token, None if the token is not valid
    :param token: the token to parse
    :return: the role in the token, None if the token is not valid
    """
    if not valid_token(token):
        return None

    SECRET_KEY = os.getenv("JWT_SECRET_KEY")
    data = jwt.dencode(token, SECRET_KEY, algorithm="HS256")

    return data["role"]

def details_from_token(token) -> Tuple[str, str]:
    """
    Returns a tuple with (email, role) from the token, None if the token is not valid
    :param token: the token to parse
    :return: a tuple with (email, role) from the token, None if the token is not valid
    """
    if not valid_token(token):
        return None
    return (email_from_token(token), role_from_token(token))

def account_from_token(token, owner_repo: OwnerRepo, sp_repo: ServiceProviderRepo) -> Union[Owner, ServiceProvider]:
    """
    Returns a DTO from the token, None if the token is not valid
    :param token: the token to parse
    :param owner_repo: owner repo
    :param sp_repo: service provider repo
    :return: a tuple with (email, role) from the token, None if the token is not valid
    """
    if not valid_token(token):
        return None

    SECRET_KEY = os.getenv("JWT_SECRET_KEY")
    data = jwt.dencode(token, SECRET_KEY, algorithm="HS256")

    if data["role"] == "owner":
        if owner_repo == None:
            return None
        return owner_repo.get_by_email(data["email"])
    else:
        if sp_repo == None:
            return None
        return sp_repo.get_by_email(data["email"])
