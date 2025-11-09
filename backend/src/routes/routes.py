# from . import app, db
# from .models import (
#     ServiceType, Owner, EmergencyContact, Dog, DogBreed, ServiceProvider, Review, Booking,
#     BookedDog)

from flask import request, jsonify
from models.models import *
from db.db import DB

# from datetime import date, datetime

# takes in an `app` and attaches the routes to it.
def init_routes(app, db: DB):
    @app.route("/")
    def hello_world():
        return "<p>Hello, World!</p>"

    # ########## EXAMPLE ROUTES FOR EACH TABLE ##########
    # This section is for sample routes to print each table's tuples, and can be deleted when no
    # longer useful.

    # def get_table_data(table_class):
    #     row_data = []
    #     for row in db.query(table_class).all():
    #         row_data.append(
    #             {column.name: getattr(row, column.name) for column in table_class.__table__.columns})
    #     html = ''
    #     for row in row_data:
    #         html += f"<p>{str(row)}</p>"
    #     return html if html else "No data"

    # 1) OWNER ROUTES
    # GET /api/owners?:email

    # GET /api/owners
    @app.route("/owners")
    def get_all_owners():
        return jsonify(db.getAllOwners())

    # Get owner by email
    @app.route("/owners/<email>")
    def get_owner_by_email(email):
        owner = db.getOwnerByEmail(email)

        if not owner:
            return jsonify({ "error": "Owner not found" }), 404
        
        return jsonify(owner)

    # 2) EMERGENCY CONTACT 
    # GET /api/emergency-contact
    # Gets all emergency contains of `o_email`
    @app.route("/emergency-contact")
    def get_emergency_contact():
        o_email = request.args.get("o_email")
        contacts = db.getEmergencyContact(o_email)

        if not contacts:
            return jsonify({ "error": "Contacts not found" }), 404
        
        return jsonify(contacts)

    # 3) DOG ROUTES
    @app.route("/dogs")
    def get_all_dogs():
        return db.getAllDogs()

    # Get the breeds of all dogs
    @app.route("/dog-breeds")
    def get_all_dog_breeds():
        return db.getAllDogBreeds()
    #     return get_table_data(DogBreed)

    # 4) SERVICE PROVIDER ROUTES
    @app.route("/service-providers")
    def service_provider():
        return db.getAllSvcProviders()

    # 5) REVIEWS
    @app.route("/reviews")
    def get_all_reviews():
        return db.getAllReviews()

    # 6) BOOKING ROUTES
    @app.route("/bookings")
    def get_all_bookings():
        return db.getAllBookings()

    @app.route("/booked-dogs")
    def get_all_booked_dogs():
        return db.getAllBookedDogs()
    
    # Create booking
    # TODO: ensure the primary keys EXIST before inserting anything.
    # 1) Ensure owner exists
    # 2) Ensure all dogs exist
    @app.route("/bookings", methods=["POST"])
    def create_booking():
        data = request.get_json()

        # Extract + validate required fields
        required = [
            "o_email", "start_datetime", "end_datetime",
            "service_type", "price", "dog_names", "city", "street",
        ]
        missing = [k for k in required if k not in data]
        if missing:
            return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

        try:
            o_email = data["o_email"]

            # parse ISO8601 timestamps like "2025-10-30T14:30:00"
            start_datetime = datetime.fromisoformat(data["start_datetime"])
            end_datetime = datetime.fromisoformat(data["end_datetime"])

            # enum conversion
            service_type = ServiceType[data["service_type"].upper()]  # e.g. "WALKING" → ServiceType.WALKING

            price = float(data["price"])
            dog_names = data["dog_names"]

            city = data["city"]
            street = data["street"]

        except (KeyError, ValueError) as e:
            return jsonify({"error": f"Invalid data format: {str(e)}"}), 400

        try:
            booking_id = db.createBooking({
                "o_email": o_email,
                "sp_email": None,  # Service provider is unknown when the booking is created
                "start_datetime": start_datetime,
                "end_datetime": end_datetime,
                "service_type": service_type,
                "price": price,
                "dog_names": dog_names,
                "street": street,
                "city": city
            }
            )
        except KeyError as e:
            return jsonify({"error": f"Non-existent account: {str(e)}"}), 400

        return jsonify({"message": "Booking created", "booking_id": booking_id}), 201
