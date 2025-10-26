from . import app, db
from .models import (
    ServiceType, Owner, EmergencyContact, Dog, DogBreed, ServiceProvider, Review, Booking,
    BookedDog)

from datetime import date, datetime


@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"

# ########## EXAMPLE ROUTES FOR EACH TABLE ##########
# This section is for sample routes to print each table's tuples, and can be deleted when no
# longer useful.

def get_table_data(table_class):
    row_data = []
    for row in db.query(table_class).all():
        row_data.append(
            {column.name: getattr(row, column.name) for column in table_class.__table__.columns})
    html = ''
    for row in row_data:
        html += f"<p>{str(row)}</p>"
    return html if html else "No data"

# 1) OWNER ROUTES
# GET /api/owners
@app.route("/owner")
def owner():
    return get_table_data(Owner)

@app.route("/emergency_contact")
def emergency_contact():
    return get_table_data(EmergencyContact)

# 2) DOG ROUTES
@app.route("/dog")
def dog():
    return get_table_data(Dog)

@app.route("/dog_breed")
def dog_breed():
    return get_table_data(DogBreed)

# 3) SERVICE PROVIDER ROUTES
@app.route("/service_provider")
def service_provider():
    return get_table_data(ServiceProvider)

# 4) REVIEW ROUTES
@app.route("/review")
def review():
    return get_table_data(Review)

# 5) BOOKING ROUTES
@app.route("/booking")
def booking():
    return get_table_data(Booking)


# @app.route("/booked_dog")
# def booked_dog():
#     return get_table_data(BookedDog)
###################################################
