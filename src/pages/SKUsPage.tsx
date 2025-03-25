import React, { useState, useRef, useEffect, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { v4 as uuidv4 } from 'uuid';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { ColDef } from 'ag-grid-community';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import {
  SKUInterface,
  TempSKU,
  PermanentSKU,
  setSKUs,
  addSKU,
  updateSKU,
  deleteSKU,
} from '../redux/features/skusSlice';
import { RootState } from '../redux/store';

const SKUPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { skus } = useAppSelector((state: RootState) => state.skus);
  const [tempData, setTempData] = useState<TempSKU[]>([]);
  const gridRef = useRef<AgGridReact<SKUInterface>>(null);

  // Load initial data if empty
  useEffect(() => {
    const hasInitialized = localStorage.getItem('skusInitialized');
    if (!hasInitialized && skus.length === 0) {
      dispatch(
        setSKUs([
          {
            id: uuidv4(),
            sku: 'Cotton Polo Shirt',
            price: 139.99,
            cost: 10.78,
          },
          {
            id: uuidv4(),
            sku: 'Tassel Fringe Handbag',
            price: 134.99,
            cost: 20.79,
          },
          {
            id: uuidv4(),
            sku: 'Minimalist Leather Watch',
            price: 49.99,
            cost: 49.89,
          },
        ])
      );
      localStorage.setItem('skusInitialized', 'true');
    }
  }, [dispatch, skus.length]);

  // Load temp data from localStorage
  useEffect(() => {
    const savedTempData = localStorage.getItem('tempSkus');
    if (savedTempData) {
      try {
        const parsedTempData = JSON.parse(savedTempData);
        setTempData(parsedTempData);
      } catch (error) {
        console.error('Error loading temp SKUs:', error);
      }
    }
  }, []);

  // Save temp data to localStorage
  useEffect(() => {
    localStorage.setItem('tempSkus', JSON.stringify(tempData));
  }, [tempData]);

  const handleAddSKU = (): void => {
    const newSKU: TempSKU = {
      tempId: uuidv4(),
      sku: '',
      price: 0.0,
      cost: 0.0,
    };
    setTempData((prev) => [...prev, newSKU]);
  };

  const handleRemoveSKU = (id?: string, row?: SKUInterface): void => {
    if (id) {
      dispatch(deleteSKU(id));
    } else if ('tempId' in row!) {
      setTempData((prev) => prev.filter((sku) => sku.tempId !== row.tempId));
    }
  };

  const columnDefs = useMemo<ColDef<SKUInterface>[]>(
    () => [
      {
        headerName: '',
        cellRenderer: (params: { data?: SKUInterface }) =>
          params.data ? (
            <button
              className="px-4 py-2 rounded bg-transparent text-gray-700 p-0 m-0 flex items-center justify-center cursor-pointer"
              onClick={() => {
                if (params.data) {
                  handleRemoveSKU(
                    'id' in params.data ? params.data.id : undefined,
                    params.data
                  );
                }
              }}>
              <RiDeleteBin6Line size={18} />
            </button>
          ) : null,
        width: 30,
        maxWidth: 80,
        minWidth: 60,
        cellStyle: { padding: '4px', textAlign: 'center' },
        headerClass: 'custom-header',
      },
      {
        headerName: 'SKU',
        field: 'sku',
        width: 90,
        cellClass: 'border-right',
        headerClass: 'border-right custom-header',
        editable: true,
        valueSetter: (params) => {
          const newValue = params.newValue;
          const data = { ...params.data };

          if ('id' in data) {
            const updatedSKU: PermanentSKU = {
              ...data,
              sku: newValue,
            };
            dispatch(updateSKU(updatedSKU));
          } else if ('tempId' in data) {
            const updatedTemp: TempSKU = {
              ...data,
              sku: newValue,
            };
            if (updatedTemp.sku.trim() !== '') {
              const newSKU: PermanentSKU = {
                id: uuidv4(),
                sku: updatedTemp.sku,
                price: updatedTemp.price,
                cost: updatedTemp.cost,
              };
              dispatch(addSKU(newSKU));
              setTempData((prev) =>
                prev.filter((sku) => sku.tempId !== updatedTemp.tempId)
              );
            } else {
              setTempData((prev) =>
                prev.map((sku) =>
                  sku.tempId === updatedTemp.tempId ? updatedTemp : sku
                )
              );
            }
          }
          return true;
        },
      },
      {
        headerName: 'Price',
        field: 'price',
        headerClass: 'custom-header',
        editable: true,
        valueFormatter: (params) => `$ ${Number(params.value).toFixed(2)}`,
        valueSetter: (params) => {
          const newValue = Number(params.newValue);
          const data = { ...params.data };

          if ('id' in data) {
            const updatedSKU: PermanentSKU = {
              ...data,
              price: newValue,
            };
            dispatch(updateSKU(updatedSKU));
          } else if ('tempId' in data) {
            const updatedTemp: TempSKU = {
              ...data,
              price: newValue,
            };
            setTempData((prev) =>
              prev.map((sku) =>
                sku.tempId === updatedTemp.tempId ? updatedTemp : sku
              )
            );
          }
          return true;
        },
      },
      {
        headerName: 'Cost',
        field: 'cost',
        headerClass: 'custom-header',
        editable: true,
        valueFormatter: (params) => `$ ${Number(params.value).toFixed(2)}`,
        valueSetter: (params) => {
          const newValue = Number(params.newValue);
          const data = { ...params.data };

          if ('id' in data) {
            const updatedSKU: PermanentSKU = {
              ...data,
              cost: newValue,
            };
            dispatch(updateSKU(updatedSKU));
          } else if ('tempId' in data) {
            const updatedTemp: TempSKU = {
              ...data,
              cost: newValue,
            };
            setTempData((prev) =>
              prev.map((sku) =>
                sku.tempId === updatedTemp.tempId ? updatedTemp : sku
              )
            );
          }
          return true;
        },
      },
    ],
    [dispatch, setTempData]
  );

  const defaultColDef = useMemo(
    () => ({
      editable: false,
      sortable: true,
    }),
    []
  );

  const getRowId = (params: { data: SKUInterface }) => {
    return 'id' in params.data ? params.data.id : params.data.tempId;
  };

  return (
    <div className="sku-container">
      <div className="sku-table ag-theme-alpine rounded-none">
        <AgGridReact
          ref={gridRef}
          rowData={[...skus, ...tempData]}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          domLayout="autoHeight"
          animateRows={true}
          getRowId={getRowId}
          enableCellTextSelection={true}
          ensureDomOrder={true}
          stopEditingWhenCellsLoseFocus={true}
        />
      </div>
      <button
        className="sku-button bg-green-500 cursor-pointer text-gray-800 px-4 py-2 mt-4 rounded shadow-md flex items-center gap-2"
        onClick={handleAddSKU}>
        NEW SKU
      </button>
    </div>
  );
};

export default SKUPage;
