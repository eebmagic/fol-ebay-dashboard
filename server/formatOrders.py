import json
from datetime import datetime
import utils
import ebayApi
import asyncio

def formatDate(date):
    if type(date) == str:
        return date

    return date.strftime('%m/%d/%Y')

def reduce_multi_order(order, token):
    '''
    Reduce an order that has multiple line items
    '''
    row = {
        'Title':                'TODO: would be multi-order result',
        'Date Sold':            '',
        'Total Sold Price':     '',
        'Tax':                  '',
        'Fees':                 '',
        'Shipping (User Paid)': '',
        'Discount':             '',
    }

    return [row]

async def reduce_single_order(order, token):
    '''
    Reduce an order that has a single line item
    '''

    try:
        item = order['lineItems'][0]
        print(f'Expanding data for this order: {json.dumps(order, indent=2)}')
        fullItem = await ebayApi.get_item(token, item['legacyItemId'])
    except Exception as e:
        print(f'Error getting full item for order: {e}')
        print(f'failed to get full item details for the order. Likely because it is archived.')
        fullItem = None

    try:
        titleObject = utils.format_url(item['title'], item['legacyItemId'])
        dateSold = datetime.strptime(order['creationDate'], '%Y-%m-%dT%H:%M:%S.%fZ')

        if fullItem:
            imageObject = utils.format_image(fullItem)
            dateListed = datetime.strptime(fullItem['ListingDetails']['StartTime'], '%Y-%m-%dT%H:%M:%S.%fZ')
            daysListed = (dateSold - dateListed).days
        else:
            imageObject = 'image not found'
            dateListed = 'date not found'
            daysListed = 'listing date not found'

        row = {
            'id':                   order['orderId'],
            'Title':                titleObject,
            'Image':                imageObject,
            'Date Sold':            formatDate(dateSold),
            'Date Listed':          formatDate(dateListed),
            'Total Days Listed':    daysListed,
            'Total Sold Price':     order['totalFeeBasisAmount']['value'],
            # For some reason, not all orders/items have a key for ebayCollectAndRemitTaxes,
            # However the keyword shows up 89 times in the sample,
            # even though there are 50 orders and 53 line items?
            'Tax':                  (item['ebayCollectAndRemitTaxes'][0]['amount']['value']
                                     if 'ebayCollectAndRemitTaxes' in item
                                     else 0),
            'Fees':                 order['totalMarketplaceFee']['value'],
            'Shipping (User Paid)': order['pricingSummary']['deliveryCost']['value'],
            'Discount':             (order['pricingSummary']['adjustment']['value']
                                     if 'adjustment' in order['pricingSummary']
                                     else 0),
            'Accepted Price':       item['lineItemCost']['value'],
            'Shipping (Paid)':      order['pricingSummary']['deliveryCost']['value'],
        }

        return row
    except KeyError as e:
        print(e)
        print('\nITEM', item.keys())
        print('\nORDER', order.keys())
        raise

async def format_orders(orders, token):
    tasks = []
    for order in orders:
        if len(order['lineItems']) > 1:
            result = reduce_multi_order(order=order, token=token)
            tasks.extend(result)
        else:
            task = asyncio.create_task(reduce_single_order(order=order, token=token))
            tasks.append(task)

    results = await asyncio.gather(*tasks)
    # return [r for r in results if r is not None]
    return results
