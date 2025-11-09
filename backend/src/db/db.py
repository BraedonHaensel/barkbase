
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models.models import Base, Owner, Dog, DogBreed, EmergencyContact, ServiceProvider, Review, Booking, ServiceType, BookedDog
from datetime import date, datetime
from dto.dto import OwnerDTO, EmergencyContactDto, DogDTO, ServiceProviderDTO, BookingCreateDto
from typing import Optional, List


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

        if DB_PORT != '0':
            DATABASE_URI = (
                f"{DB_DRIVER}://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
            )
        else:
            DATABASE_URI = (
                f"{DB_DRIVER}://{DB_USER}:{DB_PASS}@{DB_HOST}/{DB_NAME}"
            )

        self.engine = create_engine(DATABASE_URI)
        self.session = sessionmaker(bind=self.engine)
        self.db = self.session() # TODO: remove later
    
    def resetAllTables(self):
        Base.metadata.drop_all(self.engine)  # Clear all tables
        Base.metadata.create_all(self.engine)  # Recreate all tables

    # Returns a new SQLAlchemy session.
    def get_session(self):
        return self.session()

    def populateDb(self):
        # Add owners:
        owner = Owner(
            email="bob@gmail.com", password="pbkdf2:sha256:1000000$hShsiGaRHootXXdH$b6d33d6b698561763c2851fa73f0c3ae4b5b57fa5d217521ea4bf43ef82dbb1e", f_name="Bob", l_name="Doe",
            address="123 Mt Norquay Pl SE", phone_num="4039987283")
        self.db.add(owner)
        self.db.commit()

        # Add emergency_contact:
        emergency_contact = EmergencyContact(
            phone_num="4031234321", o_email="bob@gmail.com", relationship="Friend",
            email="susan@gmail.com", f_name="Susan", l_name="Smith")
        self.db.add(emergency_contact)
        self.db.commit()

        # Add dog:
        dog = Dog(name="chico", o_email="bob@gmail.com", birth_date=date(2010, 1, 20), size=Dog.Size.SMALL)
        self.db.add(dog)
        dog = Dog(name="amigo", o_email="bob@gmail.com", birth_date=date(2010, 2, 13), size=Dog.Size.LARGE)
        self.db.add(dog)
        self.db.commit()

        # Add dog_breed:
        dog_breed = DogBreed(d_name="chico", o_email="bob@gmail.com", breed="Chihuahua")
        self.db.add(dog_breed)
        self.db.commit()

        # Add service_provider:
        service_provider = ServiceProvider(
            email="alice@gmail.com", password="pbkdf2:sha256:1000000$hShsiGaRHootXXdH$b6d33d6b698561763c2851fa73f0c3ae4b5b57fa5d217521ea4bf43ef82dbb1e", f_name="Alice", l_name="Swift",
            address="22 Nose Hill Way NW", phone_num="4038881234")
        self.db.add(service_provider)
        self.db.commit()

        # Add review (Note the ID is automatically set):
        review = Review(
            o_email="bob@gmail.com", sp_email="alice@gmail.com", service_type=ServiceType.WALKING,
            date=date(2025, 9, 19), star_rating=1,
            description="Alice was very friendly and my dog was happy after the walk!")
        self.db.add(review)
        self.db.commit()

        # Add booking (Note the ID is automatically set):
        booking = Booking(
            id=-2,
            o_email="bob@gmail.com", sp_email="alice@gmail.com",
            start_datetime=datetime(2025, 10, 30, 14, 30), end_datetime=datetime(2025, 10, 30, 16, 30),
            service_type=ServiceType.WALKING, price=60, city="calgary", street="55 Sunshine Pl NE",
            note="My dog barks a lot.")
        self.db.add(booking)
        self.db.commit()

    def getAllOwners(self) -> List[OwnerDTO]:
        owners = self.db.query(Owner).all()  # fetch all rows from owner table

        # Convert ORM objects → dicts (for easy JSON use later)
        result = []
        for owner in owners:
            result.append({
                "email": owner.email,
                # "password": owner.password,   # omit password - we don't want to expose it to our API users
                "f_name": owner.f_name,
                "l_name": owner.l_name,
                "address": owner.address,
                "phone_num": owner.phone_num,
            })
        return result
    
    def getOwnerByEmail(self, email: str) -> Optional[OwnerDTO]:
        owner = self.db.query(Owner).filter(Owner.email == email).first()

        if not owner:
            return None

        return {
            "email": owner.email,
            "f_name": owner.f_name,
            "l_name": owner.l_name,
            "address": owner.address,
            "phone_num": owner.phone_num
        }

    # Filter by o_email
    def getEmergencyContact(self, o_email: str) -> List[EmergencyContactDto]:
        contacts = self.db.query(EmergencyContact).filter(EmergencyContact.o_email == o_email)

        res = []
        for contact in contacts:
            res.append({
                "phone_num": contact.phone_num,
                "owner_email": contact.o_email,
                "relationship": contact.relationship,
                "email": contact.email,
                "f_name": contact.f_name,
                "l_name": contact.l_name
            })

        return res
    
    # DOGS
    def getAllDogs(self) -> List[DogDTO]:
        dogs = self.db.query(Dog).all()

        result = [
            {
                "name": dog.name,
                "o_email": dog.o_email,
                "birth_date": dog.birth_date,
                "size": dog.size.name  # convert Enum to string ("SMALL", "MEDIUM", "LARGE")
            }
            for dog in dogs
        ]

        return result

    def getDog(self, o_email:str, name:str) -> Dog:
        return self.db.query(Dog).filter(and_(Dog.o_email == o_email, Dog.name == name))
    
    # DOG BREEDS
    def getAllDogBreeds(self):
        all = self.db.query(DogBreed).all()
        results = []

        for item in all:
            results.append({
                "dog_name": item.d_name,
                "owner_email": item.o_email,
                "breed": item.breed
            })

        return results
    
    # SERVICE PROVIDERS
    def getAllSvcProviders(self) -> List[ServiceProviderDTO]:
        all: List[ServiceProvider] = self.db.query(ServiceProvider).all()
        results = []

        for provider in all:
            results.append({
                "email": provider.email,
                "f_name": provider.f_name,
                "l_name": provider.l_name,
                "address": provider.address,
                "phone_num": provider.phone_num
            })

        return results
    
    def getAllReviews(self):
        reviews: List[Review] = self.db.query(Review).all()
        results = []

        for review in reviews:
            results.append({
                "id": review.id,
                "o_email": review.o_email,
                "sp_email": review.sp_email,
                "service_type": review.service_type.name,  # convert enum to string
                "date": review.date.isoformat(),           # convert datetime.date → string
                "star_rating": review.star_rating,
                "description": review.description
            })

        return results
    

    # BOOKINGS
    def getAllBookings(self):
        bookings: List[Booking] = self.db.query(Booking).all()

        results = []
        for b in bookings:
            results.append({
                "id": b.id,
                "o_email": b.o_email,
                "sp_email": b.sp_email,
                "start_datetime": b.start_datetime.isoformat(),
                "end_datetime": b.end_datetime.isoformat(),
                "service_type": b.service_type.name,  # enum → string
                "price": float(b.price),
                "city": b.city,
                "street": b.street,
                "note": b.note
            })

        return results

    def getAllBookedDogs(self):
        booked_dogs: List[BookedDog] = self.db.query(BookedDog).all()

        results = []
        for bd in booked_dogs:
            results.append({
                "booking_id": bd.booking_id,
                "d_name": bd.d_name,
                "o_email": bd.o_email
            })

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
            dog_names = request["dog_names"]
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
            city="calgary",   # TODO: make configurable later
            street="default street",
            note=""
        )

        self.db.add(booking)
        self.db.commit()  # commit so booking.id is generated

        # 3) For each dog, create an entry in BookedDog
        for name in dog_names:
            booked_dog = BookedDog(
                booking_id=booking.id,
                d_name=name,
                o_email=o_email
            )
            self.db.add(booked_dog)

        self.db.commit()  # persist all booked dogs

        # 4) Return the booking ID as a string (for easy JSON serialization)
        return str(booking.id)
