from pymongo import MongoClient
from pymongo.collection import Collection
import shelve
from shelve import Shelf
import json
from datetime import datetime
from pydantic import BaseModel
from typing import Optional, List
from fastapi import HTTPException
from dotenv import dotenv_values

config = dotenv_values(".env")
client = MongoClient(config['MONGODB_CONNECTSTR'])

# Import the schema classes - could import them from server
class MenuItem(BaseModel):
    title: str
    items: Optional[List[str]] = None

class Schedule(BaseModel):
    hours: List[str]

class Restaurant(BaseModel):
    name: str
    image: str
    building: str
    location: str
    dining_hall: str
    description: str
    schedule: Optional[dict[str, Schedule]] = None
    menu: Optional[List[MenuItem]] = None

def insert_new_item(collection: Collection, map: Shelf, name: str, item: BaseModel):
    if name in map:
        raise HTTPException(status_code=409, detail="Item already exists")

    new_id = collection.insert_one(item.model_dump()).inserted_id
    map[name] = new_id
    map.sync()
    
    return {"message": "Success"}

def transform_menu_data(menu_data):
    """Transform the menu data into the required format."""
    if not menu_data:
        return None
    
    return [MenuItem(
        title=section.get("title", ""),
        items=section.get("ingredients", [])
    ) for section in menu_data]

def transform_hours(times_data):
    """Transform the hours data into a schedule format."""
    if not times_data:
        return None
    
    schedule = {}
    for date, hours in times_data.items():
        schedule[date] = Schedule(
            hours=hours if hours != ["Closed"] else []
        )
    
    return schedule

def load_restaurants(data_file, restaurant_collection, restaurant_map):
    """Load restaurants directly into MongoDB using insert_new_item."""
    # Read the JSON file
    with open(data_file, 'r') as f:
        restaurants = json.load(f)
    
    success_count = 0
    failure_count = 0
    
    for restaurant in restaurants:
        try:
            # Transform the data - the trickiest part IMO
            transformed_data = Restaurant(
                name=restaurant["name"],
                image=restaurant["img_url"],
                building=restaurant["dining_hall"],
                location=restaurant["address"],
                dining_hall=restaurant["dining_hall"],
                description=restaurant["description"],
                schedule=transform_hours(restaurant.get("times")),
                menu=transform_menu_data(restaurant.get("menu", {}).get(datetime.now().strftime("%B %d")))
            )

            print(f"Transformed data: {json.dumps(transformed_data.dict(), indent=2)}")
            
            try:
                insert_new_item(restaurant_collection, restaurant_map, restaurant["name"], transformed_data)
                print(f"Successfully loaded {restaurant['name']}")
                success_count += 1
            except HTTPException as http_error:
                print(f"HTTP error loading {restaurant['name']}: {http_error.detail}")
                failure_count += 1
                
        except Exception as e:
            print(f"Error processing {restaurant['name']}: {str(e)}")
            failure_count += 1
    
    return success_count, failure_count

if __name__ == "__main__":
    # MongoDB connection
    db = client.campusview
    restaurants_collection = db.restaurants
    restaurant_map = shelve.open("rest")

    DATA_FILE = "restaurants.json"
    
    print("Starting restaurant data load...")
    success, failure = load_restaurants(DATA_FILE, restaurants_collection, restaurant_map)
    print(f"\nLoad complete!")
    print(f"Successfully loaded: {success} restaurants")
    print(f"Failed to load: {failure} restaurants")

    restaurant_map.close()