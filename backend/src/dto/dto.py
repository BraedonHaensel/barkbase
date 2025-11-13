"""
This folder contains the types that will be exposed in our API.
They are known as DTOs (Data Transfer Objects).
"""

from typing import TypedDict, List
from datetime import date

# JWT token
class TokenPayload(TypedDict):
    """
    Represents the decoded JWT payload structure.
    """
    email: str
    account_type: str

class OwnerDTO(TypedDict):
    email: str
    f_name: str
    l_name: str
    province: str
    city: str
    street: str
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
    image_url: str
    breeds: List[str]

"""
Represents the payload to create a new Dog and its breeds.
"""
class CreateDogDTO(TypedDict):
    name: str
    o_email: str
    birth_date: date
    size: str
    image_filename: str
    breeds: List[str]  # Allow multiple breeds per dog

"""
Represents the payload to update a Dog and its breeds.
"""
class UpdateDogDTO(TypedDict):
    name: str
    o_email: str
    birth_date: date
    size: str
    image_filename: str
    breeds: List[str]  # Allow multiple breeds per dog

class ServiceProviderDTO(TypedDict):
    email: str
    f_name: str
    l_name: str
    province: str
    city: str
    street: str
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
