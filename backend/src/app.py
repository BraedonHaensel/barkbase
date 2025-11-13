from routes.auth import init_auth_routes
from routes.user import init_user_routes
from routes.booking import init_booking_routes
from routes.dogs import init_dog_routes
from flask import Flask
from db.db import DB
from repo.owner_repo import OwnerRepo
from repo.sp_repo import ServiceProviderRepo
from flasgger import Swagger
from flask_cors import CORS
import os

if __name__ == '__main__':
    # TODO: populate DB
    # load_dotenv()
    db = DB()
    db.resetAllTables()
    db.populateDb()

    session = db.get_session()

    # repos
    owner_repo = OwnerRepo(session)
    sp_repo = ServiceProviderRepo(session)

    # initialize app
    app = Flask(__name__)
    # allow CORS for front-end access to the api
    CORS(app)

    # configure the path to the images folder
    app.config['IMAGES_DIR'] = os.path.join('static', 'images')

    swagger_template = {
        "swagger": "2.0",
        "info": {
            "title": "BarkBase API",
            "description": "API documentation for BarkBase backend",
            "version": "1.0.0"
        },
        "tags": [
            {
                "name": "Authentication",
                "description": "User authentication endpoints"
            },
            {
                "name": "Users",
                "description": "User management endpoints"
            },
            {
                "name": "Dogs",
                "description": "Dog management endpoints"
            },
            {
                "name": "Bookings",
                "description": "Booking management endpoints"
            }
        ],
        "securityDefinitions": {
            "bearerAuth": {
                "type": "apiKey",
                "name": "Authorization",
                "in": "header",
                "description": "JWT Bearer token. Example: **Bearer &lt;token&gt;**"
            }
        },
        # models for Flasgger to render
        "definitions": {
            "OwnerDTO": {
                "type": "object",
                "properties": {
                    "email": {"type": "string", "example": "john.doe@gmail.com"},
                    "f_name": {"type": "string", "example": "John"},
                    "l_name": {"type": "string", "example": "Doe"},
                    "province": {"type": "string", "example": "AB"},
                    "city": {"type": "string", "example": "Calgary"},
                    "street": {"type": "string", "example": "55 Sunshine Pl NE"},
                    "phone_num": {"type": "string", "example": "4039997777"},
                    "image_url": {"type": "string", "example": "https://example.com/images/john.png"}
                }
            },
            "ServiceProviderDTO": {
                "type": "object",
                "properties": {
                    "email": {"type": "string", "example": "alice.swift@gmail.com"},
                    "f_name": {"type": "string", "example": "Alice"},
                    "l_name": {"type": "string", "example": "Swift"},
                    "province": {"type": "string", "example": "AB"},
                    "city": {"type": "string", "example": "Calgary"},
                    "street": {"type": "string", "example": "22 Nose Hill Way NW"},
                    "phone_num": {"type": "string", "example": "4038881234"},
                    "image_url": {"type": "string", "example": "https://example.com/images/alice.png"}
                }
            },
            "EmergencyContactDto": {
                "type": "object",
                "properties": {
                    "phone_num": {"type": "string", "example": "4031234321"},
                    "owner_email": {"type": "string", "example": "bob@gmail.com"},
                    "relationship": {"type": "string", "example": "Friend"},
                    "email": {"type": "string", "example": "susan@gmail.com"},
                    "f_name": {"type": "string", "example": "Susan"},
                    "l_name": {"type": "string", "example": "Smith"}
                }
            },
            "DogDTO": {
                "type": "object",
                "properties": {
                    "name": {"type": "string", "example": "Storm"},
                    "o_email": {"type": "string", "example": "bob@gmail.com"},
                    "birth_date": {"type": "string", "format": "date", "example": "2010-01-20"},
                    "size": {
                        "type": "string",
                        "enum": ["small", "medium", "large"],
                        "example": "small"
                    },
                    "image_url": {"type": "string", "example": "https://example.com/images/john.png"},
                    "breeds": {
                        "type": "array",
                        "items": {"type": "string"},
                        "example": ["Beagle", "Poodle"]
                    }
                }
            },
            "CreateDogDTO": {
                "type": "object",
                "required": ["name", "o_email", "birth_date", "size"],
                "properties": {
                    "name": {"type": "string", "example": "Storm"},
                    "o_email": {"type": "string", "example": "bob@gmail.com"},
                    "birth_date": {"type": "string", "format": "date", "example": "2010-01-20"},
                    "size": {
                        "type": "string",
                        "enum": ["small", "medium", "large"],
                        "example": "small"
                    },
                    "image_filename": {"type": "string", "example": "image.jpg"},
                    "breeds": {
                        "type": "array",
                        "items": {"type": "string"},
                        "example": ["Golden Retriever", "Labrador"]
                    }
                }
            },
            "UpdateDogDTO": {
                "type": "object",
                "required": ["name", "o_email", "birth_date", "size", "breeds"],
                "properties": {
                    "name": {"type": "string", "example": "Stormy"},
                    "o_email": {"type": "string", "example": "bob@gmail.com"},
                    "birth_date": {"type": "string", "format": "date", "example": "2010-01-20"},
                    "size": {
                        "type": "string",
                        "enum": ["small", "medium", "large"],
                        "example": "medium"
                    },
                    "image_filename": {"type": "string", "example": "image.jpg"},
                    "breeds": {
                        "type": "array",
                        "items": {"type": "string"},
                        "example": ["Golden Retriever", "Labrador"]
                    }
                }
            },
            "BookingCreateDto": {
                "type": "object",
                "required": ["o_email", "sp_email", "start_datetime", "end_datetime", "service_type", "price", "dog_names"],
                "properties": {
                    "o_email": {"type": "string", "example": "bob@gmail.com"},
                    "sp_email": {"type": "string", "example": "alice@gmail.com"},
                    "start_datetime": {
                        "type": "string",
                        "format": "date-time",
                        "example": "2025-10-30T14:30:00"
                    },
                    "end_datetime": {
                        "type": "string",
                        "format": "date-time",
                        "example": "2025-10-30T16:30:00"
                    },
                    "service_type": {
                        "type": "string",
                        "enum": ["WALKING", "SITTING"],
                        "example": "WALKING"
                    },
                    "price": {"type": "number", "format": "float", "example": 60.0},
                    "dog_names": {
                        "type": "array",
                        "items": {"type": "string"},
                        "example": ["Chico", "Amigo"]
                    }
                }
            }
        }
    }

    # swagger docs
    swagger = Swagger(app, template=swagger_template, config={
    "headers": [],
    "specs": [
        {
            "endpoint": 'spec',
            "route": '/apidocs/spec.json',   # this exposes the JSON spec
            "rule_filter": lambda rule: True,  # include all endpoints
            "model_filter": lambda tag: True,  # include all models
        }
    ],
    "static_url_path": "/flasgger_static",
    "swagger_ui": True,
    "specs_route": "/apidocs/"
    })
    
    # initialize routes
    init_auth_routes(app, owner_repo=owner_repo, sp_repo=sp_repo)
    init_user_routes(app, owner_repo=owner_repo, sp_repo=sp_repo)
    init_booking_routes(app, db)
    init_dog_routes(app, db)

    app.run(port=os.getenv('API_PORT'), debug=True)
