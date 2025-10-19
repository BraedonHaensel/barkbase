from flask import Flask
import sqlalchemy
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

from tables import Base, Owner

# Import environment variables from the '.env' file.
load_dotenv()

# Create the Flask app.
app = Flask(__name__)

# Define the MariaDB engine using MariaDB Connector/Python.
engine = sqlalchemy.create_engine(
    f"mariadb+mariadbconnector://dbpbf27790099:{os.getenv('MARIADB_PASS')}@"
    "serverless-eastus.sysp0000.db3.skysql.com:4114/barkbase",
    connect_args={"ssl": True}
)

# Create the SQLAlchemy session
db = sessionmaker(bind=engine)()

# Create any tables that do not already exist.
Base.metadata.create_all(engine)

# How to add tuples to the owner table:
# newOwner = Owner(name="John")
# db.add(newOwner)
# db.commit()


@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"


@app.route("/demo")
def demo():
    owners = db.query(Owner).all()
    res = "demo table contents: "
    for owner in owners:
        res += owner.name + ' '
    return f"<p>DATABASE TEST | {res}</p>"


if __name__ == "__main__":
    app.run()
