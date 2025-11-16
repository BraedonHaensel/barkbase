# from . import app, db
# from .models import (
#     ServiceType, Owner, EmergencyContact, Dog, DogBreed, ServiceProvider, Review, Booking,
#     BookedDog)

from flask import request, jsonify
from models.models import *
from db.db import DB

# from datetime import date, datetime

# takes in an `app` and attaches the routes to it.
def init_routes(app, db: DB):
    @app.route("/")
    def hello_world():
        return "<p>Hello, World!</p>"

    # ########## EXAMPLE ROUTES FOR EACH TABLE ##########
    # This section is for sample routes to print each table's tuples, and can be deleted when no
    # longer useful.

    # def get_table_data(table_class):
    #     row_data = []
    #     for row in db.query(table_class).all():
    #         row_data.append(
    #             {column.name: getattr(row, column.name) for column in table_class.__table__.columns})
    #     html = ''
    #     for row in row_data:
    #         html += f"<p>{str(row)}</p>"
    #     return html if html else "No data"

    # 1) OWNER ROUTES
    # GET /api/owners?:email

    # GET /api/owners
    @app.route("/owners")
    def get_all_owners():
        return jsonify(db.getAllOwners())

    # Get owner by email
    @app.route("/owners/<email>")
    def get_owner_by_email(email):
        owner = db.getOwnerByEmail(email)

        if not owner:
            return jsonify({ "error": "Owner not found" }), 404
        
        return jsonify(owner)

    # 2) EMERGENCY CONTACT 
    # GET /api/emergency-contact
    # Gets all emergency contains of `o_email`
    @app.route("/emergency-contact")
    def get_emergency_contact():
        o_email = request.args.get("o_email")
        contacts = db.getEmergencyContact(o_email)

        if not contacts:
            return jsonify({ "error": "Contacts not found" }), 404
        
        return jsonify(contacts)

    # 4) SERVICE PROVIDER ROUTES
    @app.route("/service-providers")
    def service_provider():
        return db.getAllSvcProviders()

    # 5) REVIEWS
    @app.route("/reviews")
    def get_all_reviews():
        return db.getAllReviews()
