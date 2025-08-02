from pydantic import BaseModel
from .review import Review
from typing import List, Optional

class User(BaseModel):
    user_id: int
    username : str
    password : str
    email: str
    full_name : str
    review_list: Optional[List[Review]] = None