from pydantic import BaseModel
from typing import List

class HoursSchedule(BaseModel):
    open: str
    close: str

class DaySchedule(BaseModel):
    day: str
    hours: List[HoursSchedule]

class Schedule(BaseModel):
    days: List[DaySchedule]