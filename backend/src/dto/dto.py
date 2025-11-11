"""
This folder contains the types that will be exposed in our API.
They are known as DTOs (Data Transfer Objects).
"""

from typing import TypedDict, List
from datetime import date
from models.models import Role

# JWT token
class TokenPayload(TypedDict):
    """
    Represents the decoded JWT payload structure.
    """
    email: str
    role: str

class OwnerDTO(TypedDict):
    email: str
    f_name: str
    l_name: str
    address: str
    phone_num: str
    image_url: str

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
    image_url: str

# Request body shape to create booking
class BookingCreateDto(TypedDict):
    o_email: str
    sp_email: str
    start_datetime: str      # serialized ISO string, not datetime object
    end_datetime: str
    service_type: str        # e.g. "WALKING" or "SITTING"
    price: float
    dog_names: List[str]
