const SPACER = '<SPACER>';

const handleRow = (order, columns) => {
  const values = columns.map(column => {
    if (column === SPACER) {
      return '';
    }

    const columnValue = order[column];
    if (columnValue === undefined) {
      return 'NOT FOUND';
    }

    if (typeof columnValue === 'object') {
      return columnValue.value;
    }

    return columnValue;
  });

  return values.join('\t');
}

export const buildClipobard = (orders, columns) => {

  console.log('columns', columns);

  try {
    const mapReuslt = orders.map(order => {
        return handleRow(order, columns);
    });

    console.log('mapReuslt', mapReuslt);

    const joinedRows = mapReuslt.join('\n');
    console.log('joinedRows', joinedRows);
    // const text = 'Hello, this is a test string';
    navigator.clipboard.writeText(joinedRows);
    return true;
  } catch (error) {
    console.error('Failed to copy text:', error);
    return error.toString();
  }
};


export const DEFAULT_COLUMNS = [
  SPACER,
  SPACER,
  'Title',
  'Image',
  'Date Listed',
  'Date Sold',
  'Total Days Listed',
  'Accepted Price',
  'Order #',
  'Tracking #',
  'Offer',
  'Total Sold Price',
  'Tax',
  'Fees',
  'Shipping (Paid)',
  'Shipping Cost',
  'Shipping Difference',
  'Total Income'
];
