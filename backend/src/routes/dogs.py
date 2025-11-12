from db.db import DB
from flask import request, jsonify
from datetime import date, datetime
from models.models import *
from middleware.auth_middleware import token_required
from dto.dto import TokenPayload, DogDTO, UpdateDogDTO
from models.models import Role
from models.models import Dog

# helper to convert from Dog to DogDTO
def convert_dog_to_dog_dto(dog: Dog, db) -> DogDTO:
  # Get breeds 
  """
  Converts a Dog ORM object to a DogDTO with all breeds included.
  """
  # Query DogBreed to get all breeds linked to this dog
  breeds = (
      db.db.query(DogBreed.breed)
      .filter(and_(
          DogBreed.d_name == dog.name,
          DogBreed.o_email == dog.o_email
      ))
      .all()
  )

  # SQLAlchemy returns a list of tuples (e.g. [('Beagle',), ('Poodle',)])
  breed_list = [b[0] for b in breeds]

  return {
      "name": dog.name,
      "o_email": dog.o_email,
      "birth_date": dog.birth_date,
      "size": dog.size.name.lower(),  # Enum → lowercase string
      "breeds": breed_list
  }

def init_dog_routes(app, db: DB):
    # GET ALL OWNER'S DOGS
    @app.route("/dogs/me")
    @token_required
    def get_my_dogs():
        """
    Get my dogs
    ---
    tags:
      - Dogs
    security:
      - bearerAuth: []        # requires JWT Authorization
    summary: Get the authenticated owner's dogs
    description: |
      Returns a list of dogs owned by the authenticated user.
      The user's email is extracted from the JWT token.
      Only owners can access this endpoint.

    responses:
      200:
        description: Successfully retrieved user's dogs
        schema:
          type: array
          items:
            $ref: '#/definitions/DogDTO'
        examples:
          application/json:
            - name: "Storm"
              o_email: "bob@gmail.com"
              birth_date: "2010-01-20"
              size: "small"
              breeds: ["Golden Retriever", "Labrador"]
            - name: "Amigo"
              o_email: "bob@gmail.com"
              birth_date: "2010-02-13"
              size: "large"
              breeds: []
      401:
        description: Invalid credentials or not an owner
        schema:
          type: object
          properties:
            error:
              type: string
              example: Invalid account type
        """
        user_info: TokenPayload = request.payload #comes from the decoded JWT
        role = user_info["role"].lower()
        email = user_info["email"]

        if role != Role.OWNER:
            return jsonify({"error": f"Invalid account type"}), 401

        dogs = db.get_my_dogs(email)
        
        result: list[DogDTO] = []
        for dog in dogs:
            result.append(convert_dog_to_dog_dto(dog, db))
        
        return jsonify(result), 200

    # POST
    @app.route("/dogs", methods=["POST"])
    @token_required
    def create_dog():
        """
    Create a dog
    ---
    tags:
      - Dogs
    security:
      - bearerAuth: []        # requires JWT Authorization
    summary: Create a new dog (with multiple breeds)
    description: |
      This endpoint allows an authenticated **owner** to create a new dog.
      The request must include a valid JWT Bearer token in the Authorization header.
      The owner's email (`o_email`) is automatically extracted from the JWT token.

      You can optionally include a list of breeds for the dog.
      Each entry in the `breeds` list will be saved in the `dog_breed` table.

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
            name:
              type: string
              description: The name of the dog
              example: "Storm"
            birth_date:
              type: string
              format: date
              description: The dog's birth date in YYYY-MM-DD format
              example: "2010-01-20"
            size:
              type: string
              enum:
                - small
                - medium
                - large
              description: The size of the dog
              example: "small"
            breeds:
              type: array
              items:
                type: string
              description: |
                A list of breeds describing the dog.
                If not provided, the list defaults to empty.
              example: ["Golden Retriever", "Labrador"]
        examples:
          application/json:
            single_breed:
              name: "Storm"
              birth_date: "2010-01-20"
              size: "small"
              breeds: ["Beagle"]
            multiple_breeds:
              name: "Max"
              birth_date: "2018-06-15"
              size: "large"
              breeds: ["Golden Retriever", "Poodle"]
    responses:
      201:
        description: Dog successfully created
        schema:
          type: object
          properties:
            message:
              type: string
              example: "Dog created successfully"
        examples:
          application/json:
            message: "Dog created successfully"
      400:
        description: Invalid data format or missing required fields
        schema:
          type: object
          properties:
            error:
              type: string
              example: "Missing fields: birth_date, size"
        examples:
          application/json:
            error: "Missing fields: birth_date, size"
      401:
        description: Invalid credentials or not an owner
        schema:
          type: object
          properties:
            error:
              type: string
              example: "Invalid account type"
        examples:
          application/json:
            error: "Invalid account type"
        """
        data = request.get_json()
        user_info: TokenPayload = request.payload  # comes from the decoded JWT
        role = user_info["role"].lower()
        email = user_info["email"]

        if role != Role.OWNER:
            return jsonify({"error": "Invalid account type"}), 401

        # Required fields check
        required = ["name", "birth_date", "size"]
        missing = [k for k in required if k not in data]
        if missing:
            return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

        # Parse and validate fields
        try:
            name = data["name"]
            birth_date = date.fromisoformat(data["birth_date"])
            size = data["size"]
            breeds = data.get("breeds", [])
            if not isinstance(breeds, list):
                return jsonify({"error": "breeds must be a list of strings"}), 400
        except (KeyError, ValueError, TypeError) as e:
            return jsonify({"error": f"Invalid data format: {str(e)}"}), 400

        # Create the dog and its breeds
        try:
            db.addDog({
                "o_email": email,
                "name": name,
                "birth_date": birth_date,
                "size": size,
                "breeds": breeds
            })
        except KeyError as e:
            return jsonify({"error": f"Invalid key: {str(e)}"}), 400
        except ValueError as e:
            return jsonify({"error": str(e)}), 400
        except Exception as e:
            print("Error while creating dog:", e)
            return jsonify({"error": "Internal server error"}), 500

        return jsonify({"message": "Dog created successfully"}), 201

    #DELETE
    @app.route("/dogs", methods=["DELETE"])
    @token_required
    def remove_dog():
        """
    Delete a dog
    ---
    tags:
      - Dogs
    security:
      - bearerAuth: []        # requires JWT Authorization
    summary: Delete a dog
    description: |
      This endpoint allows an authenticated **owner** to delete one of their dogs.
      The dog is uniquely identified by the owner's email (from JWT token) and the dog's name.
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
              description: The name of the dog to delete
              example: Storm
    responses:
      200:
        description: Dog successfully deleted
        schema:
          type: object
          properties:
            message:
              type: string
              example: Dog successfully deleted
      400:
        description: Invalid data format or dog not found
        schema:
          type: object
          properties:
            error:
              type: string
              example: "Non-existent dog: Storm"
      401:
        description: Invalid credentials or not an owner
        schema:
          type: object
          properties:
            error:
              type: string
              example: Invalid account type
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

        dog = db.getDog(email, name)
        
        if dog is None:
            return jsonify({"error": f"Non-existent dog: {name}"}), 400

        try:
            # Remove the dog (this also handles related BookedDog and DogBreed records)
            db.remove_dog(dog)
            return jsonify({"message": "Dog successfully deleted"}), 200
        except Exception as e:
            return jsonify({"error": f"Error deleting dog: {str(e)}"}), 500

    #UPDATE
    @app.route("/dogs", methods=["PUT"])
    @token_required
    def update_dog():
      """
    Update a dog
    ---
    tags:
      - Dogs
    security:
      - bearerAuth: []        # requires JWT Authorization
    summary: Update an existing dog
    description: |
      This endpoint allows an authenticated **owner** to update one of their dogs.
      The dog is uniquely identified by the owner's email (from JWT token) and the dog's current name.
      The request body must include all fields defined in `UpdateDogDTO` (full replacement).
      The owner's email (o_email) is automatically extracted from the JWT token for security.
      To rename a dog, include both the current name (old_name) and the new name (name).
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
            - breeds
          properties:
            name:
              type: string
              description: The new name of the dog (or current name if not renaming)
              example: "Stormy"
            old_name:
              type: string
              description: The current name of the dog (required only if renaming)
              example: "Storm"
            birth_date:
              type: string
              format: date
              description: The dog's birth date in YYYY-MM-DD format
              example: "2010-01-20"
            size:
              type: string
              enum:
                - small
                - medium
                - large
              description: The size category of the dog
              example: "medium"
            breeds:
              type: array
              description: A list of the dog's breeds
              items:
                type: string
              example: ["Golden Retriever", "Labrador"]
    responses:
      200:
        description: Dog successfully updated
        schema:
          type: object
          properties:
            message:
              type: string
              example: "Dog successfully updated"
            dog:
              type: object
              properties:
                name:
                  type: string
                  example: "Stormy"
                o_email:
                  type: string
                  example: "bob@gmail.com"
                birth_date:
                  type: string
                  format: date
                  example: "2010-01-20"
                size:
                  type: string
                  enum:
                    - small
                    - medium
                    - large
                  example: "medium"
                breeds:
                  type: array
                  items:
                    type: string
                  example: ["Golden Retriever", "Labrador"]
      400:
        description: Invalid data format, missing fields, or dog not found
        schema:
          type: object
          properties:
            error:
              type: string
              example: "Dog not found: Storm"
      401:
        description: Invalid credentials or not an owner
        schema:
          type: object
          properties:
            error:
              type: string
              example: "Invalid account type"
      """

      data = request.get_json()
      user_info: TokenPayload = request.payload #comes from the decoded JWT
      role = user_info["role"].lower()
      email = user_info["email"]

      if role != Role.OWNER:
          return jsonify({"error": f"Invalid account type"}), 401

      # Validate required fields
      required = ["name", "birth_date", "size", "breeds"]
      missing = [k for k in required if k not in data]
      if missing:
          return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

      try:
          # Parse the request data
          name = data["name"]  # New name (or current name if not renaming)
          old_name = data.get("old_name", name)  # If old_name provided, use it; otherwise assume name is the identifier
          birth_date = date.fromisoformat(data["birth_date"])
          size = Dog.Size[data["size"].upper()]
          breeds = data["breeds"]
      except (KeyError, ValueError) as e:
          return jsonify({"error": f"Invalid data format: {str(e)}"}), 400

      try:
          # Prepare the update request in DogDTO format
          update_request: UpdateDogDTO = {
              "name": name,  # New name (or same if not renaming)
              "o_email": email,  # From token, not body
              "birth_date": birth_date,
              "size": size.name.lower(),  # Convert enum to string for DTO
              "breeds": breeds,
          }
          
          # Update the dog
          db.updateDog(email, old_name, update_request)
          
          # Get the updated dog to return
          updated_dog = db.getDog(email, name)
          
          if updated_dog is None:
              return jsonify({"error": f"Failed to retrieve updated dog"}), 500
          
          # Convert to DTO for response
          dog_dto = convert_dog_to_dog_dto(updated_dog, db)
          
          return jsonify({
              "message": "Dog successfully updated",
              "dog": dog_dto
          }), 200
          
      except KeyError as e:
          return jsonify({"error": f"Dog not found: {old_name}"}), 400
      except ValueError as e:
          return jsonify({"error": f"Invalid data: {str(e)}"}), 400
      except Exception as e:
          return jsonify({"error": f"Error updating dog: {str(e)}"}), 500