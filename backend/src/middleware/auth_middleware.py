from functools import wraps
from flask import request, jsonify
import jwt
import os
from dto.dto import TokenPayload
from models.models import Role

SECRET_KEY = os.getenv("JWT_SECRET_KEY")  # load from .env

# create token_required decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization")

        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"error": "Authorization header missing or invalid"}), 401
        
        token = auth_header.split(" ")[1]

        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            payload: TokenPayload = {
                "email": data["email"],
                "role": data["role"],
            }

        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401

        # Attach decoded user info (so routes can access it) to the request
        request.payload = payload
        return f(*args, **kwargs)
    return decorated
