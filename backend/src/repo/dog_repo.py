from sqlalchemy import and_
from repo.base_repo import BaseRepo
from models.models import Dog, DogBreed
from dto.dto import DogDTO
from utils.images import get_dog_image_url


class DogRepo(BaseRepo):
    def _to_dto(self, dog: Dog) -> DogDTO:
        # Get breeds
        """
        Converts a Dog ORM object to a DogDTO with all breeds included.
        """
        # Query DogBreed to get all breeds linked to this dog
        breeds = (
            self.db.query(DogBreed.breed)
            .filter(and_(DogBreed.d_name == dog.name, DogBreed.o_email == dog.o_email))
            .all()
        )

        # SQLAlchemy returns a list of tuples (e.g. [('Beagle',), ('Poodle',)])
        breed_list = [b[0].title() for b in breeds]

        return {
            "name": dog.name.title(),  # cnert to upp
            "o_email": dog.o_email,
            "birth_date": dog.birth_date,
            "size": dog.size.name.lower(),  # Enum → lowercase string
            "image_url": get_dog_image_url(dog.image_filename),
            "breeds": breed_list,
        }
