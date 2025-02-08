import { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';

import './DataView.css';
import ListModal from './ListModal';
import { buildClipobard, DEFAULT_COLUMNS } from './buildUtil';

function DataView({ orders, toast }) {
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [columns, setColumns] = useState(DEFAULT_COLUMNS);
  const [showColumns, setShowColumns] = useState(false);

  useEffect(() => {
    console.log('selectedOrders', selectedOrders);
  }, [selectedOrders]);

  const imageBodyTemplate = (rowData) => {
    const size = '60px';
    return <img
      src={rowData.Image?.preview ? rowData.Image.preview : null}
      alt={rowData.Title?.preview ? rowData.Title.preview : null}
      style={{width: size, height: size, objectFit: 'contain'}}
      key={rowData.Image?.preview ? rowData.Image.preview : null}
    />
  };

  const titleBodyTemplate = (rowData) => {
    return rowData.Title?.preview ? <a href={rowData.Title.url} target="_blank" rel="noopener noreferrer">{rowData.Title.preview}</a> : null;
  };

  const buildButtonFunc = () => {
    const workingSelection = (selectedOrders && selectedOrders.length > 0) ? selectedOrders : orders;

    console.log(`Building output for orders`, workingSelection);

    const result = buildClipobard(workingSelection, columns);

    if (result === true) {
      toast.current.show({
        severity: 'success',
        summary: 'Copied to clipboard',
        detail: `${workingSelection.length} order(s)`,
        life: 2000
      });
    } else {
      toast.current.show({
        severity: 'error',
        summary: 'Failed to copy to clipboard',
        detail: result,
        life: 2000
      });
    }
  };

  console.log('First order:', orders[0]);

  return (
    <div className="orders-container">

      {(orders && orders.length > 0) ? (
        <div className="realOrders">
          <DataTable 
            value={orders}
            sortField="Date Sold"
            sortOrder={1}
            selectionMode='checkbox'
            selection={selectedOrders}
            onSelectionChange={(e) => setSelectedOrders(e.value)}
            dataKey="id"
          >
            <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
            <Column field="Image.preview" header="Image" body={imageBodyTemplate} />
            <Column field="Title.preview" header="Title" body={titleBodyTemplate} sortable />
            <Column field="Date Sold" header="Date Sold" sortable />
          </DataTable>

          <div className="buttonRow">
            <Button
              onClick={buildButtonFunc}
              label="Copy"
              icon="pi pi-copy"
              severity="success"
              size="large"
              raised
              rounded
            />
            <Button
              onClick={() => setShowColumns(true)}
              icon="pi pi-cog"
              severity="secondary"
              size="large"
              raised
              rounded
            />
          </div>
        </div>
      ) : <p>No orders found</p>}

      <Dialog
        header="Edit Column Order"
        visible={showColumns}
        onHide={() => setShowColumns(false)}
      >
        <ListModal columns={columns} setColumns={setColumns} />
      </Dialog>

    </div>
  );
}

export default DataView;
