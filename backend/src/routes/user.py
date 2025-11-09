from middleware.auth_middleware import token_required
from repo.owner_repo import OwnerRepo
from repo.sp_repo import ServiceProviderRepo
from flask import request, jsonify
from dto.dto import OwnerDTO, ServiceProviderDTO

# routes to get user details
def init_user_routes(app, owner_repo: OwnerRepo, sp_repo: ServiceProviderRepo):
    # GET request
    # requires authentication & JWT token
    @app.route("/users/me")
    @token_required
    def get_user():
        """
    Get the currently authenticated user's details
    ---
    tags:
      - Users
    security:
      - bearerAuth: []        # JWT Authorization
    summary: Get the currently authenticated user's details
    description: |
      Returns the details of the user associated with the provided JWT token.
      The structure of the response depends on the user's role:
      - **Owner:** Returns an OwnerDTO.
      - **Service Provider:** Returns a ServiceProviderDTO.

    responses:
      200:
        description: Successfully retrieved user details
        schema:
          type: object
          oneOf:
            - $ref: '#/definitions/OwnerDTO'
            - $ref: '#/definitions/ServiceProviderDTO'
        examples:
          application/json:
            owner_example:
              email: "john.doe@gmail.com"
              f_name: "John"
              l_name: "Doe"
              address: "55 Sunshine Pl NE"
              phone_num: "4039997777"
            sp_example:
              email: "alice.swift@gmail.com"
              f_name: "Alice"
              l_name: "Swift"
              address: "22 Nose Hill Way NW"
              phone_num: "4038881234"
      400:
        description: Invalid role specified in token
        schema:
          type: object
          properties:
            error:
              type: string
              example: Invalid role
      401:
        description: Missing or invalid JWT token
        schema:
          type: object
          properties:
            error:
              type: string
              example: Authorization header missing or invalid
      404:
        description: User not found
        schema:
          type: object
          properties:
            error:
              type: string
    """

        user_info = request.user #comes from the decoded JWT
        role = user_info["role"]
        email = user_info["email"]

        if role == "owner":
            owner = owner_repo.get_by_email(email)
            if not owner:
                return jsonify({"error": "Owner not found"}), 404

            # explicitly shape into OwnerDTO
            dto: OwnerDTO = {
                "email": owner.email,
                "f_name": owner.f_name,
                "l_name": owner.l_name,
                "address": owner.address,
                "phone_num": owner.phone_num
            }
            return jsonify(dto), 200

        elif role == "service_provider":
            sp = sp_repo.get_by_email(email)
            if not sp:
                return jsonify({"error": "Service provider not found"}), 404

            # explicitly shape into DTO
            dto: ServiceProviderDTO = {
                "email": sp.email,
                "f_name": sp.f_name,
                "l_name": sp.l_name,
                "address": sp.address,
                "phone_num": sp.phone_num
            }
            return jsonify(dto), 200
        
        else:
            return jsonify({"error": "Invalid role"}), 400