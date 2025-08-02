from flask import Flask, render_template, jsonify, request
from pymongo import MongoClient
from dotenv import dotenv_values
import json
from bson import json_util
import shelve

config = dotenv_values(".env")

app = Flask(__name__)
client = MongoClient(config['MONGODB_CONNECTSTR'])

# Database and collections
db = client.campusview
restaurants = db.restaurants
clubs = db.clubs
studyspots = db.studyspots
reviews = db.reviews

# Persistant store of mapping between endpoint name and document obj_id in MongoDB
rest_map = shelve.open("rest")
club_map = shelve.open("club")
study_map = shelve.open("study")

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/restaurant/", methods = ['GET'])
def fetch_restaurants():
    rest = []
    cursor = json.loads(json_util.dumps(restaurants.find({})))
    for document in cursor:
        document.pop('_id', None)
        rest.append(document)
    return jsonify(rest)

def insert_new(collection, map, name):
    new_id = collection.insert_one(request.json).inserted_id
    map[name] = new_id
    map.sync()

@app.route("/restaurant/<restaurant_name>", methods = ['GET', 'POST', 'DELETE', 'PUT'])
def fetch_restaurant(restaurant_name):

    # Used to insert new restaurant into database
    if request.method == 'PUT':
        insert_new(restaurants, rest_map, restaurant_name)
        return "Success", 200

    # Used for requesting specific restaurant
    elif request.method == 'GET':
        try:
            obj_id = rest_map[restaurant_name]
        except KeyError as e:
            return "GET ERROR 404: Resource Not Found", 404
        except:
            return "Server Error", 500
        
        res = json.loads(json_util.dumps(restaurants.find_one({"_id" : obj_id})))

        if res is None:
            return "GET ERROR 404: Resource Not Found", 404

        res.pop('_id', None)
        return res
    
    # Used for updating specific restaurant information
    elif request.method == 'POST':
        
        restaurant_name = request.get_json()['name']
        if restaurant_name is None:
            return "Client Error", 400
        # Check if already exists, if it doesn't put in database
        try:
            obj_id = rest_map[restaurant_name]
        except KeyError as e:
            insert_new(restaurants, rest_map, restaurant_name)
            return "Success", 200
        except:
            return "Server Error", 500

        try:
            restaurants.update_one({"_id": obj_id}, {"$set": request.get_json()})
        except:
            return "Server Error", 500

        return "Success", 200

    # Used for deleting a specific restaurant, only permitable for certain users with permission
    elif request.method == 'DELETE':

        return "Not Implemented", 501
    
    else:
        return "POST ERROR 405: Method Not Allowed", 405

@app.route("/club/<club_id>", methods = ['GET', 'POST', 'DELETE'])
def fetch_club(club_id):

    return "Not Implemented", 501

    if request.method == 'GET':
        pass
    elif request.method == 'POST':
        data = request.form # a multidict containing POST data
    elif request.method == 'DELETE':
        pass
    else:
        return "POST Error 405 Method Not Allowed", 405
    return jsonify({
        "Club Name" : "Ur mother"
    })

@app.route("/studyspot/<spot_id>", methods = ['GET', 'POST', 'DELETE'])
def fetch_study_spot(spot_id):

    return "Not Implemented", 501

    if request.method == 'GET':
        pass
    elif request.method == 'POST':
        data = request.form # a multidict containing POST data
    elif request.method == 'DELETE':
        pass
    else:
        return "POST Error 405 Method Not Allowed", 405
    return jsonify({
        "Study Spot" : "Ur mother"
    })

if __name__ == "__main__":
    app.run()