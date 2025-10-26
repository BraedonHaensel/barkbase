
import sqlalchemy
from sqlalchemy import text

from . import app
from . import db
from . import engine

from .models import *
from .routes import get_table_data


classMap = {"owner":Owner, "emergencycontact":EmergencyContact, "dog":Dog, "dogbreed":DogBreed,
            "serviceprovider":ServiceProvider, "review":Review, "booking":Booking, "bookeddog":BookedDog}

helpStr = '''
commands:
quit - q
print table - p table
raw sqr - r command
login - login email password
create account - create account [owner/serviceProvider] f_name l_name adress phone_num
create booking - create booking  city street start_time end_time [w/s] price note [dogs (multiple)]
find bookings - find bookings city
find my bookings - find mine
add dog - add dog name
                '''

#The CI class is a temporary interface for prototyping functions that will then
#be implemented into the GUI at a latter date
class CI:
    def __init__(self):
        self.user = None
        self.is_owner = False
        self.email = ""

    def main(self):

        print(helpStr)

        while True:
            #get command
            command = input("enter command: ")
            command = command.lower()
            settings = []

            settings = command.split(" ")

            #check if command is valid
            if len(settings) == 0 or settings[0] == "help":
                print(helpStr)
                continue
            if settings[0] == 'q':
                break
            if len(command) < 3:
                continue

            if settings[0] == 'p':
                if not settings[1] in classMap:
                    print("not a table")
                    continue
                print(get_table_data(classMap[settings[1]]))

            elif settings[0] == 'r':
                db.execute(text(command[2:]))

            elif settings[0] == 'login':
                if len(settings) < 3:
                    print("missing args")
                    continue
                self.login(settings[1], settings[2])

            elif settings[0] == 'find':
                if settings[1] == 'mine':
                    if self.user == None:
                        print("Login required!")
                        continue
                    self.find_my_bookings()
                elif settings[1] == 'bookings':
                    if self.is_owner:
                        print("owners can not satisfy bookings")
                        continue
                    if len(settings) < 3:
                        print("missing args")
                        continue
                    self.find_bookings(settings[2])
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
                    if len(settings) < 10:
                        print("missing args")
                        continue
                    self.create_booking(settings[2],settings[3],settings[4], settings[5], settings[6], settings[7], settings[8], settings[9:])

            #elif settings[0] == 'book':
            #    if self.user == None:
            #        print("Login required!")
            #        continue
            elif settings[0] == 'add':
                if settings[1] == 'dog':
                    if self.user == None:
                        print("Login required!")
                        continue
                    if len(settings) < 5:
                        print("missing args")
                        continue
                    self.add_dog(settings[2], settings[3], settings[4])

            '''elif settings[0] == 'remove':
                if settings[1] == 'dog':
                    if self.user == None:
                        print("Login required!")
                        continue
                    if len(settings) < 3:
                        print("missing args")
                        continue
                    self.remove_dog(settings[2])'''



    def login(self, email, password):

        res = db.execute(select(Owner).where(and_(Owner.email == email, Owner.password == password)))

        #automatically detects owner/service provider
        row = res.first()
        if row == None:
            res = db.execute(select(ServiceProvider).where(ServiceProvider.email == email).where(ServiceProvider.password == password))
            row = res.first()
            self.is_owner = False
        else:
            self.is_owner = True

        if row == None:
            print("Failed to login")
            return
        else:
            row = row[0]
            self.user = row
        self.email = row.email


    def create_account(self, email, password, is_owner, f_name, l_name, adress, phone_num):
        is_owner = is_owner == "owner"

        #do not allow duplicate emails
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


    def create_booking(self, city, street, start_time, end_time, mode, price, note, dogs):

        if mode == 'w':
            mode = ServiceType.WALKING
        else:
            mode = ServiceType.SITTING

        #create booking
        id = Booking.next_id
        Booking.next_id += 1
        booking = Booking(id=id, o_email=self.email, city=city, street=street, service_type=mode, start_datetime=start_time, end_datetime=end_time,
                    price=float(price), note=note)
        db.add(booking)
        db.commit()

        #create associated bookedDogs
        for i in dogs:
            booked_dog = BookedDog(booking_id=id,  o_email=self.email, d_name = i)
            db.add(booked_dog)
            db.commit()

    #cut for time
    def book(self, booking):
        pass

    def add_dog(self, name, birth_date, size):
        if size == 'l':
            size = Dog.Size.LARGE
        elif size == 's':
            size = Dog.Size.SMALL
        else:
            size = Dog.Size.MEDIUM

        dog = Dog(o_email=self.email, name=name, birth_date=birth_date, size=size)
        db.add(dog)

    #does not work due to key constraints
    def remove_dog(self, name):
        print(name)
        print(self.email)

        res = db.execute(select(Dog).where(and_(Dog.name == name, Dog.o_email == self.email)))

        row = res.first()
        if row != None:
            print("present")

        db.execute(delete(Dog).where(and_(Dog.name == name, Dog.o_email == self.email)))


    def find_bookings(self, city):
        res = db.execute(select(Booking).where(Booking.city == city))

        #extract from querry
        for i in res.all():
            row_data = []

            for row in i:
                row_data.append(
                    {column.name: getattr(row, column.name) for column in Booking.__table__.columns})
            strr = ''
            for row in row_data:
                strr += str(row) + " "
            print(strr)

    def find_my_bookings(self):

        #change based on owner/serviceProvider context
        if self.is_owner:
            res = db.execute(select(Booking).where(Booking.o_email == self.email))
        else:
            res = db.execute(select(Booking).where(Booking.sp_email == self.email))

        #extract from querry
        for i in res.all():
            row_data = []

            for row in i:
                row_data.append(
                    {column.name: getattr(row, column.name) for column in Booking.__table__.columns})
            strr = ''
            for row in row_data:
                strr += str(row) + " "
            print(strr)

