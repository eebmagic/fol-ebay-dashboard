import json
import pandas as pd
from datetime import datetime
import utils
import ebayApi
import auth

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

def reduce_single_order(order, token):
    '''
    Reduce an order that has a single line item
    '''
    item = order['lineItems'][0]
    print(f'Expanding data for this order: {json.dumps(order, indent=2)}')
    fullItem = ebayApi.get_item(token, item['legacyItemId'])

    try:
        titleObject = utils.format_url(item['title'], item['legacyItemId'])
        imageObject = utils.format_image(fullItem)
        dateSold = datetime.strptime(order['creationDate'], '%Y-%m-%dT%H:%M:%S.%fZ')
        dateListed = datetime.strptime(fullItem['ListingDetails']['StartTime'], '%Y-%m-%dT%H:%M:%S.%fZ')
        daysListed = (dateSold - dateListed).days

        row = {
            'Title':                titleObject,
            'Image':                imageObject,
            'Date Sold':            order['creationDate'],  # TODO: Date formatting
            'Date Listed':          fullItem['ListingDetails']['StartTime'],  # TODO: Date formatting
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
        }

        return row
    except KeyError as e:
        print(e)
        print('\nITEM', item.keys())
        print('\nORDER', order.keys())
        raise


def format_orders(orders, token):
    rows = []
    for order in orders:
        if len(order['lineItems']) > 1:
            result = reduce_multi_order(order=order, token=token)
            rows.extend(result)
        else:
            rows.append(reduce_single_order(order=order, token=token))

    return rows


if __name__ == '__main__':
    with open('sample-data/orders_sample.json') as file:
        data = json.load(file)
    print(type(data))
    print(data.keys())
    print(f'DATA HAS {len(data["orders"])} ORDERS')

    rowData = format_orders(data['orders'])
    df = pd.DataFrame(rowData)
    print(df)

    import pyperclip

    tsv_string = df.head(3).to_csv(sep='\t', index=False)
    pyperclip.copy(tsv_string)
    print('COPIED TO CLIPBOARD')
