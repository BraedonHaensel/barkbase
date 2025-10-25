
import sqlalchemy
from sqlalchemy import text

from . import app
from . import db
from . import engine

from .models import *
from .routes import get_table_data


classMap = {"owner":Owner, "emergencycontact":EmergencyContact, "dog":Dog, "dogbreed":DogBreed,
            "serviceprovider":ServiceProvider, "review":Review, "booking":Booking, "bookeddog":BookedDog}


#The CI class is a temporary interface for prototyping functions that will then
#be implemented into the GUI at a latter date
class CI:
    def __init__(self):
        self.user = None
        self.is_owner = False

    def main(self):

        while True:
            command = input("enter command: ")
            command = command.lower()
            settings = []


            settings = command.split(" ")

            if len(settings) == 0:
                continue
            if settings[0] == 'q':
                break
            if len(command) < 3:
                continue

            if settings[0] == 'p':
                print(get_table_data(classMap[settings[1]]))

            elif settings[0] == 'r':
                db.execute(text(command[2:]))

            elif settings[0] == 'login':
                if len(settings) < 3:
                    print("missing args")
                    continue
                self.login(settings[1], settings[2])

            elif settings[0] == 'find':
                if settings[1] == 'my':
                    if self.user == None:
                        print("Login required!")
                        continue
                    pass
                elif settings[1] == 'bookings':
                    if self.is_owner:
                        print("owners can not satisfy bookings")
                        continue
                    pass
                pass
            elif settings[0] == 'create':
                if settings[1] == 'account':
                    if len(settings) < 9:
                        print("missing args")
                        continue
                    self.create_account(settings[2], settings[3], settings[4], settings[5], settings[6], settings[7], settings[8])

                elif settings[1] == 'booking':
                    if self.user == None:
                        print("Login required!")
                        continue
                    if not self.is_owner:
                        print("Providers can not create bookings")
                        continue
                    pass
                pass
            elif settings[0] == 'update':
                if self.user == None:
                    print("Login required!")
                    continue

            elif settings[0] == 'book':
                if self.user == None:
                    print("Login required!")
                    continue
                pass
            elif settings[0] == 'add':
                if self.user == None:
                    print("Login required!")
                    continue
                pass
            elif settings[0] == 'remove':
                if self.user == None:
                    print("Login required!")
                    continue
                pass



    def login(self, email, password):

        res = db.execute(select(Owner).where(and_(Owner.email == email, Owner.password == password)))
        #print(res.all())
        row = res.first()
        if row == None:
            res = db.execute(select(ServiceProvider).where(ServiceProvider.email == email).where(ServiceProvider.password == password))
            row = res.first()
            self.is_owner = False
        else:
            self.is_owner = True

        if row == None:
            print("Failed to login")
        else:
            self.user = row

    def create_account(self, email, password, is_owner, f_name, l_name, adress, phone_num):
        is_owner = is_owner == "owner"

        #do not duplicate emails
        res = db.execute(select(Owner).where(Owner.email == email))
        if not (res.first() == None):
            print("email already in use")
            return

        res = db.execute(select(ServiceProvider).where(ServiceProvider.email == email))
        if not (res.first() == None):
            print("email already in use")
            return

        #add to appropriate table
        if is_owner:
            owner = Owner(email=email, password=password, f_name=f_name, l_name=l_name,
                    address=adress, phone_num=phone_num)
            db.add(owner)
        else:
            sp = ServiceProvider(email=email, password=password, f_name=f_name, l_name=l_name,
                    address=adress, phone_num=phone_num)
            db.add(sp)

        self.login(email, password)

    def create_booking(self, location, start_time, end_time, price, dogs):
        pass

    def book(self, booking):
        pass

    def add_dog(self, name):
        pass

    def remove_dog(self, name):
        pass

    def find_bookings(self, city):
        pass

    def find_my_bookings(self):
        pass

