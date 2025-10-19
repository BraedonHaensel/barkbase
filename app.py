from flask import Flask
import mariadb
import os
from dotenv import load_dotenv

# Create Flask app.
app = Flask(__name__)

# Import environment variables from the '.env' file.
load_dotenv()

# Connect to the MariaDB database.
conn = mariadb.connect(
         host='serverless-eastus.sysp0000.db3.skysql.com',
         port=4114,
         user='dbpbf27790099',
         password=os.getenv('MARIADB_PASS'),
         database='barkbase',
         ssl=True)

# Cursor for database operations.
cursor = conn.cursor()


@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"


@app.route("/demo")
def demo():
    cursor.execute("INSERT into demo(Name,Num) values(%s,%s)", ("Demo", 5))
    cursor.execute("SELECT * from demo")
    answer = cursor.fetchall()
    res = "demo table contents: "
    for row in answer:
        res += row + ' '
    return f"<p>DATABASE TEST | {res}</p>"


if __name__ == "__main__":
    app.run()