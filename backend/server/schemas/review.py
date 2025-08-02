from pydantic import BaseModel, Field
from typing import Optional, Literal

class Review(BaseModel):
    review_id : int
    type : Literal["restaurant", "studyspot", "club", "review"]
    owner : str = Field(description="The owner of the review is the name of a restaurant, studyspot, or club")
    user : str
    rating : float
    time : str
    message : Optional[str] = None