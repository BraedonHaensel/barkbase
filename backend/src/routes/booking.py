from db.db import DB
from flask import request, jsonify
from datetime import date, datetime
from models.models import *
from middleware.auth_middleware import token_required
from dto.dto import TokenPayload
from models.models import Role

def init_booking_routes(app, db: DB):
    # 6) BOOKING ROUTES
    @app.route("/bookings")
    def get_all_bookings():
        return db.getAllBookings()

    @app.route("/booked-dogs")
    def get_all_booked_dogs():
        return db.getAllBookedDogs()
    
    # Create booking
    # Checking if keys exists was moved into db
    @app.route("/bookings", methods=["POST"])
    @token_required
    def create_booking():
        """
    Create a booking
    ---
    tags:
      - Bookings
    security:
      - bearerAuth: []        # requires JWT Authorization
    summary: Creates a new booking
    description: |
      This endpoint allows an authenticated **owner** to create a booking.
      The request must include a valid JWT Bearer token in the Authorization header.

    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - start_datetime
            - end_datetime
            - service_type
            - price
            - dog_names
            - province
            - city
            - street
          properties:
            start_datetime:
              type: string
              format: date-time
              example: 2025-10-30T14:30:00
            end_datetime:
              type: string
              format: date-time
              example: 2025-10-30T14:30:00
            service_type:
              type: string
              enum:
                - sitting
                - walking
            price:
              type: integer
            dog_names:
              type: array
              items: string
            province:
              type: string
              example: AB
            city:
              type: string
              example: Calgary
            street:
              type: string
              example: 2500 University drive
    responses:
      201:
        description: Success
        schema:
          type: object
          properties:
            booking_id:
              type: integer
      400:
        description: Invalid data format / Non-existent dog
      401:
        description: Invalid credentials

    """

        data = request.get_json()
        user_info: TokenPayload = request.payload #comes from the decoded JWT
        role = user_info["role"].lower()
        email = user_info["email"]

        if role != Role.OWNER:
            return jsonify({"error": f"Invalid account type"}), 401

        # Extract + validate required fields
        required = [
            "start_datetime", "end_datetime",
            "service_type", "price", "dog_names", "province", "city", "street",
        ]
        missing = [k for k in required if k not in data]
        if missing:
            return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

        try:
            # token = utils.details_from_token(data["token"])

            # if token == None:
            #     return jsonify({"error": f"Invalid token"}), 401
            # if token[1] != "owner":
            #     return jsonify({"error": f"Invalid account type"}), 401
            # o_email = token[0]

            # parse ISO8601 timestamps like "2025-10-30T14:30:00"
            start_datetime = datetime.fromisoformat(data["start_datetime"])
            end_datetime = datetime.fromisoformat(data["end_datetime"])

            # enum conversion
            service_type = ServiceType[data["service_type"].upper()]  # e.g. "WALKING" → ServiceType.WALKING

            price = float(data["price"])
            dog_names = data["dog_names"]

            province = data["province"]
            city = data["city"]
            street = data["street"]

        except (KeyError, ValueError) as e:
            return jsonify({"error": f"Invalid data format: {str(e)}"}), 400

        try:
            booking_id = db.createBooking({
                "o_email": email,
                "sp_email": None,  # Service provider is unknown when the booking is created
                "start_datetime": start_datetime,
                "end_datetime": end_datetime,
                "service_type": service_type,
                "price": price,
                "dog_names": dog_names,
                "province": province,
                "street": street,
                "city": city
            }
            )
        except KeyError as e:
            return jsonify({"error": f"Non-existent dog: {str(e)}"}), 400

        return jsonify({"message": "Booking created", "booking_id": booking_id}), 201
