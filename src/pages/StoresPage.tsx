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

ModuleRegistry.registerModules([ClientSideRowModelModule, AllCommunityModule]);

const StoresPage = () => {
  const dispatch = useAppDispatch();
  const { stores } = useAppSelector((state: RootState) => state.stores);
  const [tempData, setTempData] = useState<TempStore[]>([]);
  const gridRef = useRef<AgGridReact<PermanentStore | TempStore>>(null);

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

  const valueSetter = (params: ValueSetterParams) => {
    const field = params.column.getColId();
    const newValue = params.newValue;
    const data = { ...params.data };
    data[field] = newValue;

    if (data.id) {
      dispatch(updateStore(data));
    } else if (data.name?.trim() !== '') {
      const newStore = { ...data, id: uuidv4() };
      delete newStore.tempId;
      dispatch(addStore(newStore));
      setTempData((prev) =>
        prev.filter((store) => store.tempId !== data.tempId)
      );
    } else {
      setTempData((prev) =>
        prev.map((store) => (store.tempId === data.tempId ? data : store))
      );
    }
    return true;
  };

  const columnDefs = useMemo<ColDef<PermanentStore | TempStore>[]>(
    () => [
      {
        headerName: '',
        cellRenderer: (params: { data?: PermanentStore | TempStore }) =>
          params.data ? (
            <button
              className="px-4 py-2 rounded bg-transparent text-gray-700 p-0 m-0 flex items-center justify-center cursor-pointer"
              onClick={() => {
                if (params.data) {
                  handleDelete(
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
        headerName: 'S.No',
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
        width: 90,
        cellClass: 'border-right',
        headerClass: 'border-right custom-header',
      },
      {
        headerName: 'Store Name',
        field: 'name',
        headerClass: 'custom-header',
        editable: true,
        valueSetter: (params: {
          data?: PermanentStore | TempStore;
          newValue: string;
        }) => {
          if (!params.data) return false;
          const newValue = params.newValue;
          const data = { ...params.data };

          if ('id' in data) {
            const updatedStore: PermanentStore = {
              ...data,
              name: newValue,
            };
            dispatch(updateStore(updatedStore));
          } else if ('tempId' in data) {
            const updatedTemp: TempStore = {
              ...data,
              name: newValue,
            };
            if (updatedTemp.name.trim() !== '') {
              const newStore: PermanentStore = {
                id: uuidv4(),
                name: updatedTemp.name,
                city: updatedTemp.city,
                state: updatedTemp.state,
              };
              dispatch(addStore(newStore));
              setTempData((prev) =>
                prev.filter((store) => store.tempId !== updatedTemp.tempId)
              );
            } else {
              setTempData((prev) =>
                prev.map((store) =>
                  store.tempId === updatedTemp.tempId ? updatedTemp : store
                )
              );
            }
          }
          return true;
        },
      },
      {
        headerName: 'City',
        field: 'city',
        headerClass: 'custom-header',
        editable: true,
        valueSetter: (params: {
          data?: PermanentStore | TempStore;
          newValue: string;
        }) => {
          if (!params.data) return false;
          const newValue = params.newValue;
          const data = { ...params.data };

          if ('id' in data) {
            const updatedStore: PermanentStore = {
              ...data,
              city: newValue,
            };
            dispatch(updateStore(updatedStore));
          } else if ('tempId' in data) {
            const updatedTemp: TempStore = {
              ...data,
              city: newValue,
            };
            setTempData((prev) =>
              prev.map((store) =>
                store.tempId === updatedTemp.tempId ? updatedTemp : store
              )
            );
          }
          return true;
        },
      },
      {
        headerName: 'State',
        field: 'state',
        headerClass: 'custom-header',
        editable: true,
        valueSetter: (params: {
          data?: PermanentStore | TempStore;
          newValue: string;
        }) => {
          if (!params.data) return false;
          const newValue = params.newValue;
          const data = { ...params.data };

          if ('id' in data) {
            const updatedStore: PermanentStore = {
              ...data,
              state: newValue,
            };
            dispatch(updateStore(updatedStore));
          } else if ('tempId' in data) {
            const updatedTemp: TempStore = {
              ...data,
              state: newValue,
            };
            setTempData((prev) =>
              prev.map((store) =>
                store.tempId === updatedTemp.tempId ? updatedTemp : store
              )
            );
          }
          return true;
        },
      },
    ],
    [dispatch, stores, tempData, setTempData]
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

  const defaultColDef = useMemo(
    () => ({
      editable: false,
      sortable: true,
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

  return (
    <div className="sku-container">
      <div className="sku-table ag-theme-alpine rounded-none">
        <AgGridReact
          ref={gridRef}
          rowData={[...stores, ...tempData]}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          getRowId={getRowId}
          enableCellTextSelection={true}
          ensureDomOrder={true}
          stopEditingWhenCellsLoseFocus={true}
        />
      </div>
      <button
        className="sku-button bg-green-500 cursor-pointer text-gray-800 px-4 py-2 mt-4 rounded shadow-md flex items-center gap-2"
        onClick={handleAddStore}>
        NEW STORE
      </button>
    </div>
  );
};

export default StoresPage;
