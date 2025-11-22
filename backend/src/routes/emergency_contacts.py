from typing import List
from db.db import DB
from flask import request, jsonify
from models.models import *
from middleware.auth_middleware import token_required
from dto.dto import TokenPayload
from enums.enums import AccountType

from dto.dto import EmergencyContactDto


def init_emergency_contact_routes(app, db: DB):
    @app.route("/emergency_contacts/<email>", methods=["GET"])
    def get_emergency_contacts(email):
        """
        Gets emergency contacts
        ---
        tags:
          - Emergency Contacts
        summary: Gets the emergency contacts by email
        description: |
          Returns the emergency contacts of the account identified
        parameters:
          - in: path
            name: email
            required: true
            type: string
            description: Email to retrieve emergency contacts for
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

        result: List[EmergencyContactDto] = []

        retrieved = db.getEmergencyContacts(email)

        for i in retrieved:
            dto = {
                "email": i["email"],
                "owner_email": email,
                "f_name": i["f_name"],
                "l_name": i["l_name"],
                "relationship": i["relationship"],
                "phone_num": i["phone_num"],
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
        user_info: TokenPayload = request.payload  # comes from the decoded JWT
        account_type = AccountType(user_info["account_type"].lower())
        owner_email = user_info["email"]

        if account_type != AccountType.OWNER:
            return jsonify({"error": "Invalid account type"}), 401

        required = ["f_name", "l_name", "phone_num", "relationship"]
        missing = [k for k in required if k not in data]
        if missing:
            return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

        try:
            if "email" in data:
                email = data["email"]
            else:
                email = ""
            dto: EmergencyContactDto = {
                "email": email,
                "owner_email": owner_email,
                "f_name": data["f_name"],
                "l_name": data["f_name"],
                "phone_num": data["phone_num"],
                "relationship": data["relationship"],
            }
            db.addEmergencyContact(dto)

        except ValueError as e:
            return jsonify({"error": str(e)}), 400
        except KeyError as e:
            if "number already in use" in str(e):
                return jsonify({"error": str(e)}), 409
            return jsonify({"error": f"Invalid key: {str(e)}"}), 400
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
        user_info: TokenPayload = request.payload  # comes from the decoded JWT
        account_type = AccountType(user_info["account_type"].lower())
        o_email = user_info["email"]

        if account_type != AccountType.OWNER:
            return jsonify({"error": "Invalid account type"}), 401

        required = ["phone_num"]
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

    @app.route("/emergency_contacts", methods=["PUT"])
    @token_required
    def update_emergency_contact():
        """
        Updates an emergency contact
        ---
        tags:
          - Emergency Contacts
        security:
          - bearerAuth: []        # JWT Authorization
        summary: Updates an emergency contact
        description: |
          This endpoint allows an authenticated **owner** to update one of their emergency contacts.
          The emergency contact is uniquely identified by the owner's email (from JWT token) and the
          emergency contact's current phone number.
          The request body must include all fields defined in the `EmergencyContactDTO`.
          The owner's email (o_email) is automatically extracted from the JWT token for security.
          To change an emergency contact's phone number, include both the current phone number
          (old_phone_num) and the new phone number (phone_num).
        parameters:
          - in: body
            name: body
            required: true
            schema:
              type: object
              required:
                - phone_num
                - f_name
                - l_name
                - relationship
              optional:
                - old_phone_num
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
                  description: "The new phone number of the contact (or current if no change)"
                  example: "1234567890"
                relationship:
                  type: string
                  description: "relationship of the contact to the user"
                  example: "uncle"
                old_phone_num:
                  type: string
                  description: "The current phone number of the contact before the change (only required if renaming)"
                  example: "4441119999"
        responses:
          200:
            description: Contact successfully updated
            schema:
              type: object
              properties:
                message:
                  type: string
                  example: "Emergency contact successfully updated"
                emergency_contact:
                  type: object
                  properties:
                    phone_num:
                      type: string
                      example: "1234567890"
                    email:
                      type: string
                      example: "bob@gmail.com"
                    f_name:
                      type: string
                      example: "bob"
                    l_name:
                      type: string
                      example: "brown"
                    relationship:
                      type: string
                      example: "uncle"
          400:
            description: Invalid data format, missing fields, or emergency contact not found
          401:
            description: Invalid credentials or not an owner
        """

        data = request.get_json()
        user_info: TokenPayload = request.payload  # comes from the decoded JWT
        account_type = AccountType(user_info["account_type"].lower())
        owner_email = user_info["email"]

        if account_type != AccountType.OWNER:
            return jsonify({"error": "Invalid account type"}), 401

        # Validate required fields
        required = ["phone_num", "f_name", "l_name", "relationship"]
        missing = [k for k in required if k not in data]
        if missing:
            return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

        try:
            # Parse the request data
            phone_num = data["phone_num"]
            # Get the old phone number, or use the current phone number if it is not being changed
            old_phone_num = data.get("old_phone_num", phone_num)
            f_name = data["f_name"]
            l_name = data["l_name"]
            relationship = data["relationship"]
            email = data["email"] if data["email"] else ""
        except (KeyError, ValueError) as e:
            return jsonify({"error": f"Invalid data format: {str(e)}"}), 400

        try:
            # Prepare the update request in DTO format
            dto: EmergencyContactDto = {
                "email": email,
                "owner_email": owner_email,
                "f_name": f_name,
                "l_name": l_name,
                "phone_num": phone_num,
                "relationship": relationship,
            }

            # Update the emergency contact
            db.updateEmergencyContact(old_phone_num, dto)

            # Get the updated contact to return
            updated_contact = db.getEmergencyContact(owner_email, phone_num)
            if updated_contact is None:
                return jsonify({"error": f"Failed to retrieve updated contact"}), 500

            # Convert to DTO for response
            contact_dto = {
                "email": updated_contact.email,
                "owner_email": updated_contact.o_email,
                "f_name": updated_contact.f_name,
                "l_name": updated_contact.l_name,
                "relationship": updated_contact.relationship,
                "phone_num": updated_contact.phone_num,
            }

            return jsonify({
                "message": "Emergency contact successfully updated",
                "emergency_contact": contact_dto
            }), 200

        except KeyError as e:
            if "already exists" in str(e):
                return jsonify({"error": str(e)}), 409
            return jsonify({"error": f"Emergency contact not found with old phone number: {old_phone_num}"}), 400
        except ValueError as e:
            return jsonify({"error": f"Invalid data: {str(e)}"}), 400
        except Exception as e:
            return jsonify({"error": f"Error updating emergency contacct: {str(e)}"}), 500
