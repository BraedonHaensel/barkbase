# For now I'll just make this class extend DB. 
# And this class will handle everything to do with owner CRUD
from typing import Optional, List
from sqlalchemy.orm import Session
from repo.base_repo import BaseRepo
# from dto.dto import OwnerDTO
from models.models import Owner

# TODO: generate swagger for this
# Repos return the full shape as per the model
class OwnerRepo(BaseRepo):
    def get_all(self) -> List[Owner]:
        owners = self.db.query(Owner).all()  # fetch all rows from owner table

        return owners
    
    def get_by_email(self, email) -> Optional[Owner]:
        owner = self.db.query(Owner).filter(Owner.email == email).first()

        if not owner:
            return None
        
        return owner
    
    def create(self, email, password, f_name, l_name, province, city, street, phone_num, image_filename) -> Owner:
        # 1) Create an ORM instance
        new_owner = Owner(
            email=email,
            password=password,
            f_name=f_name,
            l_name=l_name,
            province=province,
            city=city,
            street=street,
            phone_num=phone_num,
            image_filename=image_filename,
        )

        # 2) Add to the session
        self.db.add(new_owner)

        # 3) Commit
        self.db.commit()

        # 4) Refresh to mark fields as stale. Then when re-requeted, lazy loading occurs where the stale fields are fetched from DB.
        self.db.refresh(new_owner)

        return new_owner 
