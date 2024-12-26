import React from 'react';
import { OrderList } from 'primereact/orderlist';
import { Button } from 'primereact/button';

const ListModal = ({ columns, setColumns }) => {
  const handleReorder = (e) => {
    // Update the columns with the new order
    setColumns(e.value);
    console.log('updating columns', e.value);
  };

  const addSpacer = () => {
    // Create new array with spacer added to the end
    const newColumns = [...columns, "<SPACER>"];
    setColumns(newColumns);
    
    // Scroll to bottom after a brief delay to allow for render
    setTimeout(() => {
      const orderList = document.querySelector('.p-orderlist-list');
      if (orderList) {
        orderList.scrollTop = orderList.scrollHeight;
      }
    }, 100);
  };

  // Custom template for each item in the list
  const itemTemplate = (item) => {
    if (item === "<SPACER>") {
      return (
        <div className="flex align-columns-center p-1">
          <div className="flex-1" style={{opacity: 0.5}}>
            <i>SPACER</i>
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex align-columns-center p-1">
          <div className="flex-1">
            {item}
          </div>
        </div>
      );
    }
  };

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
      }}
    >
      <OrderList 
        value={columns} 
        onChange={handleReorder}
        itemTemplate={itemTemplate}
        header="Drag to Reorder Columns"
        dragdrop
        style={{ height: '99%' }}
      />

      <Button 
        severity="secondary"
        className="mt-2"
        onClick={addSpacer}
        label="Add Spacer"
      />
    </div>
  );
};

export default ListModal;
