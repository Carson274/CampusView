from .menu_item import MenuItem
from pydantic import BaseModel

class Menu(BaseModel):
    items : list[MenuItem]