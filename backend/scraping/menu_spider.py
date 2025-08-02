from spider import Spider

class MenuSpider(Spider):
    def __init__(self):
        super().__init__("https://my.uhds.oregonstate.edu/api/dining/weeklymenu/1")

    def start_requests(self):
        # Logic specific to starting requests for the menu website
        pass

    def parse(self, response):
        # Parsing logic specific to the menu website
        pass

    def save_to_db(self, database):
        # Save the data to the database
        pass
