# import barkbase
# from barkbase.ci import CI
from routes.routes import init_routes
# from dotenv import load_dotenv
from flask import Flask
from db.db import DB

# TODO: write skeleton to expose all routes; return mock data for each.
# test using Postman; show during demo

# Creates and returns a new Flask instance
def create_app(db):
    app = Flask(__name__)
    init_routes(app, db)
    return app

if __name__ == '__main__':
    # TODO: populate DB
    # load_dotenv()
    db = DB()
    db.resetAllTables()
    db.populateDb()

    app = create_app(db)
    app.run(debug=True)

    # d = CI()
    # d.main()
    #app.run(debug=True)

