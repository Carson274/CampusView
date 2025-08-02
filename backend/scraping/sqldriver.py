import json
import psycopg2
import bcrypt

conn = psycopg2.connect(
    database="test",
    host="localhost",
    user="ajinkyagokule",
    password="ajinkya421v",
    port="5432"
)

cur = conn.cursor()

def display():
    print("--------------------")
    cur.execute("SELECT rest_id, name, rating FROM restaurants")
    rows = cur.fetchall()
    print("Restaurants:")
    for row in rows:
        print(row)
    print("--------------------")

    print("--------------------")
    cur.execute("SELECT user_id, email FROM users")
    rows = cur.fetchall()
    print("Users:")
    for row in rows:
        print(row)
    print("--------------------")
    
    print("--------------------")
    cur.execute("SELECT user_id, rest_id, rating, review_text FROM rest_reviews")
    rows = cur.fetchall()
    print("Reviews:")
    for row in rows:
        print(row)
    print("--------------------")

# restaurant object should have
# id: unique id of the restaurant
# name: name of the restaurant
# description: description of the restaurant
# address: address of the restaurant
# menu_url: url of the menu
# detail_url: url of the restaurant details
# img_url: url of the restaurant image
# times: dictionary of opening and closing times
# menu: dictionary of menu items
def insertRestaurant(restaurant):
    cur.execute('''
        INSERT INTO restaurants (rest_id, name, description, address, menu_url, details_url, img_url, times, menus)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)''',(
            restaurant['id'], 
            restaurant['name'], 
            restaurant['description'], 
            restaurant['address'], 
            restaurant['menu_url'], 
            restaurant['detail_url'], 
            restaurant['img_url'], 
            json.dumps(restaurant['times']),
            json.dumps(restaurant['menu'])
        )
    )
    conn.commit()

def validRestaurant(restaurant_name):
    try:
        cur.execute("SELECT * FROM restaurants WHERE name = %s", (restaurant_name,))
        return cur.fetchone() != None
    except:
        return False

def populateRestaurants():
    with open('restaurants.json') as f:
        restaurants = json.load(f)
        for restaurant in restaurants:
            insertRestaurant(restaurant)

def getRestaurants():
    # get all restaurants and with their reviews
    cur.execute("SELECT rest_id, name, description, rating, address, menu_url, details_url, img_url, times, menus FROM restaurants")
    rows = cur.fetchall()
    restaurants = []
    for row in rows:
        restaurant = {}
        restaurant['id'] = row[0]
        restaurant['name'] = row[1]
        restaurant['description'] = row[2]
        restaurant['rating'] = row[3]
        restaurant['address'] = row[4]
        restaurant['menu_url'] = row[5]
        restaurant['detail_url'] = row[6]
        restaurant['img_url'] = row[7]
        restaurant['times'] = row[8]
        restaurant['menu'] = row[9]
        reviews = []
        cur.execute("SELECT rating, review_text FROM rest_reviews WHERE rest_id = %s", (restaurant['id'],))
        review_rows = cur.fetchall()
        for review_row in review_rows:
            review = {}
            review['rating'] = review_row[0]
            review['review'] = review_row[1]
            reviews.append(review)
        restaurant['reviews'] = reviews
        restaurants.append(restaurant)
    return restaurants

# user object should have
# email: email of the user
# password: password of the user
def insertUser(user):
    hashed_password = bcrypt.hashpw(str(user['password']).encode(), bcrypt.gensalt())
    cur.execute('''
        INSERT INTO users (email, hashed_password)
        VALUES (%s, %s)''',(
            user['email'], 
            hashed_password.decode()
        )
    )
    conn.commit()

def validUser(user):
    cur.execute("SELECT hashed_password FROM users WHERE email = %s", (user['email'],))
    hashed_password = cur.fetchone()
    return bcrypt.checkpw(str(user['password']).encode(), hashed_password[0].encode())

# review object should have
# email: email of the user who is reviewing
# restaurant: name of the restaurant
# rating: rating of the restaurant (1-5)
# review_text: review of the restaurant
def insertRestaurantReview(review):
    # get user_id
    try:
        cur.execute("SELECT user_id FROM users WHERE email = %s", (review['email'],))
        user_id = cur.fetchone()[0]
    except:
        print("User not found")
        return None
    
    # get rest_id
    try:
        cur.execute("SELECT rest_id FROM restaurants WHERE name = %s", (review['restaurant'],))
        rest_id = cur.fetchone()[0]
    except:
        print("Restaurant not found")
        return None

    cur.execute('''
        INSERT INTO rest_reviews (user_id, rest_id, rating, review_text)
        VALUES (%s, %s, %s, %s)''',(
            user_id,
            rest_id,
            review['rating'],
            review['review']
        )
    )
    conn.commit()

    # calculate average rating and update the restaurant table
    cur.execute("SELECT AVG(rating) FROM rest_reviews WHERE rest_id = %s", (rest_id,))
    avg_rating = cur.fetchone()[0]
    cur.execute("UPDATE restaurants SET rating = %s WHERE rest_id = %s", (avg_rating, rest_id))
    conn.commit()

def clearTables():
    cur.execute("TRUNCATE TABLE rest_reviews, users")
    conn.commit()

if __name__ == "__main__":
    clearTables()

    user = {
        "email": "ajinkyagokule@gmail.com",
        "password": "ajinkya421v"
    }

    insertUser(user)

    review = {
        **user,
        "restaurant": "Cascadia Deli",
        "rating": 5,
        "review": "Best food ever!"
    }

    insertRestaurantReview(review)

    review = {
        **user,
        "restaurant": "Cascadia Deli",
        "rating": 3,
        "review": "Mid food"
    }

    insertRestaurantReview(review)

    review = {
        **user,
        "restaurant": "Cascadia Deli",
        "rating": 2,
        "review": "Bad food"
    }

    insertRestaurantReview(review)
    display()

    restaurants = getRestaurants()
    # print the restaurant with name "Cascadia Deli"
    for restaurant in restaurants:
        if restaurant['name'] == "Cascadia Deli":
            print(restaurant)
            break