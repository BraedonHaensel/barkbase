from typing import List, Optional
from flask import jsonify, request
from dto.dto import ReviewDTO, TokenPayload
from repo.review_repo import ReviewRepo
from middleware.auth_middleware import token_required
from enums.enums import AccountType


def init_review_routes(app, repo: ReviewRepo):
    # GET ALL REVIEWS
    @app.route("/reviews", methods=["GET"])
    def get_reviews():
        """
        Get all reviews
        ---
        tags:
          - Reviews
        summary: Retrieve all reviews
        description: |
          Returns every review stored in the system. The results include the owner and
          service provider emails, booking details and the written review.
        responses:
          200:
            description: A list of reviews
            schema:
              type: array
              items:
                $ref: '#/definitions/ReviewDTO'
            examples:
              application/json:
                - id: 1
                  o_email: "bob@gmail.com"
                  sp_email: "alice@gmail.com"
                  service_type: "WALKING"
                  date: "2024-10-25"
                  star_rating: 5
                  description: "Great walk!"
        """

        reviews: List[ReviewDTO] = repo.getAllReviews()
        return jsonify(reviews), 200

    # GET BY ID
    @app.route("/reviews/<int:review_id>", methods=["GET"])
    def get_review_by_id(review_id: int):
        """
        Get review by ID
        ---
        tags:
          - Reviews
        summary: Retrieve a single review
        description: |
          Looks up a specific review by its ID.
        parameters:
          - in: path
            name: review_id
            required: true
            type: integer
            description: ID of the review to fetch
            example: 1
        responses:
          200:
            description: Review found
            schema:
              $ref: '#/definitions/ReviewDTO'
          404:
            description: Review not found
        """

        review: Optional[ReviewDTO] = repo.getReviewById(review_id)

        if review is None:
            return jsonify({"error": "Review not found"}), 404

        return jsonify(review), 200

    # GET REVIEWS BY SP EMAIL
    @app.route("/reviews/service_provider/<sp_email>", methods=["GET"])
    def get_reviews_by_service_provider(sp_email: str):
        """
        Get reviews by service provider
        ---
        tags:
          - Reviews
        summary: Retrieve reviews written for a specific service provider
        parameters:
          - in: path
            name: sp_email
            required: true
            type: string
            description: Email of the service provider
            example: "alice@gmail.com"
            default: "alice@gmail.com"
        responses:
          200:
            description: Reviews for the service provider
            schema:
              type: array
              items:
                $ref: '#/definitions/ReviewDTO'
        """

        reviews = repo.get_reviews_by_service_provider(sp_email)
        return jsonify(reviews), 200

    # CREATE REVIEW
    @app.route("/reviews", methods=["POST"])
    @token_required
    def create_review():
        """
        Create a review
        ---
        tags:
          - Reviews
        security:
          - bearerAuth: []
        summary: Create a new review for a service provider
        description: |
          Allows an authenticated owner to submit a review for a service provider.
        parameters:
          - in: body
            name: body
            required: true
            schema:
              type: object
              required:
                - sp_email
                - service_type
                - date
                - star_rating
                - description
              properties:
                sp_email:
                  type: string
                  example: "alice@gmail.com"
                service_type:
                  type: string
                  enum: ["WALKING", "SITTING"]
                  example: "WALKING"
                date:
                  type: string
                  format: date
                  example: "2024-10-25"
                star_rating:
                  type: integer
                  example: 5
                description:
                  type: string
                  example: "Great walk!"
        responses:
          201:
            description: Review created
            schema:
              $ref: '#/definitions/ReviewDTO'
          400:
            description: Missing or invalid fields
          401:
            description: Unauthorized or invalid account type
        """

        data = request.get_json() or {}
        user_info: TokenPayload = request.payload
        account_type = AccountType(user_info["account_type"].lower())

        # Only owners can create reviews
        if account_type != AccountType.OWNER:
            return jsonify({"error": "Invalid account type"}), 401

        required_fields = [
            "sp_email",
            "service_type",
            "date",
            "star_rating",
            "description",
        ]
        missing = [field for field in required_fields if field not in data]
        if missing:
            return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

        try:
            star_rating = int(data["star_rating"])
        except (TypeError, ValueError):
            return jsonify({"error": "star_rating must be an integer"}), 400

        try:
            created = repo.create_review(
                o_email=user_info["email"],
                sp_email=data["sp_email"],
                service_type=data["service_type"],
                review_date=data["date"],
                star_rating=star_rating,
                description=data["description"],
            )
        except ValueError as exc:
            return jsonify({"error": str(exc)}), 400

        return jsonify(created), 201

    # UPDATE REVIEW
    @app.route("/reviews/<int:review_id>", methods=["PUT"])
    @token_required
    def update_review(review_id: int):
        """
        Update a review
        ---
        tags:
          - Reviews
        security:
          - bearerAuth: []
        summary: Update an existing review owned by the authenticated owner
        description: |
          Allows owners to modify reviews they created. Send any combination of fields to update.
        parameters:
          - in: path
            name: review_id
            required: true
            type: integer
            description: ID of the review to update
            example: 1
          - in: body
            name: body
            required: true
            schema:
              type: object
              properties:
                sp_email:
                  type: string
                  example: "alice@gmail.com"
                service_type:
                  type: string
                  enum: ["WALKING", "SITTING"]
                  example: "SITTING"
                date:
                  type: string
                  format: date
                  example: "2024-11-01"
                star_rating:
                  type: integer
                  example: 4
                description:
                  type: string
                  example: "Updated thoughts about the service."
        responses:
          200:
            description: Review updated
            schema:
              $ref: '#/definitions/ReviewDTO'
          400:
            description: Missing or invalid fields
          401:
            description: Unauthorized or invalid account type
          404:
            description: Review not found
        """

        data = request.get_json() or {}
        user_info: TokenPayload = request.payload
        account_type = AccountType(user_info["account_type"].lower())

        if account_type != AccountType.OWNER:
            return jsonify({"error": "Invalid account type"}), 401

        allowed_fields = [
            "sp_email",
            "service_type",
            "date",
            "star_rating",
            "description",
        ]
        if not any(field in data for field in allowed_fields):
            return (
                jsonify({"error": "At least one updatable field must be provided."}),
                400,
            )

        star_rating_value: Optional[int] = None
        if "star_rating" in data:
            try:
                star_rating_value = int(data["star_rating"])
            except (TypeError, ValueError):
                return jsonify({"error": "star_rating must be an integer"}), 400

        try:
            updated = repo.update_review(
                review_id,
                o_email=user_info["email"],
                sp_email=data.get("sp_email"),
                service_type=data.get("service_type"),
                review_date=data.get("date"),
                star_rating=star_rating_value,
                description=data.get("description"),
            )
        except ValueError as exc:
            return jsonify({"error": str(exc)}), 400
        except KeyError as exc:
            return jsonify({"error": str(exc)}), 404

        return jsonify(updated), 200

    # DELETE REVIEW
    @app.route("/reviews/<int:review_id>", methods=["DELETE"])
    @token_required
    def delete_review(review_id: int):
        """
        Delete a review
        ---
        tags:
          - Reviews
        security:
          - bearerAuth: []
        summary: Delete a review owned by the authenticated owner
        parameters:
          - in: path
            name: review_id
            required: true
            type: integer
            description: ID of the review to delete
            example: 1
        responses:
          200:
            description: Review deleted
            schema:
              type: object
              properties:
                message:
                  type: string
                  example: "Review deleted successfully"
          401:
            description: Unauthorized or invalid account type
          404:
            description: Review not found
        """

        user_info: TokenPayload = request.payload
        account_type = AccountType(user_info["account_type"].lower())

        if account_type != AccountType.OWNER:
            return jsonify({"error": "Invalid account type"}), 401

        try:
            repo.delete_review(review_id, o_email=user_info["email"])
        except KeyError as exc:
            return jsonify({"error": str(exc)}), 404

        return jsonify({"message": "Review deleted successfully"}), 200
