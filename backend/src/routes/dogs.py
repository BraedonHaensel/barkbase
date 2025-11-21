from db.db import DB
from flask import request, jsonify
from datetime import date
from models.models import *
from middleware.auth_middleware import token_required
from dto.dto import TokenPayload, DogDTO, UpdateDogDTO
from models.models import Dog
from enums.enums import AccountType
from utils.images import get_dog_image_url, validate_image_file, save_dog_image


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
  breed_list = [b[0].title() for b in breeds]

  return {
      "name": dog.name.title(), # cnert to upp
      "o_email": dog.o_email,
      "birth_date": dog.birth_date,
      "size": dog.size.name.lower(),  # Enum → lowercase string
      "image_url": get_dog_image_url(dog.image_filename),
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
              image_url: "https://example.com/images/john.png"
              breeds: ["Golden Retriever", "Labrador"]
            - name: "Amigo"
              o_email: "bob@gmail.com"
              birth_date: "2010-02-13"
              size: "large"
              image_url: "https://example.com/images/john.png"
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
        account_type = AccountType(user_info["account_type"].lower())
        email = user_info["email"]

        if account_type != AccountType.OWNER:
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
    consumes:
      - multipart/form-data
    parameters:
      - in: formData
        name: name
        type: string
        required: true
        default: Storm
        description: The name of the dog
        example: Storm
      - in: formData
        name: birth_date
        type: string
        format: date
        required: true
        default: 2010-01-20
        description: The dog's birth date in YYYY-MM-DD format
        example: 2010-01-20
      - in: formData
        name: size
        type: string
        required: true
        enum: [small, medium, large]
        default: medium
        description: The size of the dog
        example: medium
      - in: formData
        name: image_file
        type: file
        required: true
        description: Dog image file
      - in: formData
        name: breeds
        type: array
        items:
          type: string
        required: true
        default: ["Golden Retriever", "Labrador"]
        description: |
          A list of breeds describing the dog.
          If not provided, the list defaults to empty.
        example: ["Golden Retriever", "Labrador"]
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
        data = request.form

        user_info: TokenPayload = request.payload  # comes from the decoded JWT
        account_type = AccountType(user_info["account_type"].lower())
        email = user_info["email"]

        if account_type != AccountType.OWNER:
            return jsonify({"error": "Invalid account type"}), 401

        # Required fields check
        required = ["name", "birth_date", "size", "breeds"]
        missing = [k for k in required if not data.get(k)]
        if missing:
            return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

        # Parse and validate fields
        try:
            name = data.get("name").lower()
            birth_date = date.fromisoformat(data.get("birth_date"))
            size = data.get("size")
            image_file = request.files.get("image_file")
            breeds = data.getlist("breeds")
            if not isinstance(breeds, list):
                return jsonify({"error": "breeds must be a list of strings"}), 400
        except (KeyError, ValueError, TypeError) as e:
            return jsonify({"error": f"Invalid data format: {str(e)}"}), 400

        # Validate and save the dog profile image
        if not validate_image_file(image_file):
            return jsonify({"error": "Unsupported image file type"}), 400
        image_filename = save_dog_image(app, image_file)

        # Create the dog and its breeds
        try:
            db.addDog({
                "o_email": email,
                "name": name,
                "birth_date": birth_date,
                "size": size,
                "image_filename": image_filename,
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
        account_type = AccountType(user_info["account_type"].lower())
        email = user_info["email"]

        if account_type != AccountType.OWNER:
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
      The request body must include all fields defined in `UpdateDogDTO` except for the image_filename.
      The owner's email (o_email) is automatically extracted from the JWT token for security.
      To rename a dog, include both the current name (old_name) and the new name (name).
      To change an image, include the image_file field.
    parameters:
      - in: formData
        name: name
        type: string
        required: true
        default: Storm
        description: The new name of the dog (or current name if not renaming)
        example: Storm
      - in: formData
        name: old_name
        type: string
        required: false
        description: The current name of the dog before the change (required only if renaming)
        example: Storm
      - in: formData
        name: birth_date
        type: string
        format: date
        required: true
        default: 2010-01-20
        description: The dog's birth date in YYYY-MM-DD format
        example: 2010-01-20
      - in: formData
        name: size
        type: string
        required: true
        enum: [small, medium, large]
        default: medium
        description: The size of the dog
        example: medium
      - in: formData
        name: image_file
        type: file
        required: false
        description: Dog image file
      - in: formData
        name: breeds
        type: array
        items:
          type: string
        required: true
        default: ["Golden Retriever", "Labrador"]
        description: |
          A list of breeds describing the dog.
          If not provided, the list defaults to empty.
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
      data = request.form

      user_info: TokenPayload = request.payload #comes from the decoded JWT
      account_type = AccountType(user_info["account_type"].lower())
      email = user_info["email"]

      if account_type != AccountType.OWNER:
          return jsonify({"error": f"Invalid account type"}), 401

      # Validate required fields
      required = ["name", "birth_date", "size", "breeds"]
      missing = [k for k in required if not data.get(k)]
      if missing:
          return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

      try:
          # Parse the request data
          name = data.get("name").lower()  # New name (or current name if not renaming)
          old_name = data.get("old_name", name).lower()  # If old_name provided, use it; otherwise assume name is the identifier
          birth_date = date.fromisoformat(data.get("birth_date"))
          size = Dog.Size[data.get("size").upper()]
          image_file = request.files.get("image_file")
          breeds = data.getlist("breeds")
      except (KeyError, ValueError) as e:
          return jsonify({"error": f"Invalid data format: {str(e)}"}), 400

      # Validate and save the optional dog profile image change
      if image_file:
        if not validate_image_file(image_file):
            return jsonify({"error": "Unsupported image file type"}), 400
        image_filename = save_dog_image(app, image_file)
      else:
        image_filename = None

      try:
          # Prepare the update request in DogDTO format
          update_request: UpdateDogDTO = {
              "name": name,  # New name (or same if not renaming)
              "o_email": email,  # From token, not body
              "birth_date": birth_date,
              "size": size.name.lower(),  # Convert enum to string for DTO
              "image_filename": image_filename,
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
          if "already exists" in str(e):
              return jsonify({"error": str(e)}), 409
          return jsonify({"error": f"Dog not found: {old_name}"}), 400
      except ValueError as e:
          return jsonify({"error": f"Invalid data: {str(e)}"}), 400
      except Exception as e:
          return jsonify({"error": f"Error updating dog: {str(e)}"}), 500
