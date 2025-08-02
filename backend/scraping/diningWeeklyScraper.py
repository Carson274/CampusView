import requests
import bs4 as bs
import re
import datetime
from collections import defaultdict
import json

class DiningScraper:
    def __init__(self):
        self.rest_id_map = self.getRestIDMap()
        self.rest_list = None

    def getRestIDMap(self):
        menus = {}
        url = "https://my.uhds.oregonstate.edu/api/dining/weeklymenu/1"
        response = requests.get(url)
        soup = bs.BeautifulSoup(response.text, 'html.parser')
        locations = soup.find('select', id='locations')
        options = locations.find_all('option')
        for option in options:
            location = option.text.strip()
            location = location.replace('é', 'e')
            value = option['value']
            menus[location] = value

        # rename the key to a different name
        menus['The MainSqueeze'] = menus.pop('The Main Squeeze')
        menus["Bing's at Weatherford"] = menus.pop("Bing's Cafe")
        return menus
    
    def scrape(self):
        rest_id_map = self.rest_id_map
        soup = bs.BeautifulSoup(requests.get('https://my.uhds.oregonstate.edu/api/drupal/hours').text, 'html.parser')
        page = soup.find('div', class_='pure-g')
        buildings = page.find_all('h1', class_='zone')
        groups = page.find_all('div', class_='pure-g')

        rest_list = []

        for building, group in zip(buildings, groups):
            for restaurant in group.findChildren('div', recursive=False):
                if '*' in restaurant.a.text:
                    continue
                rest = {}

                rest['detail_url'] = restaurant.a.get('href')
                rest['dining_hall'] = building.text.strip()

                detail_url = restaurant.a.get('href')
                rest_soup = bs.BeautifulSoup(requests.get(detail_url).content, 'html.parser')
                content = rest_soup.find('div', id='content')
                img = content.find('img')
                img_url = ""
                if img:
                    img_url = "https://uhds.oregonstate.edu" + img.get('src')
                rest['img_url'] = img_url
                info = content.find('iframe').parent.parent

                name = info.findChildren()[0].text.strip() or info.findChildren()[1].text.strip()
                name = name.replace('é', 'e')
                name = name.replace('\xa0', ' ')

                rest_id = rest_id_map[name]

                rest['name'] = name
                
                desc = info.find('p').text.strip()

                rest['description'] = desc

                rest_id = rest_id_map[name]
                rest['id'] = rest_id

                menu_url = f'https://my.uhds.oregonstate.edu/api/dining/weeklymenu/{rest_id}/true'
                rest['menu_url'] = menu_url

                # find p tag with text 'Location'
                location_tag = rest_soup.find('p', string=re.compile('Location'))
                address = location_tag.find_next_sibling('p').text.strip().replace('\n', ', ').replace('\t', '')
                if address == "":
                    address = location_tag.find_next_sibling('p').find_next_sibling('p').text.strip().replace('\n', ', ').replace('\t', '')
                rest['address'] = address

                time_divs = restaurant.find_all('div', class_='time')

                # print today's date in number format November 27th
                today = datetime.datetime.now()

                times = {}
                times[today.strftime("%B %d")] = []
                for time_div in time_divs: times[today.strftime("%B %d")].append(time_div.text.strip())

                more_hours = restaurant.find('div', class_='more_hours')
                delta_day = datetime.timedelta(days=1)

                for element in more_hours.children:
                    if element.name == 'strong':
                        today += delta_day
                        times[today.strftime("%B %d")] = []
                    elif element.name == 'em':
                        times[today.strftime("%B %d")].append(element.text)

                rest['times'] = times
                
                weekly_menu = defaultdict(list)
                menus = bs.BeautifulSoup(requests.get(rest['menu_url']).content, 'html.parser')
                sections = menus.find_all('div', class_='section')

                if sections == []:
                    rest['menu'] = {}
                    continue
                
                for section in sections:
                    title = section.find('h6').text.strip()
                    date = title.split('-')[-1].replace("th", "").replace("nd", "").replace("rd", "").replace("st", "").strip()
                    ingredients = [p.text.strip() for p in section.find_all('p')]
                    weekly_menu[date].append({'title': title, 'ingredients': ingredients})

                rest['menu'] = weekly_menu
                rest_list.append(rest)
                self.rest_list = rest_list
        return rest_list
            
if __name__ == '__main__':
    scraper = DiningScraper()
    rest_list = scraper.scrape()
    print(len(rest_list))