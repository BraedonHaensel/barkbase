from db.db import DB
from flask import request, jsonify
from datetime import datetime
from models.models import *
from middleware.auth_middleware import token_required
from dto.dto import TokenPayload, BookingUpdateDto, BookingDto
from enums.enums import AccountType, ServiceType
from repo.booking_repo import BookingRepo
from typing import List


def convert_booking_to_dto(
    booking: Booking, booked_dogs: List[BookedDog]
) -> BookingDto:
    dog_names = [bd.d_name.capitalize() for bd in booked_dogs]

    dto: BookingDto = {
        "id": booking.id,
        "o_email": booking.o_email,
        "sp_email": booking.sp_email,
        "start_datetime": booking.start_datetime.isoformat(),
        "end_datetime": booking.end_datetime.isoformat(),
        "service_type": booking.service_type.name.upper(),
        "price": float(booking.price),
        "dog_names": dog_names,
        "province": (
            booking.province.name
            if hasattr(booking.province, "name")
            else booking.province
        ),
        "city": booking.city,
        "street": booking.street,
        "note": booking.note,
    }

    return dto


def init_booking_routes(app, db: DB, booking_repo: BookingRepo):
    # 6) BOOKING ROUTES
    # Get bookings made buy the user.
    @app.route("/bookings/me", methods=["GET"])
    @token_required
    def get_user_bookings():
        """
        Get my bookings
        ---
        tags:
          - Bookings
        security:
          - bearerAuth: []        # requires JWT Authorization
        summary: Get all bookings for the authenticated owner
        description: |
          This endpoint returns all bookings created by the authenticated **owner**.
          Each booking includes its associated dogs and key details.

        responses:
          200:
            description: Successfully retrieved user's bookings
            schema:
              type: array
              items:
                $ref: '#/definitions/BookingDto'
          401:
            description: Invalid credentials or not an owner
        """

        user_info: TokenPayload = request.payload  # comes from decoded JWT
        account_type = AccountType(user_info["account_type"].lower())
        email = user_info["email"]

        bookings = booking_repo.get_by_email(email, account_type)
        if bookings is None:
            return jsonify({"error": "Invalid account type"}), 401

        result = []
        for booking in bookings:
            # Get all dogs linked to this booking
            # booked_dogs = (
            #     booking_repo.db.query(BookedDog)
            #     .filter(BookedDog.booking_id == booking.id)
            #     .all()
            # )
            booked_dogs = booking_repo.get_booked_dogs(booking.id)

            booking_dto = convert_booking_to_dto(booking, booked_dogs)

            result.append(booking_dto)

        return jsonify(result), 200

    # CREATE BOOKING
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
                  description: "Start of the booking in ISO 8601 format (e.g. 2025-10-30T14:30:00Z)"
                  example: "2025-10-30T14:30:00"
                end_datetime:
                  type: string
                  description: "End of the booking in ISO 8601 format (e.g. 2025-10-30T16:30:00Z)"
                  example: "2025-10-30T14:30:00"
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
                  description: "List of dogs included in the booking"
                  example: ["chico", "amigo"]
                province:
                  type: string
                  example: AB
                city:
                  type: string
                  example: Calgary
                street:
                  type: string
                  example: 2500 University drive
                note:
                  type: string
                  description: "Optional note for the service provider (e.g., feeding instructions)"
                  example: "Please walk Chico with a harness, not a collar."
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
        user_info: TokenPayload = request.payload  # comes from the decoded JWT
        account_type = AccountType(user_info["account_type"].lower())
        email = user_info["email"]
        service_type = ServiceType[data["service_type"].upper()]

        if account_type != AccountType.OWNER:
            return jsonify({"error": f"Invalid account type"}), 401

        # Extract & validate required fields
        required = [
            "start_datetime",
            "end_datetime",
            "service_type",
            "price",
            "dog_names",
            "province",
            "city",
            "street",
        ]
        missing = [k for k in required if k not in data]
        if missing:
            return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

        try:
            # parse ISO8601 timestamps like "2025-10-30T14:30:00"
            start_datetime = datetime.fromisoformat(data["start_datetime"])
            end_datetime = datetime.fromisoformat(data["end_datetime"])

            price = float(data["price"])
            dog_names = data["dog_names"]
            dog_names = [
                name.strip().lower() for name in dog_names
            ]  # conert to lowercase and split extra spaces

            province = data["province"]
            city = data["city"]
            street = data["street"]
            note = data.get("note", "")

        except (KeyError, ValueError) as e:
            return jsonify({"error": f"Invalid data format: {str(e)}"}), 400
        
        # Check if the start datetime is in the past
        if start_datetime <= datetime.now():
            return jsonify({"error": "Start date must be in the future"}), 400
        
        # Check if the start datetime is later than the end datetime
        if start_datetime >= end_datetime:
            return jsonify({"error": "End date must be later than the start date"}), 400

        try:
            booking_id = db.createBooking(
                {
                    "o_email": email,
                    "sp_email": None,  # Service provider is unknown when the booking is created
                    "start_datetime": start_datetime,
                    "end_datetime": end_datetime,
                    "service_type": service_type,
                    "price": price,
                    "dog_names": dog_names,
                    "province": province,
                    "street": street,
                    "city": city,
                    "note": note,
                }
            )
        except KeyError as e:
            return jsonify({"error": f"Non-existent dog: {str(e)}"}), 400

        return jsonify({"message": "Booking created", "booking_id": booking_id}), 201

    # UPDATE BOOKING
    @app.route("/bookings/<int:booking_id>", methods=["PUT"])
    @token_required
    def update_booking(booking_id):
        """
        Update a booking
        ---
        tags:
          - Bookings
        security:
          - bearerAuth: []        # requires JWT Authorization
        summary: Updates an existing booking
        description: |
          This endpoint allows an authenticated **owner** to update one of their existing bookings.
          The request body must follow the `BookingUpdateDto` structure.

        parameters:
          - in: path
            name: booking_id
            required: true
            type: integer
            description: The unique ID of the booking to update
          - in: body
            name: body
            required: true
            schema:
              $ref: '#/definitions/BookingUpdateDto'
        responses:
          200:
            description: Booking successfully updated
            schema:
              $ref: '#/definitions/BookingDto'
          400:
            description: Invalid data or non-existent booking
          401:
            description: Unauthorized (wrong account type or not the owner)
        """

        data = request.get_json()
        user_info: TokenPayload = request.payload
        account_type = AccountType(user_info["account_type"].lower())
        email = user_info["email"]

        # Only owners can update their bookings
        if account_type != AccountType.OWNER:
            return jsonify({"error": "Invalid account type"}), 401

        # TODO: outsource to booking_repo
        # Retrieve the booking to ensure it exists
        # booking = (
        #     booking_repo.db.query(Booking).filter(Booking.id == booking_id).first()
        # )
        booking = booking_repo.get_by_id(booking_id)
        if not booking:
            return jsonify({"error": f"Booking ID {booking_id} not found"}), 400

        # Ensure the booking belongs to this user
        if booking.o_email != email:
            return (
                jsonify({"error": "You are not authorized to update this booking"}),
                401,
            )

        try:
            # Parse and validate inputs
            start_datetime = datetime.fromisoformat(data["start_datetime"])
            end_datetime = datetime.fromisoformat(data["end_datetime"])
            service_type = ServiceType[data["service_type"].upper()]
            price = float(data["price"])
            dog_names = [name.strip().lower() for name in data["dog_names"]]
            province = data["province"]
            city = data["city"]
            street = data["street"]
            note = data.get("note", "")
        except (KeyError, ValueError) as e:
            return jsonify({"error": f"Invalid data format: {str(e)}"}), 400
           
        # Check if the start datetime is later than the end datetime
        if start_datetime >= end_datetime:
            return jsonify({"error": "End date must be later than the start date"}), 400

        req: BookingUpdateDto = {
            "start_datetime": start_datetime,
            "end_datetime": end_datetime,
            "service_type": service_type,
            "price": price,
            "dog_names": dog_names,
            "province": province,
            "city": city,
            "street": street,
            "note": note,
        }

        booked_dogs = booking_repo.get_booked_dogs(booking.id)

        updated_booking = convert_booking_to_dto(
            booking_repo.update(booking=booking, request=req), booked_dogs=booked_dogs
        )

        return jsonify(updated_booking), 200

    # DELETE BOOKING
    # DELETE BOOKING
    @app.route("/bookings/<int:booking_id>", methods=["DELETE"])
    @token_required
    def delete_booking(booking_id):
        """
        Delete a booking
        ---
        tags:
          - Bookings
        security:
          - bearerAuth: []        # requires JWT Authorization
        summary: Deletes a booking by its ID
        description: |
          This endpoint allows an authenticated **owner** to delete one of their own bookings.
          Deleting a booking will automatically remove all associated booked dogs (via cascade delete).

        parameters:
          - in: path
            name: booking_id
            required: true
            type: integer
            description: The unique ID of the booking to delete
        responses:
          200:
            description: Booking successfully deleted
            schema:
              type: object
              properties:
                message:
                  type: string
                  example: "Booking deleted successfully"
          400:
            description: Booking not found
          401:
            description: Unauthorized (wrong account type or not the owner)
        """

        user_info: TokenPayload = request.payload
        account_type = AccountType(user_info["account_type"].lower())
        email = user_info["email"]

        # Only owners can delete their own bookings; service providers can only drop bookings but not delete them
        if account_type != AccountType.OWNER:
            return jsonify({"error": "Invalid account type"}), 401

        # Retrieve booking
        booking = booking_repo.get_by_id(booking_id)
        if not booking:
            return jsonify({"error": f"Booking ID {booking_id} not found"}), 400

        # Ensure user is authorized to delete the booking
        if booking.o_email != email:
            return (
                jsonify({"error": "You are not authorized to delete this booking"}),
                401,
            )

        success = booking_repo.delete_booking(booking)
        if success:
            return jsonify({"message": "Booking deleted successfully"}), 200
        else:
            return jsonify({"error": f"Failed to delete booking: {str(e)}"}), 500
