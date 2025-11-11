# from db.db import DB

from flask import jsonify, request
from repo.owner_repo import OwnerRepo
from repo.sp_repo import ServiceProviderRepo
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
import os
from models.models import Role
from utils.images import save_user_image, validate_image_file




def init_auth_routes(app, owner_repo: OwnerRepo, sp_repo: ServiceProviderRepo):
    # post request
    @app.route("/auth/test")
    def test():
        return jsonify(owner_repo.get_all())
    
    # Signup
    @app.route("/auth/signup", methods=["POST"])
    def signup():
        """
    Register a new user (Owner or Service Provider)
    ---
    tags:
      - Authentication
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - role
            - email
            - password
            - f_name
            - l_name
            - address
            - phone_num
            - image_file
          properties:
            role:
              type: string
              enum:
                - owner
                - service_provider
              example: owner
            email:
              type: string
              example: john@gmail.com
            password:
              type: string
              example: password
            f_name:
              type: string
              example: John
            l_name:
              type: string
              example: Doe
            address:
              type: string
              example: 55 Sunshine Pl NE
            phone_num:
              type: string
              example: "4039997777"
            image_file:
              type: string
              format: binary
              example: ""
    responses:
      201:
        description: Account created successfully
        schema:
          type: object
          properties:
            message:
              type: string
              example: Owner account created successfully.
      400:
        description: Missing or invalid fields
      409:
        description: User already exists
        """

        data = request.form

        email = data.get("email")
        password = data.get("password")
        f_name = data.get("f_name")
        l_name = data.get("l_name")
        address = data.get("address")
        phone_num = data.get("phone_num")
        role = data.get("role")  # "owner" or "service_provider"
        image_file = request.files.get("image_file")

        # 1) validate input
        required_fields = ["email", "password", "f_name", "l_name", "address", "phone_num", "role"]
        missing = [f for f in required_fields if not data.get(f)]
        if missing:
            return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

        # 2) choose correct repo based on role
        if role.lower() == Role.OWNER.lower():
            existing_user = owner_repo.get_by_email(email)
        elif role.lower() == Role.SERVICE_PROVIDER.lower():
            existing_user = sp_repo.get_by_email(email)
        else:
            return jsonify({"error": "Invalid role"}), 400

        # 3) Check if user already exists
        if existing_user:
            return jsonify({"error": f"User with email {email} already exists"}), 409

        # 4) Hash password
        hashed_pw = generate_password_hash(password, method="pbkdf2:sha256")

        # 5) Validate and save the user profile image
        if not validate_image_file:
            return jsonify({"error": "Unsupported image file type"}), 400
        image_filename = save_user_image(app, image_file)

        # 6) Create new user 
        try:
            if role.lower() == "owner":
                owner_repo.create(
                    email=email,
                    password=hashed_pw,
                    f_name=f_name,
                    l_name=l_name,
                    address=address,
                    phone_num=phone_num,
                    image_filename=image_filename,
                )
            else:
                sp_repo.create(
                    email=email,
                    password=hashed_pw,
                    f_name=f_name,
                    l_name=l_name,
                    address=address,
                    phone_num=phone_num,
                    image_filename=image_filename,
                )

            return jsonify({"message": f"{role.capitalize()} account created successfully."}), 201

        except Exception as e:
            print("Error during signup:", e)
            return jsonify({"error": "Internal server error"}), 500

    @app.route("/auth/login", methods=["POST"])
    def login():
        """
    Authenticate user and issue JWT
    ---
    tags:
      - Authentication
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - role
            - email
            - password
          properties:
            role:
              type: string
              enum:
                - owner
                - service_provider
            email:
              type: string
              example: john@gmail.com
            password:
              type: string
              example: password
    responses:
      200:
        description: Successful login
        schema:
          type: object
          properties:
            token:
              type: string
              description: JWT access token
            role:
              type: string
              example: owner
      400:
        description: Missing or invalid parameters
      401:
        description: Invalid credentials
        """

        data = request.get_json()
        email = data.get("email")
        password = data.get("password")
        role = data.get("role")  # "owner" or "service_provider"

        required_fields = ["email", "password", "role"]
        missing = [f for f in required_fields if not data.get(f)] # list of missing fields
        if missing:
            return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

        # 1. choose correct repo based on role
        if role.lower() == "owner":
            user = owner_repo.get_by_email(email)
        elif role.lower() == "service_provider":
            user = sp_repo.get_by_email(email)
        else:
            return jsonify({"error": "Invalid role"}), 400

        if not user or not check_password_hash(user.password, password):
            return jsonify({"error": "Invalid credentials"}), 401
        
        # Encode role inside JWT, send to client
        SECRET_KEY = os.getenv("JWT_SECRET_KEY")
        payload = {
        "email": email,
        "role": role.lower(),
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }
        token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")

        return jsonify({"token": token, "role": role}), 200
