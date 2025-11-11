from routes.routes import init_routes
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
                    "address": {"type": "string", "example": "55 Sunshine Pl NE"},
                    "phone_num": {"type": "string", "example": "4039997777"}
                }
            },
            "ServiceProviderDTO": {
                "type": "object",
                "properties": {
                    "email": {"type": "string", "example": "alice.swift@gmail.com"},
                    "f_name": {"type": "string", "example": "Alice"},
                    "l_name": {"type": "string", "example": "Swift"},
                    "address": {"type": "string", "example": "22 Nose Hill Way NW"},
                    "phone_num": {"type": "string", "example": "4038881234"}
                }
            }
        }
    }

    # swagger docs
    swagger = Swagger(app, template=swagger_template)
    
    # initialize routes
    init_routes(app, db)
    init_auth_routes(app, owner_repo=owner_repo, sp_repo=sp_repo)
    init_user_routes(app, owner_repo=owner_repo, sp_repo=sp_repo)
    init_booking_routes(app, db)
    init_dog_routes(app, db)

    app.run(port=os.getenv('API_PORT'), debug=True)
