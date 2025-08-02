from .review import Review
from pydantic import BaseModel

class ReviewSection(BaseModel):
    score : float               # average of all scores in reviews
    reviews : list[Review]
    hidden : bool               # might be good option