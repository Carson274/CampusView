from .menu_item import MenuItem
from ..schedule import Schedule
from ..review_section import ReviewSection
from typing import Optional
from pydantic import BaseModel

Day = str
Time = str

class Restaurant(BaseModel):
    name: str
    image: str
    building: str
    location: str
    dining_hall: str
    description: str
    cuisine: Optional[str] = None
    schedule: Optional[dict[Day, list[Time]]]
    menu: Optional[dict[Day, list[MenuItem]]]
    reviews: Optional[ReviewSection] = None