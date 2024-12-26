import { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputSwitch } from 'primereact/inputswitch';
import { Button } from 'primereact/button';
import { SplitButton } from 'primereact/splitbutton';
import { Toast } from 'primereact/toast';
import './DataView.css';

function DataView({ orders, toast }) {
  const [selectedOrders, setSelectedOrders] = useState([]);
  // const [rowClick, setRowClick] = useState(true);

  useEffect(() => {
    console.log('selectedOrders', selectedOrders);
  }, [selectedOrders]);

  const imageBodyTemplate = (rowData) => {
    const size = '60px';
    return <img
      src={rowData.Image.preview}
      alt={rowData.Title.preview}
      style={{width: size, height: size, objectFit: 'contain'}}
      key={rowData.Image.preview}
    />
  };

  const buildButtonFunc = () => {
    const workingSelection = (selectedOrders && selectedOrders.length > 0) ? selectedOrders : orders;

    console.log(`Building output for orders`, workingSelection);



    // toast.current.show({
    //   severity: 'success',
    //   summary: 'Copied to clipboard',
    //   detail: `${workingSelection.length} order(s)`,
    //   life: 1000
    // });

  };

  console.log('First order:', orders[0]);

  return (
    <div className="orders-container">

      {(orders && orders.length > 0) ? (
        <div className="realOrders">
          <DataTable 
            value={orders}
            selectionMode='checkbox'
            selection={selectedOrders}
            onSelectionChange={(e) => setSelectedOrders(e.value)}
            dataKey="id"
          >
            <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
            <Column field="Image.preview" header="Image" body={imageBodyTemplate} />
            <Column field="Title.preview" header="Title" />
            <Column field="Date Sold" header="Date Sold" />
          </DataTable>

          <div className="buttonRow">
            <Button
              onClick={buildButtonFunc}
              label="Copy"
              icon="pi pi-copy"
              // dropdownIcon="pi pi-cog"
              severity="success"
              size="large"
              raised
              rounded
            />
            <Button
              icon="pi pi-cog"
              severity="secondary"
              size="large"
              raised
              rounded
            />
          </div>
        </div>
      ) : <p>No orders found</p>}


    </div>
  );
}

export default DataView;
