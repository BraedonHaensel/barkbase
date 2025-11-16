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
        Gets the emergency contacts by email
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
          400:
            description: Missing/Invalid parameters
          404:
            description: User not found
        """

        data = request.get_json()
        result: List[EmergencyContactDto] = []

        required = ["email"]
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
