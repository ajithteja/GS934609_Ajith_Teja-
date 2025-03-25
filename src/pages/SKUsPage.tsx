import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { v4 as uuidv4 } from 'uuid';
import { RiDeleteBin6Line } from 'react-icons/ri';
import {
  ColDef,
  ModuleRegistry,
  ClientSideRowModelModule,
  AllCommunityModule,
  ValueSetterParams,
  GetRowIdParams,
  ValueGetterParams,
} from 'ag-grid-community';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import {
  TempSKU,
  PermanentSKU,
  setSKUs,
  addSKU,
  updateSKU,
  deleteSKU,
} from '../redux/features/skusSlice';
import { RootState } from '../redux/store';
import '../styles/global.css';

ModuleRegistry.registerModules([ClientSideRowModelModule, AllCommunityModule]);

const SKUPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { skus } = useAppSelector((state: RootState) => state.skus);
  const [tempData, setTempData] = useState<TempSKU[]>([]);
  const gridRef = useRef<AgGridReact<PermanentSKU | TempSKU>>(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getResponsiveSize = useCallback(() => {
    if (windowWidth < 640) return 'sm';
    if (windowWidth < 768) return 'md';
    return 'lg';
  }, [windowWidth]);

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

  const handleAddSKU = useCallback(() => {
    const newSKU: TempSKU = {
      tempId: uuidv4(),
      sku: '',
      price: 0,
      cost: 0,
    };
    setTempData((prev) => [...prev, newSKU]);
  }, []);

  const handleDelete = useCallback(
    (id: string | undefined, data: PermanentSKU | TempSKU) => {
      console.log('id', id);
      if ('id' in data) {
        dispatch(deleteSKU(data.id));
      } else {
        setTempData((prev) => prev.filter((sku) => sku.tempId !== data.tempId));
      }
    },
    [dispatch]
  );

  const valueSetter = useCallback(
    (params: ValueSetterParams) => {
      const field = params.column.getColId();
      const newValue = params.newValue;
      const data = { ...params.data };
      data[field] = newValue;

      if ('id' in data) {
        dispatch(updateSKU(data as PermanentSKU));
      } else if (field === 'sku' && data.sku?.trim() !== '') {
        const newSKU: PermanentSKU = {
          id: uuidv4(),
          sku: data.sku,
          price: data.price || 0,
          cost: data.cost || 0,
        };
        dispatch(addSKU(newSKU));
        setTempData((prev) =>
          prev.filter((sku) => sku.tempId !== (data as TempSKU).tempId)
        );
      } else {
        setTempData((prev) =>
          prev.map((sku) =>
            sku.tempId === (data as TempSKU).tempId ? (data as TempSKU) : sku
          )
        );
      }
      return true;
    },
    [dispatch]
  );

  const getResponsiveColumnSizes = useCallback(() => {
    const size = getResponsiveSize();
    return {
      deleteColumn: size === 'sm' ? 40 : size === 'md' ? 50 : 60,
      snoColumn: size === 'sm' ? 60 : size === 'md' ? 70 : 80,
      minWidth: {
        sku: size === 'sm' ? 120 : size === 'md' ? 130 : 150,
        price: size === 'sm' ? 100 : size === 'md' ? 110 : 120,
        cost: size === 'sm' ? 100 : size === 'md' ? 110 : 120,
      },
    };
  }, [getResponsiveSize]);

  const columnSizes = getResponsiveColumnSizes();

  const columnDefs = useMemo<ColDef<PermanentSKU | TempSKU>[]>(
    () => [
      {
        headerName: '',
        cellRenderer: (params: { data?: PermanentSKU | TempSKU }) =>
          params.data ? (
            <button
              className="px-2 sm:px-4 rounded bg-transparent text-gray-700 p-0 m-0 flex items-center justify-center cursor-pointer"
              onClick={() => {
                if (params.data) {
                  handleDelete(
                    'id' in params.data ? params.data.id : undefined,
                    params.data
                  );
                }
              }}>
              <RiDeleteBin6Line size={getResponsiveSize() === 'sm' ? 14 : 18} />
            </button>
          ) : null,
        width: columnSizes.deleteColumn,
        maxWidth: columnSizes.deleteColumn,
        minWidth: columnSizes.deleteColumn,
        cellStyle: { padding: '4px', textAlign: 'center' },
        headerClass: 'ag-header-responsive custom-header',
        cellClass: 'ag-cell-responsive',
        suppressSizeToFit: true,
      },
      {
        headerName: 'S.No',
        valueGetter: (params: ValueGetterParams<PermanentSKU | TempSKU>) => {
          if (!params.data) return '';
          const allSKUs = [...skus, ...tempData];
          const index = allSKUs.findIndex((sku) => {
            if (!params.data) return false;
            if ('id' in sku && 'id' in params.data) {
              return sku.id === params.data.id;
            }
            if ('tempId' in sku && 'tempId' in params.data) {
              return sku.tempId === params.data.tempId;
            }
            return false;
          });
          return index + 1;
        },
        width: columnSizes.snoColumn,
        minWidth: columnSizes.snoColumn,
        maxWidth: columnSizes.snoColumn,
        cellClass: 'ag-cell-responsive border-right',
        headerClass: 'ag-header-responsive border-right custom-header',
        suppressSizeToFit: true,
      },
      {
        headerName: 'SKU',
        field: 'sku',
        headerClass: 'ag-header-responsive custom-header',
        cellClass: 'ag-cell-responsive',
        editable: true,
        valueSetter: valueSetter,
        flex: 2,
        minWidth: columnSizes.minWidth.sku,
      },
      {
        headerName: 'Price',
        field: 'price',
        headerClass: 'ag-header-responsive custom-header',
        cellClass: 'ag-cell-responsive',
        editable: true,
        valueSetter: valueSetter,
        flex: 1,
        minWidth: columnSizes.minWidth.price,
      },
      {
        headerName: 'Cost',
        field: 'cost',
        headerClass: 'ag-header-responsive custom-header',
        cellClass: 'ag-cell-responsive',
        editable: true,
        valueSetter: valueSetter,
        flex: 1,
        minWidth: columnSizes.minWidth.cost,
      },
    ],
    [
      dispatch,
      skus,
      tempData,
      handleDelete,
      valueSetter,
      columnSizes,
      getResponsiveSize,
    ]
  );

  const defaultColDef = useMemo(
    () => ({
      editable: false,
      sortable: true,
      resizable: true,
    }),
    []
  );

  const getRowId = useCallback(
    (params: GetRowIdParams<PermanentSKU | TempSKU>) => {
      if (!params.data) return '';
      return 'id' in params.data ? params.data.id : params.data.tempId;
    },
    []
  );

  return (
    <div className="sku-container flex flex-col h-full w-full overflow-hidden p-2 sm:p-4">
      <div className="sku-table flex-1 w-full ag-theme-alpine rounded-none">
        <AgGridReact
          ref={gridRef}
          rowData={[...skus, ...tempData]}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          getRowId={getRowId}
          enableCellTextSelection={true}
          ensureDomOrder={true}
          stopEditingWhenCellsLoseFocus={true}
          suppressRowHoverHighlight={false}
          domLayout="autoHeight"
          headerHeight={getResponsiveSize() === 'sm' ? 36 : 42}
          rowHeight={getResponsiveSize() === 'sm' ? 32 : 38}
        />
      </div>
      <div className="mt-2 sm:mt-4">
        <button
          className="sku-button bg-green-500 cursor-pointer text-gray-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded shadow-md flex items-center gap-2 text-sm sm:text-base"
          onClick={handleAddSKU}>
          NEW SKU
        </button>
      </div>
    </div>
  );
};

export default SKUPage;
