from sqlalchemy.orm import Session

# Abstract class 
class BaseRepo():
    def __init__(self, session: Session):
        self.db = session