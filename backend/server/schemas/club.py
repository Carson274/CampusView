from pydantic import BaseModel
from .schedule import Schedule
from .review_section import ReviewSection
from typing import Optional

class Club(BaseModel):
    name: str
    image: str
    admins: list[int]           # corresponds to user_id, they will have access for edits
    schedule: Schedule
    location: str
    link: str
    description: str
    reviews: Optional[ReviewSection] = None
    college: str