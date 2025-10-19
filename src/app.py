from datetime import datetime, date
from dotenv import load_dotenv
from flask import Flask
import os
import sqlalchemy
from sqlalchemy.orm import sessionmaker

from tables import (
    Base, ServiceType, Owner, EmergencyContact, Dog, DogBreed, ServiceProvider, Review, Booking,
    BookedDog)

# Import environment variables from the '.env' file.
load_dotenv()

# Create the Flask app.
app = Flask(__name__)

# Define the MariaDB engine using MariaDB Connector/Python.
engine = sqlalchemy.create_engine(
    f"mariadb+mariadbconnector://dbpbf27790099:{os.getenv('MARIADB_PASS')}@"
    "serverless-eastus.sysp0000.db3.skysql.com:4114/barkbase",
    connect_args={"ssl": True})

# Create the SQLAlchemy session
db = sessionmaker(bind=engine)()

# Create any tables that do not already exist.
Base.metadata.create_all(engine)




@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"




########## EXAMPLES ##########
# Add owner:
# owner = Owner(
#     email="samuel@gmail.com", password="abcd123", f_name="Samuel", l_name="White",
#     address="123 Mt Norquay Pl SE", phone_num="4039987283")
# db.add(owner)
# db.commit()

# Add emergency_contact:
# emergency_contact = EmergencyContact(
#     phone_num="4031234321", o_email="john@gmail.com", relationship="Friend",
#     email="susan@gmail.com", f_name="Susan", l_name="Smith")
# db.add(emergency_contact)
# db.commit()

# Add dog:
# dog = Dog(name="Chico", o_email="john@gmail.com", birth_date=date(2010, 1, 20), size=Dog.Size.SMALL)
# db.add(dog)
# db.commit()

# Add dog_breed:
# dog_breed = DogBreed(d_name="Chico", o_email="john@gmail.com", breed="Chihuahua")
# db.add(dog_breed)
# db.commit()

# Add service_provider:
# service_provider = ServiceProvider(
#     email="alice@gmail.com", password="alice123", f_name="Alice", l_name="Swift",
#     address="22 Nose Hill Way NW", phone_num="4038881234")
# db.add(service_provider)
# db.commit()

# Add review (Note the ID is automatically set):
# review = Review(
#     o_email="john@gmail.com", sp_email="alice@gmail.com", service_type=ServiceType.WALKING,
#     date=date(2025, 9, 19), star_rating=1,
#     description="Alice was very friendly and my dog was happy after the walk!")
# db.add(review)
# db.commit()

# Add booking (Note the ID is automatically set):
# booking = Booking(
#     o_email="john@gmail.com", sp_email="alice@gmail.com",
#     start_datetime=datetime(2025, 10, 30, 14, 30), end_datetime=datetime(2025, 10, 30, 16, 30),
#     service_type=ServiceType.WALKING, price=60, location="55 Sunshine Pl NE",
#     note="My dog barks a lot.")
# db.add(booking)
# db.commit()

# Add booked_dog
# booked_dog = BookedDog(booking_id=1, d_name="Chico", o_email="john@gmail.com")
# db.add(booked_dog)
# db.commit()
########## END EXAMPLES ##########

########## EXAMPLE ROUTES FOR EACH TABLE ##########
def get_table_data(table_class):
    row_data = []
    for row in db.query(table_class).all():
        row_data.append(
            {column.name: getattr(row, column.name) for column in table_class.__table__.columns})
    html = ''
    for row in row_data:
        html += f"<p>{str(row)}</p>"
    return html if html else "No data"

@app.route("/owner")
def owner():
    return get_table_data(Owner)

@app.route("/emergency_contact")
def emergency_contact():
    return get_table_data(EmergencyContact)

@app.route("/dog")
def dog():
    return get_table_data(Dog)

@app.route("/dog_breed")
def dog_breed():
    return get_table_data(DogBreed)

@app.route("/service_provider")
def service_provider():
    return get_table_data(ServiceProvider)

@app.route("/review")
def review():
    return get_table_data(Review)

@app.route("/booking")
def booking():
    return get_table_data(Booking)

@app.route("/booked_dog")
def booked_dog():
    return get_table_data(BookedDog)
###################################################


if __name__ == "__main__":
    app.run()
