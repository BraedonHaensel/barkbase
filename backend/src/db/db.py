from sqlalchemy import create_engine, and_
from sqlalchemy.orm import sessionmaker
from models.models import (
    Base,
    Owner,
    Dog,
    DogBreed,
    EmergencyContact,
    ServiceProvider,
    Review,
    Booking,
    BookedDog,
)
from datetime import date, datetime
from dto.dto import (
    OwnerDTO,
    EmergencyContactDto,
    ServiceProviderDTO,
    BookingCreateDto,
    CreateDogDTO,
    UpdateDogDTO,
)
from typing import Optional, List
from enums.enums import Province, ServiceType


from dotenv import load_dotenv
import os

# Import environment variables from the '.env' file.
load_dotenv()


# This class is a DB wrapper. It allows us to interact with MariaDB.
class DB:
    def __init__(self):
        # Define the DB engine using DB Connector/Python.
        DB_DRIVER = os.getenv("DB_DRIVER")
        DB_USER = os.getenv("DB_USER")
        DB_PASS = os.getenv("DB_PASS")
        DB_HOST = os.getenv("DB_HOST", "127.0.0.1")
        DB_PORT = os.getenv("DB_PORT", "3306")
        DB_NAME = os.getenv("DB_NAME", "barkbase_local")

        if DB_PORT != "0":
            DATABASE_URI = (
                f"{DB_DRIVER}://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
            )
        else:
            DATABASE_URI = f"{DB_DRIVER}://{DB_USER}:{DB_PASS}@{DB_HOST}/{DB_NAME}"

        self.engine = create_engine(DATABASE_URI)
        self.session = sessionmaker(bind=self.engine)()
        self.db = self.session  # TODO: remove later

    def resetAllTables(self):
        Base.metadata.drop_all(self.engine)  # Clear all tables
        Base.metadata.create_all(self.engine)  # Recreate all tables

    # Returns a new SQLAlchemy session.
    def get_session(self):
        return self.session

    def populateDb(self):
        # Add owners:
        owner = Owner(
            email="bob@gmail.com",
            password="pbkdf2:sha256:1000000$hShsiGaRHootXXdH$b6d33d6b698561763c2851fa73f0c3ae4b5b57fa5d217521ea4bf43ef82dbb1e",
            f_name="Bob",
            l_name="Doe",
            province=Province.AB,
            city="Calgary",
            street="123 Mt Norquay Pl SE",
            phone_num="4039987283",
            image_filename="3549e957-3b4d-43f7-b790-f230597a1711.jpg",
        )
        self.db.add(owner)
        self.db.commit()

        # Add emergency_contact:
        emergency_contact = EmergencyContact(
            phone_num="4031234321",
            o_email="bob@gmail.com",
            relationship="Friend",
            email="susan@gmail.com",
            f_name="Susan",
            l_name="Smith",
        )
        self.db.add(emergency_contact)
        self.db.commit()

        # Add dog:
        dog = Dog(
            name="chico",
            o_email="bob@gmail.com",
            birth_date=date(2010, 1, 20),
            size=Dog.Size.SMALL,
            image_filename="4d76b811-e1f3-4648-bd85-29b30cc838d5.jpg",
        )
        self.db.add(dog)
        dog = Dog(
            name="amigo",
            o_email="bob@gmail.com",
            birth_date=date(2010, 2, 13),
            size=Dog.Size.LARGE,
            image_filename="cb3dab85-2a81-4254-bda3-524ef18c8b9d.jpg",
        )
        self.db.add(dog)
        self.db.commit()

        # Add dog_breed:
        dog_breed = DogBreed(d_name="chico", o_email="bob@gmail.com", breed="Shiba Inu")
        self.db.add(dog_breed)
        dog_breed = DogBreed(
            d_name="amigo", o_email="bob@gmail.com", breed="Jack Russel Terrier"
        )
        self.db.add(dog_breed)
        dog_breed = DogBreed(
            d_name="amigo", o_email="bob@gmail.com", breed="Border Collie"
        )
        self.db.add(dog_breed)
        self.db.commit()

        # Add service_provider:
        service_provider = ServiceProvider(
            email="alice@gmail.com",
            password="pbkdf2:sha256:1000000$hShsiGaRHootXXdH$b6d33d6b698561763c2851fa73f0c3ae4b5b57fa5d217521ea4bf43ef82dbb1e",
            f_name="Alice",
            l_name="Swift",
            province=Province.AB,
            city="Calgary",
            street="22 Nose Hill Way NW",
            phone_num="4038881234",
            image_filename="56b7a08a-1d08-42a4-960c-0601711523b6.jpg",
        )
        self.db.add(service_provider)
        self.db.commit()

        # Add review (Note the ID is automatically set):
        review = Review(
            o_email="bob@gmail.com",
            sp_email="alice@gmail.com",
            service_type=ServiceType.WALKING,
            date=date(2025, 9, 19),
            star_rating=1,
            description="Alice was very friendly and my dog was happy after the walk!",
        )
        self.db.add(review)
        self.db.commit()

        # Add booking (Note the ID is automatically set):
        booking = Booking(
            id=1,
            o_email="bob@gmail.com",
            sp_email="alice@gmail.com",
            start_datetime=datetime(2025, 10, 30, 14, 30),
            end_datetime=datetime(2025, 10, 30, 16, 30),
            service_type=ServiceType.WALKING,
            price=60,
            province=Province.AB,
            city="Calgary",
            street="55 Sunshine Pl NE",
            note="My dog barks a lot.",
        )
        self.db.add(booking)
        booking = Booking(
            id=2,
            o_email="bob@gmail.com",
            sp_email="alice@gmail.com",
            start_datetime=datetime(2025, 12, 30, 14, 30),
            end_datetime=datetime(2025, 12, 30, 16, 30),
            service_type=ServiceType.WALKING,
            price=60,
            province=Province.AB,
            city="Calgary",
            street="55 Sunshine Pl NE",
            note="My dog barks a lot.",
        )
        self.db.add(booking)
        self.db.commit()

        # Add dogs to the bookings
        booked_dog = BookedDog(
            booking_id=1,
            d_name="chico",
            o_email="bob@gmail.com",
        )
        self.db.add(booked_dog)
                # Add dogs to the bookings
        booked_dog = BookedDog(
            booking_id=2,
            d_name="chico",
            o_email="bob@gmail.com",
        )
        self.db.add(booked_dog)
                # Add dogs to the bookings
        booked_dog = BookedDog(
            booking_id=2,
            d_name="amigo",
            o_email="bob@gmail.com",
        )
        self.db.add(booked_dog)
        self.db.commit()


    def getAllOwners(self) -> List[OwnerDTO]:
        owners = self.db.query(Owner).all()  # fetch all rows from owner table

        # Convert ORM objects → dicts (for easy JSON use later)
        result = []
        for owner in owners:
            result.append(
                {
                    "email": owner.email,
                    # "password": owner.password,   # omit password - we don't want to expose it to our API users
                    "f_name": owner.f_name,
                    "l_name": owner.l_name,
                    "province": owner.province,
                    "city": owner.city,
                    "street": owner.street,
                    "phone_num": owner.phone_num,
                    "image_filename": owner.image_filename,
                }
            )
        return result

    def getOwnerByEmail(self, email: str) -> Optional[OwnerDTO]:
        owner = self.db.query(Owner).filter(Owner.email == email).first()

        if not owner:
            return None

        return {
            "email": owner.email,
            "f_name": owner.f_name,
            "l_name": owner.l_name,
            "province": owner.province,
            "city": owner.city,
            "street": owner.street,
            "phone_num": owner.phone_num,
            "image_filename": owner.image_filename,
        }

    def getServiceProviderByEmail(self, email: str) -> Optional[ServiceProviderDTO]:
        sp = (
            self.db.query(ServiceProvider)
            .filter(ServiceProvider.email == email)
            .first()
        )

        if not sp:
            return None

        return {
            "email": sp.email,
            "f_name": sp.f_name,
            "l_name": sp.l_name,
            "province": sp.province,
            "city": sp.city,
            "street": sp.street,
            "phone_num": sp.phone_num,
        }

    # Filter by o_email
    def getEmergencyContact(self, o_email: str) -> List[EmergencyContactDto]:
        contacts = self.db.query(EmergencyContact).filter(
            EmergencyContact.o_email == o_email
        )

        res = []
        for contact in contacts:
            res.append(
                {
                    "phone_num": contact.phone_num,
                    "owner_email": contact.o_email,
                    "relationship": contact.relationship,
                    "email": contact.email,
                    "f_name": contact.f_name,
                    "l_name": contact.l_name,
                }
            )

        return res

    def addEmergencyContact(self, request: EmergencyContactDto):

        phone_num = request["phone_num"]
        o_email = request["owner_email"]

        if self.db.query(EmergencyContact).filter(and_(
                EmergencyContact.o_email == o_email, EmergencyContact.phone_num == phone_num)).first():
            raise ValueError(f"Duplicate phone number: {phone_num}")

        self.db.add(EmergencyContact(
            o_email=o_email, phone_num=phone_num, f_name=request["f_name"],
            l_name=request["l_name"], relationship=request["relationship"], email=request["email"]
        ))
        self.db.commit()

    def removeEmergencyContact(self, o_email:str, phone_num:str):

        contact = self.db.query(EmergencyContact).filter(and_(
            EmergencyContact.o_email == o_email, EmergencyContact.phone_num == phone_num)).first()

        if not contact:
            raise KeyError("no such emergency contact")

        self.db.delete(contact)
        self.db.commit()


    # DOGS
    def getAllDogs(self) -> List[Dog]:
        dogs = self.db.query(Dog).all()

        return dogs

    def getDog(self, o_email: str, name: str) -> Optional[Dog]:
        return (
            self.db.query(Dog)
            .filter(and_(Dog.o_email == o_email, Dog.name == name))
            .first()
        )

    def addDog(self, request: CreateDogDTO):
        try:
            o_email = request["o_email"]
            name = request["name"]
            birth_date = request["birth_date"]
            size_str = request["size"]
            image_filename = request["image_filename"]
            breeds = request.get("breeds", [])
        except KeyError as e:
            raise ValueError(f"Missing field: {e}")
        except Exception as e:
            raise ValueError(f"Invalid field format: {e}")

        # Convert size string to enum
        try:
            size = Dog.Size[size_str.upper()]
        except (KeyError, AttributeError):
            raise ValueError(f"Invalid size: {size_str}")

        # Validate owner and dog uniqueness
        if not self.getOwnerByEmail(o_email):
            raise KeyError(f"Missing owner: {o_email}")
        if self.getDog(o_email, name) is not None:
            raise KeyError(f"Non-unique dog: {name}")

        # Create dog
        new_dog = Dog(
            name=name,
            o_email=o_email,
            birth_date=birth_date,
            size=size,
            image_filename=image_filename,
        )
        self.db.add(new_dog)
        self.db.flush()  # ensures FK exists for DogBreed inserts

        # Create associated DogBreed entries
        for breed in breeds:
            breed = breed.strip()
            if breed:
                self.db.add(DogBreed(d_name=name, o_email=o_email, breed=breed))

        self.db.commit()

    def remove_dog(self, dog: Dog):
        # Now safely delete the dog
        self.db.delete(dog)
        self.db.commit()

    def updateDog(self, o_email: str, old_name: str, request: UpdateDogDTO):
        try:
            new_name = request["name"]
            birth_date = request["birth_date"]
            size_str = request["size"]
            image_filename = request["image_filename"]
            breeds = request.get("breeds", [])
        except KeyError as e:
            raise ValueError(f"Missing field: {e}")

        dog = self.db.query(Dog).filter_by(o_email=o_email, name=old_name).first()
        if not dog:
            raise KeyError(f"Dog not found: {old_name}")

        try:
            size = Dog.Size[size_str.upper()]
        except (KeyError, AttributeError):
            raise ValueError(f"Invalid size: {size_str}")

        # Check name conflicts if renaming
        if new_name != old_name:
            if self.getDog(o_email, new_name):
                raise KeyError(f"Dog with name {new_name} already exists")
            dog.name = new_name  # triggers onupdate cascade

        # Update other fields
        dog.birth_date = birth_date
        dog.size = size

        # Update image if it was changed
        if image_filename:
            dog.image_filename = image_filename

        # Replace breeds entirely (PUT semantics)
        self.db.query(DogBreed).filter_by(d_name=new_name, o_email=o_email).delete()
        for breed in breeds:
            breed = breed.strip()
            if breed:
                self.db.add(DogBreed(d_name=new_name, o_email=o_email, breed=breed))

        self.db.commit()

    # def updateDog(self, o_email: str, old_name: str, request: DogDTO):
    #     """
    #     Update a dog identified by o_email and old_name.
    #     The request should contain the updated values (name, birth_date, size).
    #     size should be a Dog.Size enum value.
    #     """
    #     try:
    #         new_name = request["name"]
    #         birth_date = request["birth_date"]
    #         size_str = request["size"]  # This comes as a string from DTO
    #     except KeyError as e:
    #         raise ValueError(f"Missing field: {e}")
    #     except Exception as e:
    #         raise ValueError(f"Invalid field format: {e}")

    #     # Get the existing dog
    #     dog = self.db.query(Dog).filter(and_(Dog.o_email == o_email, Dog.name == old_name)).first()
    #     if not dog:
    #         raise KeyError(f"Dog not found: {old_name}")

    #     # Convert size string to enum
    #     try:
    #         size = Dog.Size[size_str.upper()]
    #     except (KeyError, AttributeError):
    #         raise ValueError(f"Invalid size: {size_str}")

    #     # Update the dog's attributes
    #     # If name changed, we need to handle it carefully since it's part of the primary key
    #     if new_name != old_name:
    #         # Check if new name already exists for this owner
    #         existing_dog = self.db.query(Dog).filter(and_(Dog.o_email == o_email, Dog.name == new_name)).first()
    #         if existing_dog:
    #             raise KeyError(f"Dog with name {new_name} already exists")
    #         # Update name
    #         dog.name = new_name

    #     # Update other fields
    #     dog.birth_date = birth_date
    #     dog.size = size

    #     self.db.commit()

    def get_my_dogs(self, o_email: str):
        return self.db.query(Dog).filter(Dog.o_email == o_email)

    # DOG BREEDS
    def getAllDogBreeds(self):
        all = self.db.query(DogBreed).all()
        results = []

        for item in all:
            results.append(
                {
                    "dog_name": item.d_name,
                    "owner_email": item.o_email,
                    "breed": item.breed,
                }
            )

        return results

    # SERVICE PROVIDERS
    def getAllSvcProviders(self) -> List[ServiceProviderDTO]:
        all: List[ServiceProvider] = self.db.query(ServiceProvider).all()
        results = []

        for provider in all:
            results.append(
                {
                    "email": provider.email,
                    "f_name": provider.f_name,
                    "l_name": provider.l_name,
                    "province": provider.province,
                    "city": provider.city,
                    "street": provider.street,
                    "phone_num": provider.phone_num,
                    "image_filename": provider.image_filename,
                }
            )

        return results

    def getAllReviews(self):
        reviews: List[Review] = self.db.query(Review).all()
        results = []

        for review in reviews:
            results.append(
                {
                    "id": review.id,
                    "o_email": review.o_email,
                    "sp_email": review.sp_email,
                    "service_type": review.service_type.name,  # convert enum to string
                    "date": review.date.isoformat(),  # convert datetime.date → string
                    "star_rating": review.star_rating,
                    "description": review.description,
                }
            )

        return results

    # BOOKINGS
    def getAllBookings(self):
        bookings: List[Booking] = self.db.query(Booking).all()

        results = []
        for b in bookings:
            results.append(
                {
                    "id": b.id,
                    "o_email": b.o_email,
                    "sp_email": b.sp_email,
                    "start_datetime": b.start_datetime.isoformat(),
                    "end_datetime": b.end_datetime.isoformat(),
                    "service_type": b.service_type.name,  # enum → string
                    "price": float(b.price),
                    "city": b.city,
                    "street": b.street,
                    "note": b.note,
                }
            )

        return results

    def getAllBookedDogs(self):
        booked_dogs: List[BookedDog] = self.db.query(BookedDog).all()

        results = []
        for bd in booked_dogs:
            results.append(
                {
                    "booking_id": bd.booking_id,
                    "d_name": bd.d_name,
                    "o_email": bd.o_email,
                }
            )

        return results

    def createBooking(self, request: BookingCreateDto) -> str:
        # 1) Create new booking in Booking table
        # 2) For each dog name, create a new entry in DogBooking
        # ASSUMPTIONS: In this booking, only one owner is involved and all dogs are his.

        # Parse input; input validation
        try:
            o_email = request["o_email"]
            sp_email = request["sp_email"]
            start_dt = request["start_datetime"]
            end_dt = request["end_datetime"]
            service_type = request["service_type"]
            price = float(request["price"])
            province = request["province"]
            city = request["city"]
            street = request["street"]
            dog_names = request["dog_names"]
            note = request["note"]
        except KeyError as e:
            raise ValueError(f"Missing field: {e}")
        except Exception as e:
            raise ValueError(f"Invalid field format: {e}")

        # Check if keys exist
        if not self.getOwnerByEmail(o_email):
            raise KeyError(f"Missing owner: {o_email}")
        if sp_email != None:
            if not self.getServiceProviderByEmail(sp_email):
                raise KeyError(f"Missing owner: {o_email}")

        for i in dog_names:
            if not self.getDog(o_email, i):
                raise KeyError(f"Missing dog: {i}")

        # 2) Create a new booking record
        booking = Booking(
            o_email=o_email,
            sp_email=sp_email,
            start_datetime=start_dt,
            end_datetime=end_dt,
            service_type=service_type,
            price=price,
            city=city,  # TODO: make configurable later
            street=street,
            province=province,
            note=note,
        )

        self.db.add(booking)
        self.db.commit()  # commit so booking.id is generated

        # 3) For each dog, create an entry in BookedDog
        for name in dog_names:
            booked_dog = BookedDog(booking_id=booking.id, d_name=name, o_email=o_email)
            self.db.add(booked_dog)

        self.db.commit()  # persist all booked dogs

        # 4) Return the booking ID as a string (for easy JSON serialization)
        return str(booking.id)
