from datetime import datetime, date
import enum
from sqlalchemy import *
from sqlalchemy.orm import declarative_base, mapped_column, Mapped

Base = declarative_base()


class ServiceType(enum.Enum):
    WALKING = enum.auto()
    SITTING = enum.auto()


class Owner(Base):
    __tablename__ = 'owner'

    email: Mapped[str] = mapped_column(String(100), primary_key=True)
    password: Mapped[str] = mapped_column(String(100))
    f_name: Mapped[str] = mapped_column(String(100))
    l_name: Mapped[str] = mapped_column(String(100))
    address: Mapped[str] = mapped_column(String(100))
    phone_num: Mapped[str] = mapped_column(String(100))


class EmergencyContact(Base):
    __tablename__ = 'emergency_contact'

    phone_num: Mapped[str] = mapped_column(String(100), primary_key=True)
    o_email: Mapped[str] = mapped_column(String(100), ForeignKey('owner.email'), primary_key=True)
    relationship: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(100))
    f_name: Mapped[str] = mapped_column(String(100))
    l_name: Mapped[str] = mapped_column(String(100))


class Dog(Base):
    class Size(enum.Enum):
        SMALL = enum.auto()
        MEDIUM = enum.auto()
        LARGE = enum.auto()

    __tablename__ = 'dog'

    name: Mapped[str] = mapped_column(String(100), primary_key=True)
    o_email: Mapped[str] = mapped_column(String(100), ForeignKey('owner.email'), primary_key=True)
    birth_date: Mapped["date"] = mapped_column(Date)
    size: Mapped[Size] = mapped_column(Enum(Size))


class DogBreed(Base):
    __tablename__ = 'dog_breed'

    d_name: Mapped[str] = mapped_column(String(100), ForeignKey('dog.name'), primary_key=True)
    o_email: Mapped[str] = mapped_column(String(100), ForeignKey('dog.o_email'), primary_key=True)
    breed: Mapped[str] = mapped_column(String(100), primary_key=True)


class ServiceProvider(Base):
    __tablename__ = 'service_provider'

    email: Mapped[str] = mapped_column(String(100), primary_key=True)
    password: Mapped[str] = mapped_column(String(100))
    f_name: Mapped[str] = mapped_column(String(100))
    l_name: Mapped[str] = mapped_column(String(100))
    address: Mapped[str] = mapped_column(String(100))
    phone_num: Mapped[str] = mapped_column(String(100))


class Review(Base):
    __tablename__ = 'review'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    o_email: Mapped[str] = mapped_column(String(100), ForeignKey('owner.email'))
    sp_email: Mapped[str] = mapped_column(
        String(100), ForeignKey('service_provider.email'), primary_key=True)
    service_type: Mapped[ServiceType] = mapped_column(Enum(ServiceType))
    date: Mapped["date"] = mapped_column(Date)
    star_rating: Mapped[int] = mapped_column(Integer)
    description: Mapped[str] = mapped_column(String(100))


class Booking(Base):
    __tablename__ = 'booking'
    next_id = 0

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=False) #autoincremet must be explicitly set to false
    o_email: Mapped[str] = mapped_column(String(100), ForeignKey('owner.email'))
    sp_email: Mapped[str] = mapped_column(String(100), ForeignKey('service_provider.email'), nullable=True)
    start_datetime: Mapped[datetime] = mapped_column(DateTime)
    end_datetime: Mapped[datetime] = mapped_column(DateTime)
    service_type: Mapped[ServiceType] = mapped_column(Enum(ServiceType))
    price: Mapped[float] = mapped_column(Numeric(6, 2))
    city: Mapped[str] = mapped_column(String(100))
    street: Mapped[str] = mapped_column(String(100))
    note: Mapped[str] = mapped_column(String(100))


class BookedDog(Base):
    __tablename__ = 'booked_dog'

    booking_id: Mapped[int] = mapped_column(Integer, ForeignKey('booking.id'), primary_key=True)
    d_name: Mapped[str] = mapped_column(String(100), ForeignKey('dog.name'), primary_key=True)
    o_email: Mapped[str] = mapped_column(String(100), ForeignKey('dog.o_email'), primary_key=True)
