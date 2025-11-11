from db.db import DB
from flask import request, jsonify
from datetime import date, datetime
from models.models import *
from middleware.auth_middleware import token_required
from dto.dto import TokenPayload
from models.models import Role
from models.models import Dog


def init_dog_routes(app, db: DB):

    @app.route("/dogs")
    def get_all_dogs():
        return db.getAllDogs()

    # Get the breeds of all dogs
    @app.route("/dog-breeds")
    def get_all_dog_breeds():
        return db.getAllDogBreeds()

    @app.route("/owner/add_dog", methods=["POST"])
    @token_required
    def add_dog():
        """
    Add a dog
    ---
    tags:
      - Dogs
    security:
      - bearerAuth: []        # requires JWT Authorization
    summary: Creates a new booking
    description: |
      This endpoint allows an authenticated **owner** to add a dog.
      The request must include a valid JWT Bearer token in the Authorization header.

    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - name
            - birth_date
            - size
          properties:
            birth_date:
              type: string
              format: date-time
              example: 2025-10-30T14:30:00
            size:
              type: string
              enum:
                - small
                - medium
                - large
            name:
              type: string
              example: storm
    responses:
      201:
        description: Success
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

        required = [
            "name", "birth_date", "size",
        ]
        missing = [k for k in required if k not in data]
        if missing:
            return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

        try:
            birth_date = datetime.fromisoformat(data["birth_date"])
            size = Dog.Size[data["size"].upper()]
            name = data["name"]

        except (KeyError, ValueError) as e:
            return jsonify({"error": f"Invalid data format: {str(e)}"}), 400

        try:
            db.addDog({
                "o_email": email,
                "name": name,
                "birth_date": birth_date,
                "size": size
            })
        except KeyError as e:
            return jsonify({"error": f"Invalid key: {str(e)}"}), 400

        return jsonify({"message": "Success"}), 201


    @app.route("/owner/remove_dog", methods=["POST"])
    @token_required
    def remove_dog():
        """
    Gets a list of dogs owned by the authenticated user
    ---
    tags:
      - Dogs
    security:
      - bearerAuth: []        # requires JWT Authorization
    summary: Removes a dog
    description: |
      This endpoint allows an authenticated **owner** to remove a dogs.
      The request must include a valid JWT Bearer token in the Authorization header.
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - name
          properties:
            name:
              type: string
              example: Olddy
    responses:
      205:
        description: Success
      401:
        description: Invalid credentials
      400:
        description: Invalid data format / Non-existent dog

        """
        data = request.get_json()
        user_info: TokenPayload = request.payload #comes from the decoded JWT
        role = user_info["role"].lower()
        email = user_info["email"]

        if role != Role.OWNER:
            return jsonify({"error": f"Invalid account type"}), 401

        required = ["name"]
        missing = [k for k in required if k not in data]
        if missing:
            return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

        try:
            name = data["name"]

        except (KeyError, ValueError) as e:
            return jsonify({"error": f"Invalid data format: {str(e)}"}), 400

        try:
            dog = db.getDog(email, name)
            if dog == None:
                return jsonify({"error": f"Non-existent dog: {name}"}), 400
        except Exception as e:
            return jsonify({"error": f"Non-existent dog: {name}"}), 400

        for i in dog:
            db.remove_dog(i)
        return jsonify({"message": "Success"}), 205


    @app.route("/owner/get_my_dog", methods=["POST"])
    @token_required
    def get_my_dogs():
        """
    Gets a list of dogs owned by the authenticated user
    ---
    tags:
      - Dogs
    security:
      - bearerAuth: []        # requires JWT Authorization
    summary: Creates a new booking
    description: |
      This endpoint allows an authenticated **owner** to get their dogs.
      The request must include a valid JWT Bearer token in the Authorization header.

    responses:
      200:
        description: Success
        schema:
          type: object
          properties:
            dogs:
              type: array
              items: object
              properties:
                name:
                  type: string
                  example: storm
                birth_date:
                  type: string
                  example: 2025-10-30T14:30:00
                size:
                  type: string
                  enum:
                    - small
                    - medium
                    - large
      401:
        description: Invalid credentials

        """

        user_info: TokenPayload = request.payload #comes from the decoded JWT
        role = user_info["role"].lower()
        email = user_info["email"]

        if role != Role.OWNER:
            return jsonify({"error": f"Invalid account type"}), 401

        dogs = db.get_my_dogs(email)
        word = "dogs: ["

        for i in dogs:
            word += ("[name:" + i.name + ",birth_date:" +
                str(i.birth_date) + ",size:" + str(i.size) + "],")
        word = word[:-1] + "]"
        return jsonify({"message": "Success", "dogs": word}), 200

