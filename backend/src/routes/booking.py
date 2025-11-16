from db.db import DB
from flask import request, jsonify
from datetime import datetime, timedelta
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
    # GET bookings/me
    # If user is an owner, GET bookings made by them
    # Else if user is SP, GET bookings accepted by them
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
        summary: Get all bookings for the authenticated owner/service provider.
        description: |
          This endpoint returns all bookings created by the authenticated **owner**/**service provider**.
          Each booking includes its associated dogs and key details.
        parameters:
          - in: query
            name: when
            type: string
            enum: ["upcoming", "past", "all"]
            description: Filter by upcoming or past bookings
          - in: query
            name: status
            type: string
            enum: ["pending", "accepted", "all"]
            description: For owners only — filter by booking acceptance status
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
        email = user_info["email"]
        try:
            account_type = AccountType(user_info["account_type"].lower())
        except Exception as e:
            return jsonify({"error": "Invalid account type"}), 401

        # Fetch bookings
        bookings = booking_repo.get_by_email(email, account_type)

        # Filter by upcoming/past/all
        # Defaults to `all` if no param is passed in
        filter_when = request.args.get("when", "all")
        now = datetime.now()

        if filter_when == "upcoming":
            bookings = [b for b in bookings if b.start_datetime >= now]

        elif filter_when == "past":
            bookings = [b for b in bookings if b.start_datetime < now]

        # Filter by booking status
        filter_status = request.args.get("status", "all")
        if account_type == AccountType.OWNER:
            if filter_status == "pending":
                bookings = [b for b in bookings if b.sp_email is None]
            elif filter_status == "accepted":
                bookings = [b for b in bookings if b.sp_email is not None]

        result = []
        for booking in bookings:
            booked_dogs = booking_repo.get_booked_dogs(booking.id)

            booking_dto = convert_booking_to_dto(booking, booked_dogs)

            result.append(booking_dto)

        return jsonify(result), 200

    # GET AVAILABLE BOOKINGS (Service Provider only)
    # Available: no SP has accepted this booking + booking has not expired yet
    @app.route("/bookings/available", methods=["GET"])
    @token_required
    def get_available_bookings():
        """
        Get all available bookings (SP only)
        ---
        tags:
          - Bookings
        security:
          - bearerAuth: []
        summary: Get all available bookings for service providers
        description: |
          Returns all bookings that have no assigned service provider yet.
          These bookings are open and available for acceptance.
        responses:
          200:
            description: Successfully retrieved available bookings
            schema:
              type: array
              items:
                $ref: '#/definitions/BookingDto'
          401:
            description: Unauthorized (must be a service provider)
        """
        user_info: TokenPayload = request.payload
        account_type = AccountType(user_info["account_type"].lower())

        # Only service providers can see available bookings
        if account_type != AccountType.SERVICE_PROVIDER:
            return jsonify({"error": "Invalid account type"}), 401

        bookings = booking_repo.get_available_bookings()

        # Convert bookings → DTOs
        result = []
        for booking in bookings:
            booked_dogs = booking_repo.get_booked_dogs(booking.id)
            dto = convert_booking_to_dto(booking, booked_dogs)
            result.append(dto)

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
              $ref: '#/definitions/BookingCreateDto'
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
          409:
            description: Booking cannot be modified once accepted.
        """

        data = request.get_json()
        user_info: TokenPayload = request.payload
        email = user_info["email"]
        try:
            account_type = AccountType(user_info["account_type"].lower())
        except Exception as e:
            return jsonify({"error": "Invalid account type"}), 401

        # Only owners can update their bookings
        if account_type != AccountType.OWNER:
            return jsonify({"error": "Invalid account type"}), 401

        # Retrieve the booking to ensure it exists
        booking = booking_repo.get_by_id(booking_id)
        if not booking:
            return jsonify({"error": f"Booking ID {booking_id} not found"}), 400

        # Ensure the booking belongs to this user
        if booking.o_email != email:
            return (
                jsonify({"error": "You are not authorized to update this booking"}),
                401,
            )

        # Forbid any changes if a service provider has been assigned.
        if booking.sp_email is not None:
            return (
                jsonify({"error": "Booking cannot be modified once accepted."}),
                409,
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
          409:
            description: Can only delete a booking at least 48 hours in advance
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

        # Can only delete booking if it's 48 hours in advance OR if booking already ended
        now = datetime.now()
        time_diff = booking.start_datetime - now

        # Booking is in the future AND within 48 hours → deletion forbidden
        if booking.start_datetime > now and time_diff < timedelta(hours=48):
            return (
                jsonify(
                    {
                        "error": "Bookings can only be deleted at least 48 hours in advance."
                    }
                ),
                409,
            )

        success = booking_repo.delete_booking(booking)
        if success:
            return jsonify({"message": "Booking deleted successfully"}), 200
        else:
            return jsonify({"error": f"Failed to delete booking: {str(e)}"}), 500

    # ACCEPT BOOKING (Service Provider only)
    @app.route("/bookings/<int:booking_id>/accept", methods=["PATCH"])
    @token_required
    def accept_booking(booking_id):
        """
        Accept a booking
        ---
        tags:
          - Bookings
        security:
          - bearerAuth: []
        summary: Service provider accepts a booking request
        description: |
          This endpoint allows an authenticated **service provider** to accept a booking.

        parameters:
          - in: path
            name: booking_id
            required: true
            type: integer
            description: ID of the booking to accept

        responses:
          200:
            description: Booking successfully accepted
            schema:
              $ref: '#/definitions/BookingDto'
          400:
            description: Booking not found or invalid state
          401:
            description: Unauthorized (not a service provider)
        """
        user_info: TokenPayload = request.payload
        account_type = AccountType(user_info["account_type"].lower())
        sp_email = user_info["email"]

        # Only service providers can accept
        if account_type != AccountType.SERVICE_PROVIDER:
            return (
                jsonify({"error": "Invalid account type - Service Providers only."}),
                401,
            )

        # Fetch booking
        booking = booking_repo.get_by_id(booking_id)
        if not booking:
            return jsonify({"error": f"Booking ID {booking_id} not found"}), 400

        # Check if the booking is already assigned
        if booking.sp_email is not None and booking.sp_email != sp_email:
            return (
                jsonify(
                    {"error": "This booking is assigned to another service provider"}
                ),
                401,
            )

        # Assign SP and update status
        try:
            updated_booking = booking_repo.accept_booking(booking, sp_email)
        except Exception as e:
            return jsonify({"error": f"Failed to accept booking: {str(e)}"}), 500

        # Return DTO
        booked_dogs = booking_repo.get_booked_dogs(booking.id)
        dto = convert_booking_to_dto(updated_booking, booked_dogs)

        return jsonify(dto), 200

    # DROP BOOKING (Service Provider only)
    @app.route("/bookings/<int:booking_id>/drop", methods=["PATCH"])
    @token_required
    def drop_booking(booking_id):
        """
        Unaccept a booking (only allowed up to 48 hours before)
        ---
        tags:
          - Bookings
        security:
          - bearerAuth: []
        summary: Service provider withdraws acceptance of a booking request
        description: |
          This endpoint allows an authenticated **service provider** to drop a booking.

        parameters:
          - in: path
            name: booking_id
            required: true
            type: integer
            description: ID of the booking to drop

        responses:
          200:
            description: Booking successfully  dropped
            schema:
              $ref: '#/definitions/BookingDto'
          400:
            description: Booking not found or invalid state
          401:
            description: Unauthorized (not the correct service provider)
          409:
            description: Cannot drop booking within 48 hours of start time
        """
        user_info: TokenPayload = request.payload
        account_type = AccountType(user_info["account_type"].lower())
        sp_email = user_info["email"]

        # Only service providers can accept
        if account_type != AccountType.SERVICE_PROVIDER:
            return (
                jsonify({"error": "Invalid account type - Service Providers only."}),
                401,
            )

        # Fetch booking
        booking = booking_repo.get_by_id(booking_id)
        if not booking:
            return jsonify({"error": f"Booking ID {booking_id} not found"}), 400

        # Only can unaccept the booking if it belongs to this service provider
        if booking.sp_email is None or booking.sp_email != sp_email:
            return (
                jsonify(
                    {
                        "error": "This booking either has no Service Provider, or is assigned to another Service Provider."
                    }
                ),
                401,
            )

        # Only can uncccept the booking if it's passed, OR if it's at least 48 hours before
        now = datetime.now()
        time_diff = booking.start_datetime - now

        # If booking is in the future & within 24 hours → dropping forbidden
        if booking.start_datetime > now and time_diff < timedelta(hours=48):
            return (
                jsonify(
                    {
                        "error": "Bookings may only be dropped at least 24 hours in advance."
                    }
                ),
                409,
            )

        # Remove SP
        try:
            updated_booking = booking_repo.drop_booking(booking, sp_email)
        except Exception as e:
            return jsonify({"error": f"Failed to drop booking: {str(e)}"}), 500

        # Return DTO
        booked_dogs = booking_repo.get_booked_dogs(booking.id)
        dto = convert_booking_to_dto(updated_booking, booked_dogs)

        return jsonify(dto), 200
