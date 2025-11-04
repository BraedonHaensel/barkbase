from routes.routes import init_routes
from routes.auth import init_auth_routes
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

    # swagger docs
    swagger = Swagger(app, template={
        "info": {
            "title": "BarkBase API",
            "description": "REST API for Owners and Service Providers",
            "version": "1.0.0"
        }
    })
    
    # initialize routes
    init_routes(app, db)
    init_auth_routes(app, owner_repo=owner_repo, sp_repo=sp_repo)
    app.run(port=os.getenv('API_PORT'), debug=True)

    # d = CI()
    # d.main()
    #app.run(debug=True)
