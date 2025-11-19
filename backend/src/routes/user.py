from db.db import DB
from middleware.auth_middleware import token_required
from repo.owner_repo import OwnerRepo
from repo.sp_repo import ServiceProviderRepo
from flask import request, jsonify
from dto.dto import OwnerDTO, ServiceProviderDTO, TokenPayload
from utils.images import get_user_image_url, validate_image_file, save_user_image
from werkzeug.security import generate_password_hash, check_password_hash
from enums.enums import AccountType, Province


# routes to get user details
def init_user_routes(app, db: DB, owner_repo: OwnerRepo, sp_repo: ServiceProviderRepo):
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
      The structure of the response depends on the user's account type:
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
              province: "AB"
              city: "Calgary"
              street: "55 Sunshine Pl NE"
              phone_num: "4039997777"
              image_url: "http://127.0.0.1:5000/static/images/img.jpg"
            sp_example:
              email: "alice.swift@gmail.com"
              f_name: "Alice"
              l_name: "Swift"
              province: "AB"
              city: "Calgary"
              street: "22 Nose Hill Way NW"
              phone_num: "4038881234"
              image_url: "http://127.0.0.1:5000/static/images/img.jpg"
      400:
        description: Invalid account type specified in token
        schema:
          type: object
          properties:
            error:
              type: string
              example: Invalid account type
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

        user_info: TokenPayload = request.payload #comes from the decoded JWT
        account_type = AccountType(user_info["account_type"].lower())
        email = user_info["email"]

        if account_type == AccountType.OWNER:
            owner = owner_repo.get_by_email(email)
            if not owner:
                return jsonify({"error": "Owner not found"}), 404

            # explicitly shape into OwnerDTO
            dto: OwnerDTO = {
                "email": owner.email,
                "f_name": owner.f_name,
                "l_name": owner.l_name,
                "province": owner.province,
                "city": owner.city,
                "street": owner.street,
                "phone_num": owner.phone_num,
                "image_url": get_user_image_url(owner.image_filename),
            }
            return jsonify(dto), 200

        elif account_type == AccountType.SERVICE_PROVIDER:
            sp = sp_repo.get_by_email(email)
            if not sp:
                return jsonify({"error": "Service provider not found"}), 404

            # explicitly shape into DTO
            dto: ServiceProviderDTO = {
                "email": sp.email,
                "f_name": sp.f_name,
                "l_name": sp.l_name,
                "province": sp.province,
                "city": sp.city,
                "street": sp.street,
                "phone_num": sp.phone_num,
                "image_url": get_user_image_url(sp.image_filename),
            }
            return jsonify(dto), 200
        
        else:
            return jsonify({"error": "Invalid account type"}), 400

    @app.route("/users", methods=["PATCH"])
    @token_required
    def update_user():
        """
    Updates a user
    ---
    tags:
      - Users
    security:
      - bearerAuth: []        # JWT Authorization
    summary: Register a new user (Owner or Service Provider)
    consumes:
      - multipart/form-data
    parameters:
      - in: formData
        name: f_name
        type: string
        required: true
        default: Bob
        example: Bob
      - in: formData
        name: l_name
        type: string
        required: true
        default: Doe
        example: Doe
      - in: formData
        name: province
        type: string
        required: true
        default: AB
        example: AB
      - in: formData
        name: city
        type: string
        required: true
        default: Calgary
        example: Calgary
      - in: formData
        name: street
        type: string
        required: true
        default: 55 Sunshine Pl NE
        example: 55 Sunshine Pl NE
      - in: formData
        name: phone_num
        type: string
        required: true
        default: "4039997777"
        example: "4039997777"
      - in: formData
        name: image_file
        type: file
        required: false
        description: Profile image file
    responses:
      200:
        description: Success
      400:
        description: Missing or invalid fields
        """

        data = request.form

        user_info: TokenPayload = request.payload #comes from the decoded JWT
        account_type = AccountType(user_info["account_type"].lower())
        email = user_info["email"]

        # Validate required fields
        required = ["f_name", "l_name", "province", "city", "street", "phone_num"]
        missing = [k for k in required if not data.get(k)]
        if missing:
            return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

        try:
            # Parse the request data
            f_name = data.get("f_name")
            l_name = data.get("l_name")
            province = Province(data.get("province").upper())
            city = data.get("city")
            street = data.get("street")
            phone_num = data.get("phone_num")
            image_file = request.files.get("image_file")
        except (KeyError, ValueError) as e:
            return jsonify({"error": f"Invalid data format: {str(e)}"}), 400

        # Validate and save the optional user profile image change
        if image_file:
            if not validate_image_file(image_file):
                return jsonify({"error": "Unsupported image file type"}), 400
            image_filename = save_user_image(app, image_file)
        else:
            image_filename = None
            

        try:
            db.updateUser(
                email=email,
                account_type=account_type,
                f_name=f_name,
                l_name=l_name,
                province=province,
                city=city,
                street=street,
                phone_num=phone_num,
                image_filename=image_filename,
            )

            return jsonify({"message": "success"}), 200

        except Exception as e:
            print("Error during update:", e)
            return jsonify({"error": "Internal server error"}), 500

    # CHANGE PASSWORD
    @app.route("/users/change_password", methods=["PATCH"])
    @token_required
    def change_password():
        data = request.get_json()

        user_info: TokenPayload = request.payload
        account_type = AccountType(user_info["account_type"].lower())
        email = user_info["email"]

        # Validate required fields
        required = ["old_password", "new_password"]
        missing = [k for k in required if k not in data]
        if missing:
            return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400
        
        try:
            # Parse the request data
            old_password = data["old_password"]
            new_password = data["new_password"]
        except (KeyError, ValueError) as e:
            return jsonify({"error": f"Invalid data format: {str(e)}"}), 400

        # Verify that the old and new passwords are not the same
        if old_password == new_password:
            return jsonify({"error": "Invalid new password"}), 400

        # Get the user from the database
        if account_type == AccountType.OWNER:
            user = owner_repo.get_by_email(email)
        elif account_type == AccountType.SERVICE_PROVIDER:
            user = sp_repo.get_by_email(email)
        else:
            return jsonify({"error": "Invalid account type"}), 400
        
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Verify that the old password matches
        if not check_password_hash(user.password, old_password):
            return jsonify({"error": "Old password does not match"}), 400
        
        # Hash the new password
        hashed_pw = generate_password_hash(new_password, method="pbkdf2:sha256")

        try:
            db.updateUserPassword(
                email=email,
                account_type=account_type,
                hashed_pw=hashed_pw
            )

            return jsonify({"message": "Password successfully changed"}), 200

        except Exception as e:
            return jsonify({"error": f"Failed to change password"}), 500
