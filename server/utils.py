import json
import os

### Format Sheet Cell Values ###

def format_url(title, legacyItemId):
    value = f'=HYPERLINK("https://www.ebay.com/itm/{legacyItemId}", "{title}")'

    return {
        'value': value,
        'preview': title,
        'url': f'https://www.ebay.com/itm/{legacyItemId}',
    }

def format_image(fullItem):
    url = fullItem['PictureDetails']['PictureURL'][0]
    value = f'=IMAGE("{url}")'

    return {
        'value': value,
        'preview': url,
    }


### Pull Listing Item Data ###

def get_item(legacyItemId):
    with open(os.path.join(os.path.dirname(__file__), 'sample-data/items.json')) as file:
        itemData = json.load(file)

    if legacyItemId in itemData:
        return itemData[legacyItemId]
    else:
        return pull_item(legacyItemId)

def pull_item(legacyItemId):
    # Make XML request to get the full item
    # Convert the xml to json
    # Store the result in the cache
    # Return the result
    return 'TODO: Make XML request to get full item'

