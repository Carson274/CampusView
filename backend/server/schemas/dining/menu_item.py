from pydantic import BaseModel
from typing import Optional

class MenuItem(BaseModel):
    title: str
    items: Optional[list[str]] = None