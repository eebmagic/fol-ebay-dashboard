import json
import pandas as pd

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
    fullItem = utils.get_item(item['legacyItemId'])

    try:
        urlTitle = utils.format_url(item['title'], item['legacyItemId'])
        imageUrl = utils.format_image(fullItem)
        row = {
            'Title':                urlTitle,
            'Image':                imageUrl,
            'Date Sold':            order['creationDate'],
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
