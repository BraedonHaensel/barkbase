# For now I'll just make this class extend DB. 
# And this class will handle everything to do with owner CRUD
from typing import List

from sqlalchemy.orm import Session
from repo.base_repo import BaseRepo
# from dto.dto import OwnerDTO
# from models.models import Owner
from models.models import ServiceProvider

# TODO: generate swagger for this
class ServiceProviderRepo(BaseRepo):
    def get_all(self) -> List[ServiceProvider]:
        return self.db.query(ServiceProvider).all()
    
    def get_by_email(self, email):
        sp = self.db.query(ServiceProvider).filter(ServiceProvider.email == email).first()

        if not sp:
            return None
        
        return sp
    
    def create(self, email, password, f_name, l_name, province, city, street, phone_num, image_filename) -> ServiceProvider:
        new_sp = ServiceProvider(
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

        self.db.add(new_sp)
        self.db.commit()
        self.db.refresh(new_sp) # Refresh to mark felds in the object as stale, so it gets refetched from DB on the next fetch (lazily)

        return new_sp
