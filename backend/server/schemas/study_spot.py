from pydantic import BaseModel
from .schedule import Schedule
from .review_section import ReviewSection
from typing import Optional

class StudySpot(BaseModel):
    building: str
    location: str
    description: str
    schedule: Schedule
    reviews: Optional[ReviewSection] = None