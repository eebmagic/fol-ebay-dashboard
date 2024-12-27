import json
from datetime import datetime
import utils
import ebayApi
import asyncio
import os

### Formatting

def formatDate(date):
    if type(date) == str:
        return date

    return date.strftime('%m/%d/%Y')


### Caching

_cache = {}
_cache_lock = asyncio.Lock()
_cache_file = os.path.join(os.path.dirname(__file__), 'data/orders_cache.json')

async def check_cache(order_id):
    """
    Check if order exists in cache and return cached data if found.
    Uses file-backed cache with async locking for thread safety.
    """
    if not order_id:
        return None
        
    async with _cache_lock:
        # Load cache from file if empty
        try:
            if os.path.exists(_cache_file):
                with open(_cache_file, 'r') as f:
                    content = json.load(f)
                    _cache = content
        except Exception as e:
            print(f"Error loading cache: {e}")
            return None
                
        # Check if order in cache
        return _cache.get(order_id)

async def update_cache(order_id, data):
    async with _cache_lock:
        try:
            with open(_cache_file, 'w') as f:
                _cache[order_id] = data
                json.dump(_cache, f)
                return True
        except Exception as e:
            print(f"Error updating cache: {e}")
            return False
    

### Handlers

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
        # print(f'Expanding data for this order: {json.dumps(order, indent=2)}')
        print(f'Expanding data for order')
        fullItem = await ebayApi.get_item(token, item['legacyItemId'])
    except Exception as e:
        print(f'Error getting full item for order: {e}')
        print(f'failed to get full item details for the order. Likely because it is archived.')
        fullItem = None

    try:
        order_id = order['orderId']
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
            'id':                   order_id,
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

        # Update cache
        updated = await update_cache(order_id, row)
        if not updated:
            print(f'FAILED TO UPDATE CACHE: for order: {order_id}')
        else:
            print(f'updated cache for order: {order_id}')

        return row
    except KeyError as e:
        print(e)
        print('\nITEM', item.keys())
        print('\nORDER', order.keys())
        raise


### Main Loop

async def format_orders(orders, token):
    tasks = []
    for order in orders:
        order_id = order['orderId']
        cache_result = await check_cache(order_id)
        if cache_result:
            print(f'Found cache for {order_id}')
            # Wrap the cache result in a completed future instead of adding directly
            tasks.append(asyncio.create_task(asyncio.sleep(0, result=cache_result)))
            continue

        if len(order['lineItems']) > 1:
            result = reduce_multi_order(order=order, token=token)
            # Wrap multi-order results in completed futures
            tasks.extend([asyncio.create_task(asyncio.sleep(0, result=r)) for r in result])
        else:
            task = asyncio.create_task(reduce_single_order(order=order, token=token))
            tasks.append(task)
    
    results = await asyncio.gather(*tasks)
    return results
