from typing import List
from db.db import DB
from flask import request, jsonify
from datetime import date
from models.models import *
from middleware.auth_middleware import token_required
from dto.dto import TokenPayload, DogDTO, UpdateDogDTO
from models.models import Dog
from enums.enums import AccountType
from utils.images import get_dog_image_url, validate_image_file, save_dog_image

from dto.dto import EmergencyContactDto


def init_emergency_contact_routes(app, db: DB):
    @app.route("/emergency_contacts/<email>", methods=["GET"])
    def get_emergency_contacts():
        """
    Gets emergency contacts
    ---
    tags:
      - Emergency Contacts
    summary: Gets the emergency contacts by email
    description: |
      Returns the emergency contacts of the account identified
    parameters:
          - in: body
            name: body
            required: true
            schema:
              type: object
              required:
                - email
              properties:
                email:
                  type: string
                  description: "email to get contacts for"
                  example: "bob@gmail.com"

    responses:
      200:
        description: Successfully retrieved user details
        schema:
          type: array
          items:
            $ref: '#/definitions/EmergencyContactDto'
        examples:
          application/json:
            EmergencyContact_example:
              email: "john.doe@gmail.com"
              f_name: "John"
              l_name: "Doe"
              phone_num: "4039997777"
              relationship: "father"
      400:
        description: Missing/Invalid parameters
      404:
        description: User not found
    """

        data = request.get_json()
        result: List[EmergencyContactDto] = []

        required = [
            "email"
        ]
        missing = [k for k in required if k not in data]
        if missing:
            return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

        try:
            email = data["email"]
        except Exception as e:
            return jsonify({"error": f"Invalid data: {str(e)}"}), 400

        retrieved = db.getEmergencyContact(email)

        for i in retrieved:
            dto: EmergencyContactDto = {
                "email": i.email,
                "f_name": i.f_name,
                "l_name": i.l_name,
                "relationship": i.relationship,
                "phone_num": i.phone_num,
            }
            result.append(dto)
        return jsonify(result), 200


    @app.route("/emergency_contacts", methods=["POST"])
    @token_required
    def add_emergency_contact():
        """
    Adds an emergency contact
    ---
    tags:
      - Emergency Contacts
    security:
      - bearerAuth: []        # JWT Authorization
    summary: Adds an emergency contact, can overwrite existing contacts
    description: |
      Adds an emergency contact, can overwrite existing contacts
    parameters:
          - in: body
            name: body
            required: true
            schema:
              type: object
              required:
                - f_name
                - l_name
                - phone_num
                - relationship
              optional:
                - email
              properties:
                email:
                  type: string
                  description: "email of the contact"
                  example: "bob@gmail.com"
                f_name:
                  type: string
                  description: "first name of the contact"
                  example: "bob"
                l_name:
                  type: string
                  description: "last name of the contact"
                  example: "brown"
                phone_num:
                  type: string
                  description: "phone number of the contact"
                  example: "1234567890"
                relationship:
                  type: string
                  description: "relationship of the contact to the user"
                  example: "uncle"

    responses:
      201:
        description: Successfully added contact
      400:
        description: Missing/Invalid parameters or duplicate entry
      401:
        description: Invalid token
    """

        data = request.get_json()
        user_info: TokenPayload = request.payload #comes from the decoded JWT
        account_type = AccountType(user_info["account_type"].lower())
        owner_email = user_info["email"]

        if account_type != AccountType.OWNER:
            return jsonify({"error": "Invalid account type"}), 401

        required = [
            "f_name", "l_name", "phone_num", "relationship"
        ]
        missing = [k for k in required if k not in data]
        if missing:
            return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

        try:
            if "email" in data:
                email = data["email"]
            else:
                email = ""
            dto:EmergencyContactDto ={
                "email": email,
                "owner_email": owner_email,
                "f_name": data["f_name"],
                "l_name": data["f_name"],
                "phone_num": data["phone_num"],
                "relationship": data["relationship"],
            }
            db.addEmergencyContact(dto)

        except KeyError as e:
            return jsonify({"error": "duplicate emergency contact"}), 404
        except Exception as e:
            return jsonify({"error": f"Invalid data: {str(e)}"}), 400

        return jsonify({"message": "Success"}), 201





    @app.route("/emergency_contacts", methods=["DELETE"])
    @token_required
    def delete_emergency_contact():
        """
    Deletes an emergency contact
    ---
    tags:
      - Emergency Contacts
    security:
      - bearerAuth: []        # JWT Authorization
    summary: Deletes an emergency contact from the email of the token
    description: |
      Deletes an emergency contact from the email of the token
    parameters:
          - in: body
            name: body
            required: true
            schema:
              type: object
              required:
                - phone_num
              properties:
                phone_num:
                  type: string
                  description: "phone number of the contact"
                  example: "1234567890"
    responses:
      200:
        description: Successfully deleted contact
      400:
        description: Missing/Invalid parameters or duplicate entry
      401:
        description: Invalid token
      404:
        description: Non-existent contact
    """

        data = request.get_json()
        user_info: TokenPayload = request.payload #comes from the decoded JWT
        account_type = AccountType(user_info["account_type"].lower())
        o_email = user_info["email"]

        if account_type != AccountType.OWNER:
            return jsonify({"error": "Invalid account type"}), 401

        required = [
            "phone_num"
        ]
        missing = [k for k in required if k not in data]
        if missing:
            return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

        try:
            phone_num = data["phone_num"]
        except Exception as e:
            return jsonify({"error": f"Invalid data: {str(e)}"}), 400

        try:
            db.removeEmergencyContact(o_email, phone_num)
        except KeyError as e:
            return jsonify({"error": "non existent emergency contact"}), 404

        return jsonify({"message": "Success"}), 201






