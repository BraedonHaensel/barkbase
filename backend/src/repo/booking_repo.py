from typing import Optional, List
from repo.base_repo import BaseRepo
from enums.enums import AccountType
from models.models import Booking, BookedDog
from dto.dto import BookingUpdateDto
from datetime import datetime


class BookingRepo(BaseRepo):
    def get_available_bookings(self) -> Optional[List[Booking]]:
        """Fetch available bookings (ie. bookings with no SP, and which hasn't expired yet.)"""

        now = datetime.now()  # or datetime.utcnow() depending on your DB usage

        bookings = (
            self.db.query(Booking)
            .filter(Booking.sp_email.is_(None), Booking.start_datetime >= now)
            .order_by(Booking.start_datetime.asc())
            .all()
        )

        return bookings

    def get_by_email(self, email, acc_type: AccountType) -> Optional[List[Booking]]:
        """Fetch a booking by the user's email and role."""
        if acc_type == AccountType.OWNER:
            bookings = self.db.query(Booking).filter(Booking.o_email == email).all()
        elif acc_type == AccountType.SERVICE_PROVIDER:
            bookings = self.db.query(Booking).filter(Booking.sp_email == email).all()
        else:
            return None
        return bookings

    def get_by_id(self, booking_id: int) -> Optional[Booking]:
        """Fetch a booking by its ID."""
        return self.db.query(Booking).filter(Booking.id == booking_id).first()

    # Get booked dogs for a particular booking ID.
    def get_booked_dogs(self, booking_id: int) -> Optional[List[BookedDog]]:
        return self.db.query(BookedDog).filter(BookedDog.booking_id == booking_id).all()

    def update(self, booking: Booking, request: BookingUpdateDto) -> Booking:
        """Updates an existing booking."""
        booking.start_datetime = request["start_datetime"]
        booking.end_datetime = request["end_datetime"]
        booking.service_type = request["service_type"]
        booking.price = request["price"]
        booking.province = request["province"]
        booking.city = request["city"]
        booking.street = request["street"]
        booking.note = request["note"]

        # Update booked dogs
        dog_names = request["dog_names"]
        self.db.query(BookedDog).filter(BookedDog.booking_id == booking.id).delete()
        for name in dog_names:
            self.db.add(
                BookedDog(booking_id=booking.id, d_name=name, o_email=booking.o_email)
            )

        self.db.commit()
        self.db.refresh(booking)
        return booking

    def delete_booking(self, booking: Booking) -> bool:
        """
        Deletes a booking from DB.
        Returns true if successful, else false.
        """
        try:
            self.db.delete(booking)
            self.db.commit()
            return True
        except Exception:
            self.db.rollback()
            return False

    def accept_booking(self, booking: Booking, sp_email: str) -> Booking:
        """
        Accepts the booking, and returns the updated booking.
        """
        booking.sp_email = sp_email
        self.db.commit()
        self.db.refresh(
            booking
        )  # Refresh all attributes on this booking object, so updated fields are shown

        return booking

    def drop_booking(self, booking: Booking, sp_email: str) -> Booking:
        """
        Unassigns the SP from the booking, and returns the updated booking.
        """

        booking.sp_email = None
        self.db.commit()
        self.db.refresh(
            booking
        )  # Refresh all attributes on this booking object, so updated fields are shown

        return booking
