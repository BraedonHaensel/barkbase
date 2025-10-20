from dotenv import load_dotenv
from flask import Flask
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Import environment variables from the '.env' file.
load_dotenv()

# Create the Flask app.
app = Flask(__name__)

# Define the MariaDB engine using MariaDB Connector/Python.
engine = create_engine(os.getenv('DATABASE_URI'))

# Create the SQLAlchemy session.
db = sessionmaker(bind=engine)()

# Initialize the routes.
from . import routes as _
