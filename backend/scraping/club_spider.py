from spider import Spider

class ClubsSpider(Spider):
    def __init__(self):
        super().__init__("https://my.uhds.oregonstate.edu/api/drupal/hours")

    def start_requests(self):
        # Logic specific to starting requests for the clubs website
        pass

    def parse(self, response):
        # Parsing logic specific to the clubs website
        pass

    def save_to_db(self, database):
        # Save the data to the database
        pass
