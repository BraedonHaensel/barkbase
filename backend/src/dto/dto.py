"""
This folder contains the types that will be exposed in our API.
They are known as DTOs (Data Transfer Objects).
"""

from typing import TypedDict
from datetime import date
from models.models import Dog

class OwnerDTO(TypedDict):
    email: str
    f_name: str
    l_name: str
    address: str
    phone_num: str

class EmergencyContactDto(TypedDict):
    phone_num: str
    owner_email: str
    relationship: str
    email: str
    f_name: str
    l_name: str

class DogDTO(TypedDict):
    name: str
    o_email: str
    birth_date: date
    size: str  # Preserve enum type

class ServiceProviderDTO(TypedDict):
    email: str
    f_name: str
    l_name: str
    address: str
    phone_num: str