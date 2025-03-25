import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { AgGridReact } from 'ag-grid-react';
import {
  ColDef,
  ModuleRegistry,
  ClientSideRowModelModule,
  AllCommunityModule,
  ValueSetterParams,
  GetRowIdParams,
  ValueGetterParams,
} from 'ag-grid-community';
import { v4 as uuidv4 } from 'uuid';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import {
  setStores,
  addStore,
  updateStore,
  deleteStore,
  PermanentStore,
  TempStore,
} from '../redux/features/storesSlice';
import { RootState } from '../redux/store';
import '../styles/global.css';

ModuleRegistry.registerModules([ClientSideRowModelModule, AllCommunityModule]);

const StoresPage = () => {
  const dispatch = useAppDispatch();
  const { stores } = useAppSelector((state: RootState) => state.stores);
  const [tempData, setTempData] = useState<TempStore[]>([]);
  const gridRef = useRef<AgGridReact<PermanentStore | TempStore>>(null);
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

  const handleAddStore = useCallback(() => {
    const newStore: TempStore = {
      tempId: uuidv4(),
      name: '',
      city: '',
      state: '',
    };
    setTempData((prev) => [...prev, newStore]);
  }, []);

  const handleDelete = useCallback(
    (id: string | undefined, data: PermanentStore | TempStore) => {
      console.log('id', id);
      if ('id' in data) {
        dispatch(deleteStore(data.id));
      } else {
        setTempData((prev) =>
          prev.filter((store) => store.tempId !== data.tempId)
        );
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
        dispatch(updateStore(data as PermanentStore));
      } else if (field === 'name' && data.name?.trim() !== '') {
        const newStore: PermanentStore = {
          id: uuidv4(),
          name: data.name,
          city: data.city || '',
          state: data.state || '',
        };
        dispatch(addStore(newStore));
        setTempData((prev) =>
          prev.filter((store) => store.tempId !== (data as TempStore).tempId)
        );
      } else {
        setTempData((prev) =>
          prev.map((store) =>
            store.tempId === (data as TempStore).tempId
              ? (data as TempStore)
              : store
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
        name: size === 'sm' ? 120 : size === 'md' ? 130 : 150,
        city: size === 'sm' ? 100 : size === 'md' ? 110 : 120,
        state: size === 'sm' ? 80 : size === 'md' ? 90 : 100,
      },
    };
  }, [getResponsiveSize]);

  const columnSizes = getResponsiveColumnSizes();

  const columnDefs = useMemo<ColDef<PermanentStore | TempStore>[]>(
    () => [
      {
        headerName: '',
        cellRenderer: (params: { data?: PermanentStore | TempStore }) =>
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
        rowDrag: true,

        valueGetter: (
          params: ValueGetterParams<PermanentStore | TempStore>
        ) => {
          if (!params.data) return '';
          const allStores = [...stores, ...tempData];
          const index = allStores.findIndex((store) => {
            if (!params.data) return false;
            if ('id' in store && 'id' in params.data) {
              return store.id === params.data.id;
            }
            if ('tempId' in store && 'tempId' in params.data) {
              return store.tempId === params.data.tempId;
            }
            return false;
          });
          return index + 1;
        },
        width: columnSizes.snoColumn,
        minWidth: columnSizes.snoColumn,
        // maxWidth: columnSizes.snoColumn,
        cellClass: 'ag-cell-responsive border-right',
        headerClass: 'ag-header-responsive border-right custom-header',
        suppressSizeToFit: true,
      },
      {
        headerName: 'Store Name',
        field: 'name',
        headerClass: 'ag-header-responsive custom-header',
        cellClass: 'ag-cell-responsive',
        editable: true,
        valueSetter: valueSetter,
        flex: 2,
        minWidth: columnSizes.minWidth.name,
      },
      {
        headerName: 'City',
        field: 'city',
        headerClass: 'ag-header-responsive custom-header',
        cellClass: 'ag-cell-responsive',
        editable: true,
        valueSetter: valueSetter,
        flex: 1,
        minWidth: columnSizes.minWidth.city,
      },
      {
        headerName: 'State',
        field: 'state',
        headerClass: 'ag-header-responsive custom-header',
        cellClass: 'ag-cell-responsive',
        editable: true,
        valueSetter: valueSetter,
        flex: 1,
        minWidth: columnSizes.minWidth.state,
      },
    ],
    [
      dispatch,
      stores,
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
    (params: GetRowIdParams<PermanentStore | TempStore>) => {
      if (!params.data) return '';
      return 'id' in params.data ? params.data.id : params.data.tempId;
    },
    []
  );

  useEffect(() => {
    const hasInitialized = localStorage.getItem('storesInitialized');
    if (!hasInitialized && stores.length === 0) {
      dispatch(
        setStores([
          {
            id: uuidv4(),
            name: 'Atlanta Outfitters',
            city: 'Atlanta',
            state: 'GA',
          },
          {
            id: uuidv4(),
            name: 'Chicago Charm Boutique',
            city: 'Chicago',
            state: 'IL',
          },
          {
            id: uuidv4(),
            name: 'Houston Harvest Market',
            city: 'Houston',
            state: 'TX',
          },
          {
            id: uuidv4(),
            name: 'Seattle Skyline Goods',
            city: 'Seattle',
            state: 'WA',
          },
          {
            id: uuidv4(),
            name: 'Miami Breeze Apparel',
            city: 'Miami',
            state: 'FL',
          },
        ])
      );
      localStorage.setItem('storesInitialized', 'true');
    }
  }, [dispatch, stores.length]);

  return (
    <div className="sku-container flex flex-col h-full w-full overflow-hidden p-2 sm:p-4">
      <div className="sku-table flex-1 w-full ag-theme-alpine rounded-none">
        <AgGridReact
          ref={gridRef}
          rowData={[...stores, ...tempData]}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          getRowId={getRowId}
          enableCellTextSelection={true}
          ensureDomOrder={true}
          stopEditingWhenCellsLoseFocus={true}
          suppressRowHoverHighlight={false}
          domLayout="autoHeight"
          rowDragManaged={true}
          headerHeight={getResponsiveSize() === 'sm' ? 36 : 42}
          rowHeight={getResponsiveSize() === 'sm' ? 32 : 38}
        />
      </div>
      <div className="mt-2 sm:mt-4">
        <button
          className="sku-button bg-green-500 cursor-pointer text-gray-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded shadow-md flex items-center gap-2 text-sm sm:text-base"
          onClick={handleAddStore}>
          NEW STORE
        </button>
      </div>
    </div>
  );
};

export default StoresPage;
