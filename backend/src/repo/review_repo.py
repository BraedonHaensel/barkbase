from typing import List, Optional
from datetime import date
from sqlalchemy import func
from utils.images import get_user_image_url
from repo.base_repo import BaseRepo
from models.models import Review, ServiceProvider
from dto.dto import ReviewDTO
from enums.enums import ServiceType
from db.db import DB


class ReviewRepo(BaseRepo):
    # Helper function to check if an SP exists. Raises value error if they don't exist.
    def _ensure_service_provider_exists(self, sp_email: str) -> None:
        exists = (
            self.db.query(ServiceProvider.email)
            .filter(ServiceProvider.email == sp_email)
            .first()
        )
        if not exists:
            raise ValueError("Service provider does not exist.")

    def _to_dto(self, review: Review) -> ReviewDTO:
        # Add the owner's profile image URL
        owner = DB.getOwnerByEmail(self, review.o_email)
        o_image_url = get_user_image_url(owner["image_filename"])

        return {
            "id": review.id,
            "o_email": review.o_email,
            "o_image_url": o_image_url,
            "sp_email": review.sp_email,
            "service_type": review.service_type.name,
            "date": review.date.isoformat(),
            "star_rating": review.star_rating,
            "description": review.description,
        }

    def getAllReviews(self) -> List[ReviewDTO]:
        reviews: List[Review] = self.db.query(Review).all()
        return [self._to_dto(review) for review in reviews]

    def get_reviews_by_service_provider(self, sp_email: str) -> List[ReviewDTO]:
        reviews: List[Review] = (
            self.db.query(Review).filter(Review.sp_email == sp_email).all()
        )
        return [self._to_dto(review) for review in reviews]

    # Applies an SQL aggregate function to get the average star ratings of rows grouped by sp_email.
    def get_average_rating_for_service_provider(self, sp_email: str) -> Optional[float]:
        avg_query = (
            self.db.query(
                func.avg(Review.star_rating)
            )  # aggregate average star ratings for the given sp
            .filter(Review.sp_email == sp_email)
            .scalar()
        )
        if avg_query is None:
            return None
        return float(avg_query)

    def getReviewById(self, review_id: int) -> Optional[ReviewDTO]:
        review = self.db.query(Review).filter(Review.id == review_id).first()
        if review is None:
            return None
        return self._to_dto(review)

    def create_review(
        self,
        *,
        o_email: str,
        sp_email: str,
        service_type: str,
        review_date: str,
        star_rating: int,
        description: str,
    ) -> ReviewDTO:
        try:
            service_type_enum = ServiceType(service_type.lower())
        except ValueError as exc:
            raise ValueError(
                "Invalid service_type. Expected WALKING or SITTING."
            ) from exc

        try:
            parsed_date = date.fromisoformat(review_date)
        except ValueError as exc:
            raise ValueError("Invalid date format. Use YYYY-MM-DD.") from exc

        if not 1 <= star_rating <= 5:
            raise ValueError("star_rating must be between 1 and 5.")

        # Check if SP exists before writing - else, raise a ValueError
        self._ensure_service_provider_exists(sp_email)

        review = Review(
            o_email=o_email,
            sp_email=sp_email,
            service_type=service_type_enum,
            date=parsed_date,
            star_rating=star_rating,
            description=description,
        )

        self.db.add(review)
        self.db.commit()
        self.db.refresh(review)

        return self._to_dto(review)

    def update_review(
        self,
        review_id: int,
        *,
        o_email: str,
        sp_email: Optional[str] = None,
        service_type: Optional[str] = None,
        review_date: Optional[str] = None,
        star_rating: Optional[int] = None,
        description: Optional[str] = None,
    ) -> ReviewDTO:
        review = (
            self.db.query(Review)
            .filter(Review.id == review_id, Review.o_email == o_email)
            .first()
        )

        if review is None:
            raise KeyError("Review not found.")

        # Ensure SP exists before updating
        if sp_email is not None:
            self._ensure_service_provider_exists(sp_email)
            review.sp_email = sp_email

        if service_type is not None:
            try:
                service_type_enum = ServiceType(service_type.lower())
            except ValueError as exc:
                raise ValueError(
                    "Invalid service_type. Expected WALKING or SITTING."
                ) from exc
            review.service_type = service_type_enum

        if review_date is not None:
            try:
                parsed_date = date.fromisoformat(review_date)
            except ValueError as exc:
                raise ValueError("Invalid date format. Use YYYY-MM-DD.") from exc
            review.date = parsed_date

        if star_rating is not None:
            if not 1 <= star_rating <= 5:
                raise ValueError("star_rating must be between 1 and 5.")
            review.star_rating = star_rating

        if description is not None:
            review.description = description

        self.db.commit()
        self.db.refresh(review)

        return self._to_dto(review)

    def delete_review(self, review_id: int, *, o_email: str) -> None:
        review = (
            self.db.query(Review)
            .filter(Review.id == review_id, Review.o_email == o_email)
            .first()
        )

        # Raise KeyError if review not found
        if review is None:
            raise KeyError("Review not found.")

        self.db.delete(review)
        self.db.commit()
