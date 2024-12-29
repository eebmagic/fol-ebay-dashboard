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
