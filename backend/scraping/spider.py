from abc import ABC, abstractmethod

class Spider(ABC):
    def __init__(self, url):
        self.url = url

    @abstractmethod
    def start_requests(self):
        pass

    @abstractmethod
    def parse(self, response):
        pass

    @abstractmethod
    def save_to_db(self, database):
        pass