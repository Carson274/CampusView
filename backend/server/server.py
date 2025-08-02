# FastAPI imports
from fastapi import FastAPI, Request, HTTPException, status
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from diningWeeklyScraper import DiningScraper

# For MongoDB database access
from pymongo import MongoClient
from pymongo.collection import Collection
from dotenv import dotenv_values

# For handling json formatting and processing
import json
from bson import json_util

# Used for persistant map store
import shelve
from shelve import Shelf
from contextlib import asynccontextmanager

# Schema imports
from pydantic import BaseModel
from typing import Optional
from schemas.dining.restaurant import Restaurant
from schemas.club import Club
from schemas.study_spot import StudySpot
from schemas.review_section import ReviewSection, Review
from schemas.user import User

# Authentication imports
import jwt
from jwt.exceptions import InvalidTokenError, PyJWTError
from typing import Annotated
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from passlib.context import CryptContext    # for password hashing
from datetime import datetime, timedelta, timezone

config = dotenv_values(".env")
client = MongoClient(config['MONGODB_CONNECTSTR'])
templates = Jinja2Templates("./templates")

# Database and collections
db = client.campusview
restaurants = db.restaurants
clubs = db.clubs
studyspots = db.studyspots
reviews = db.reviews
users = db.users    #DB for user login

# Persistant store of mapping between endpoint name and document obj_id in MongoDB
rest_map = shelve.open("rest")
club_map = shelve.open("club")
study_map = shelve.open("study")
review_map = shelve.open("review")

# Maps type of collection to the collection and shelf map
type_map = {
    "restaurant" : (restaurants, rest_map, Restaurant),
    "club" : (clubs, club_map, Club),
    "studyspot" : (studyspots, study_map, StudySpot),
    "review" : (reviews, review_map, Review)
}

# syncs shelves with database just to ensure that there are no mappings that shouldn't exist
def sync_shelves():
    print("syncing shelves with database")
    for collection, map, target in [(restaurants, rest_map, "name"), (clubs, club_map, "name"), (studyspots, study_map, "name"), (reviews, review_map, "review_id")]:
        cursor = collection.find({})
        for document in cursor:
            obj_id = document['_id']
            name = str(document[target])
            if name not in map:
                map[name] = obj_id

        for name in list(map.keys()):
            if not collection.find_one({"_id": map[name]}):
                del map[name]

        map.sync()

@asynccontextmanager
async def lifespan(app: FastAPI):
    sync_shelves()
    yield
    sync_shelves()

# Instantitate app with "lifespan" that runs on startup and shutdown
app = FastAPI(separate_input_output_schemas=False, lifespan=lifespan)

# Add CORS header
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic classes for FastAPI
class Token(BaseModel):
    access_token : str
    token_type : str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserInDB(User):
    hashed_password: str

class FilterParams(BaseModel):
    name : str
    token : Token

# Auth declarations
SECRET_KEY = config['SECRET_KEY']
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")
pwd_context = CryptContext(schemes=['bcrypt'], deprecated="auto")

# All database related functions
def fetch_all(collection: Collection) -> list[dict]:
    items = []
    cursor = json.loads(json_util.dumps(collection.find({})))
    for document in cursor:
        document.pop('_id', None)
        items.append(document)
    return items

def fetch_one(collection: Collection, map: Shelf, name: str) -> dict:
    try:
        obj_id = map[name]
    except KeyError:
        raise HTTPException(status_code=404, detail="Resource Not Found")
    except Exception:
        raise HTTPException(status_code=500, detail="Server Error")
    
    res = json.loads(json_util.dumps(collection.find_one({"_id": obj_id})))
    if res is None:
        raise HTTPException(status_code=404, detail="Resource Not Found")
    
    res.pop('_id', None)
    return res

def insert_new_item(collection: Collection, map: Shelf, name: str, item: BaseModel):
    if name in map:
        raise HTTPException(status_code=409, detail="Item already exists")

    new_id = collection.insert_one(item.model_dump()).inserted_id
    map[name] = new_id
    map.sync()
    
    return {"message": "Success"}

def update_item(collection: Collection, map: Shelf, name: str, item: BaseModel):
    try:
        obj_id = map[name]
    except KeyError:
        insert_new_item(collection, map, name, item)
        return {"message": "Success"}
    except Exception:
        raise HTTPException(status_code=500, detail="Server Error")
    
    try:
        collection.update_one({"_id": obj_id}, {"$set": item.model_dump()})
    except Exception:
        raise HTTPException(status_code=500, detail="Server Error")
    
    return {"message": "Success"}

def delete_item(collection: Collection, map: Shelf, name: str):
    try:
        obj_id = map[name]
    except KeyError:
        raise HTTPException(status_code=404, detail="Resource Not Found")
    except Exception:
        raise HTTPException(status_code=500, detail="Server Error")
    
    try:
        collection.delete_one({"_id": obj_id})
        del map[name]
        map.sync()
    except Exception:
        raise HTTPException(status_code=500, detail="Server Error")
    
    return {"message": "Success"}

def transform_menu_data(menu_data):
    pass

def transform_hours(times_data):
    pass

# Login stuff

# Hash password
def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

# Verify password against the hash password
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def _register(user: User):
    # Check if the username or email is already in use
    if users.find_one({"username": user.username}) or users.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Username or email already exists")
    
    # Hash the password
    hashed_password = get_password_hash(user.password)
    user_dict = user.model_dump()
    user_dict["password"] = hashed_password

    # Store user in database
    users.insert_one(user_dict)

# Endpoint for Post request for registering or signing in
@app.post("/register")
async def register(user: User):
    _register(user)
    return {"message": "User registered successfully"}


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# Login endpoint to validate cridentials and issue JWT
@app.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # Find the user by username
    user = users.find_one({"username": form_data.username})
    if not user and not verify_password(form_data.password, user["password"]):
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create a JWT token
    access_token = create_access_token(data={"sub": user["username"]})
    return {"access_token": access_token, "token_type": "bearer"}

def decode_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except PyJWTError:
        return None

async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    payload = decode_token(token)
    if not payload:
        raise HTTPException(
            status_code=401,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = users.find_one({"username": payload["sub"]})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return User(**user)

# This code defines a protected API endpoint (/protected) that requires authentication. 
# It uses the get_current_user function to verify the user's token and retrieve their information. 
# If the token is valid, it returns a greeting message with the user's username.
# Requires a valid user to be authenticated: returns greeting with their username
@app.get("/protected")
async def protected_route(current_user: User = Depends(get_current_user)):
    return {"message": f"Hello, {current_user.username}!"}

# Protected user endpoint that returns the current user
# Neededs token in authorization header
@app.get("/user")
async def get_user(current_user: User = Depends(get_current_user)):
    return {"username": current_user.username, "email": current_user.email, "name": current_user.full_name, "user_id": current_user.user_id, "review_list": current_user.review_list}

@app.put("/user")
async def update_user_profile(user: User, current_user: User = Depends(get_current_user)):
    user.password = current_user.password
    obj_id = users.find_one({"username": current_user.username})["_id"]
    try:
        users.update_one({"_id": obj_id}, {"$set": user.model_dump()})
    except:
        return HTTPException(500, "Error updating user.")
    return HTMLResponse("User updated.")

# change schedule and menu
@app.get("/refreshDining")
async def update_restaurants():
    try:
        scraper = DiningScraper()
        rest_list = scraper.scrape()
        for restaurant in rest_list:
            try:
                transformed_data = Restaurant(
                    name = restaurant['name'],
                    image = restaurant['img_url'],
                    building = restaurant['dining_hall'],
                    location = restaurant['address'],
                    dining_hall = restaurant['dining_hall'],
                    description = restaurant['description'],
                    schedule = restaurant['schedule'],
                    menu = restaurant['menu']
                )
                
                try:
                    if restaurant.find_one({"name": restaurant['name']}):
                        await delete_restaurant()
                    await insert_new_restaurant(restaurant['name'], transformed_data)
                    print(f'Successfully inserted {restaurant["name"]}')
                except HTTPException as http_error:
                    print(f'HTTP Error loading {restaurant["name"]}: {http_error.detail}')
                    return JSONResponse(content={"message": "Error loading data"}, status_code=500)

            except Exception as e:
                print(f"Error transforming data: {e}")
                continue
    except Exception as e:
        print(f"Error in cron: {e}")
        return JSONResponse(content={"message": "Error in cron"}, status_code=500)
    return JSONResponse(content={"message": "Success"}, status_code=200)
    
@app.get("/", response_class=HTMLResponse)
def index(request: Request):
    return templates.TemplateResponse(
        request=request, name="index.html"
    )

@app.get("/restaurant/")
async def fetch_restaurants() -> list[Restaurant]:
    return JSONResponse(content=fetch_all(restaurants))

@app.post("/restaurant/{restaurant_name}")
async def insert_new_restaurant(restaurant_name: str, restaurant: Restaurant):
    return insert_new_item(restaurants, rest_map, restaurant_name, restaurant)

@app.get("/restaurant/{restaurant_name}")
async def fetch_restaurant(restaurant_name: str) -> Restaurant:
    return JSONResponse(content=fetch_one(restaurants, rest_map, restaurant_name))

@app.put("/restaurant/{restaurant_name}")
async def update_restaurant(restaurant_name: str, restaurant: Restaurant):
    return update_item(restaurants, rest_map, restaurant_name, restaurant)

@app.delete("/restaurant/{restaurant_name}")
async def delete_restaurant(restaurant_name: str):
    return delete_item(restaurants, rest_map, restaurant_name)

@app.get("/club/")
async def fetch_clubs() -> list[Club]:
    return JSONResponse(content=fetch_all(clubs))

@app.post("/club/{club_name}")
async def insert_new_club(club_name: str, club: Club):
    return insert_new_item(clubs, club_map, club_name, club)

@app.get("/club/{club_name}")
async def fetch_club(club_name: str) -> Club:
    return JSONResponse(content=fetch_one(clubs, club_map, club_name))

@app.put("/club/{club_name}")
async def update_club(club_name: str, club: Club):
    return update_item(clubs, club_map, club_name, club)

@app.delete("/club/{club_name}")
async def delete_club(club_name: str):
    return delete_item(clubs, club_map, club_name)

@app.get("/studyspot/")
async def fetch_study_spots() -> list[StudySpot]:
    return JSONResponse(content=fetch_all(studyspots))

@app.post("/studyspot/{spot_name}")
async def insert_new_study_spot(spot_name: str, spot: StudySpot):
    return insert_new_item(studyspots, study_map, spot_name, spot)

@app.get("/studyspot/{spot_name}")
async def fetch_study_spot(spot_name: str) -> StudySpot:
    return JSONResponse(content=fetch_one(studyspots, study_map, spot_name))

@app.put("/studyspot/{spot_name}")
async def update_study_spot(spot_name: str, spot: StudySpot):
    return update_item(studyspots, study_map, spot_name, spot)

@app.delete("/studyspot/{spot_name}")
async def delete_study_spot(spot_name: str):
    return delete_item(studyspots, study_map, spot_name)

@app.get("/review/")
async def fetch_reviews() -> list[Review]:
    return JSONResponse(content=fetch_all(reviews))

@app.post("/review/{review_id}")
async def insert_new_review(review_id: str, review: Review):
    
    item_collection, item_shelf, item_type = type_map[review.type]

    # Get item related to review and update review section
    fetched = fetch_one(item_collection, item_shelf, review.owner)
    item = item_type(**fetched)

    # If no review section, add
    if (item.reviews is None):
        item.reviews = ReviewSection(score=review.rating, reviews=[review], hidden=False)
    else:
        num_review = item.reviews.reviews.__len__()
        item.reviews.reviews.append(review)
        # Calculate new average score
        item.reviews.score = ((item.reviews.score * num_review) + review.rating) / (num_review + 1)

    # Update item with review added from object
    update_item(item_collection, item_shelf, review.owner, item)

    # Then insert review
    return insert_new_item(reviews, review_map, review_id, review)

@app.get("/review/{review_id}")
async def fetch_review(review_id: str) -> StudySpot:
    return JSONResponse(content=fetch_one(reviews, review_map, review_id))

@app.delete("/review/{review_id}")
async def delete_review(review_id: str, current_user: User = Depends(get_current_user)):

    fetched = fetch_one(reviews, review_map, review_id)
    review = Review(**fetched)
    
    if (review.user != current_user.username):
        return HTTPException(401, "User does not own review")
    
    item_collection, item_shelf, item_type = type_map[review.type]

    # Get item related to review and update review section
    fetched = fetch_one(item_collection, item_shelf, review.owner)
    item = item_type(**fetched)

    num_review = item.reviews.reviews.__len__()
    deleted = False
    # Iterate through all reviews in an items review section and pop
    for idx, review in enumerate(item.reviews.reviews):
        if review.review_id == int(review_id):
            deleted = True
            item.reviews.reviews.pop(idx)

    if (deleted):
        # Calculate new average score
        if num_review == 1:
            item.reviews.score = 0
        else:
            item.reviews.score = ((item.reviews.score * num_review) - review.rating) / (num_review - 1)
    
        # Update item with review deleted from object
        update_item(item_collection, item_shelf, review.owner, item)

        return delete_item(reviews, review_map, review_id)
    
    return HTTPException(status_code=404, detail="Resource found but not deleted")

