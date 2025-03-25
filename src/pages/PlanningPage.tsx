import {
  ColDef,
  ColGroupDef,
  CellValueChangedEvent,
  CellClassParams,
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { useRef, useMemo, useState, useEffect } from 'react';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { RootState } from '../redux/store';
import { updatePlanningItem } from '../redux/features/planningSlice';
import { PermanentSKU } from '../redux/features/skusSlice';
import { PermanentStore } from '../redux/features/storesSlice';
import { CalendarWeek } from '../redux/features/calendarSlice';
import '../styles/global.css';

interface PlanningRowData {
  id: string;
  storeId: string;
  storeName: string;
  skuId: string;
  skuName: string;
  price: number;
  cost: number;
  [key: string]: any; // For dynamic week columns
}

const Planning = () => {
  const dispatch = useAppDispatch();
  const { planningData } = useAppSelector((state: RootState) => state.planning);
  const { weeks } = useAppSelector((state: RootState) => state.calendar);
  const { skus } = useAppSelector((state: RootState) => state.skus);
  const { stores } = useAppSelector((state: RootState) => state.stores);
  const gridRef = useRef<AgGridReact>(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getResponsiveSize = () => {
    if (windowWidth < 640) return 'sm';
    if (windowWidth < 768) return 'md';
    return 'lg';
  };

  const getResponsiveColumnSizes = () => {
    const size = getResponsiveSize();
    return {
      store: size === 'sm' ? 150 : size === 'md' ? 180 : 200,
      sku: size === 'sm' ? 180 : size === 'md' ? 220 : 250,
      week: size === 'sm' ? 100 : size === 'md' ? 110 : 120,
      headerHeight: size === 'sm' ? 36 : size === 'md' ? 40 : 42,
      rowHeight: size === 'sm' ? 32 : size === 'md' ? 36 : 38,
    };
  };

  // Create row data by cross joining stores and SKUs
  const rowData = useMemo(() => {
    const rows: PlanningRowData[] = [];
    stores.forEach((store: PermanentStore) => {
      skus.forEach((sku: PermanentSKU) => {
        const planningItem = planningData.find(
          (item: { storeId: string; skuId: string }) =>
            item.storeId === store.id && item.skuId === sku.id
        );

        const row: PlanningRowData = {
          id: `${store.id}-${sku.id}`,
          storeId: store.id,
          storeName: store.name,
          skuId: sku.id,
          skuName: sku.sku,
          price: sku.price,
          cost: sku.cost,
        };

        // Add week data
        weeks.forEach((week: CalendarWeek) => {
          const weekData = planningItem?.weeksData[week.week] || {
            salesUnits: 0,
            salesDollars: 0,
            gmDollars: 0,
            gmPercent: 0,
          };

          row[`${week.week}_salesUnits`] = weekData.salesUnits;
          row[`${week.week}_salesDollars`] = weekData.salesDollars;
          row[`${week.week}_gmDollars`] = weekData.gmDollars;
          row[`${week.week}_gmPercent`] = weekData.gmPercent;
        });

        rows.push(row);
      });
    });
    return rows;
  }, [stores, skus, planningData, weeks]);

  const onCellValueChanged = (params: CellValueChangedEvent) => {
    if (!params.data || !params.column || isNaN(Number(params.newValue)))
      return;

    const field = params.column.getColId();
    if (field.includes('_salesUnits')) {
      const weekId = field.split('_')[0];
      const { storeId, skuId, price, cost } = params.data;
      const salesUnits = Number(params.newValue);

      dispatch(
        updatePlanningItem({
          storeId,
          skuId,
          weekId,
          salesUnits,
          price,
          cost,
        })
      );
    }
  };

  const gmPercentCellStyle = (params: CellClassParams) => {
    const value = Number(params.value);
    if (value >= 40)
      return { backgroundColor: 'hsl(122.55deg 40.87% 45.1%)', color: 'white' };
    if (value >= 10)
      return { backgroundColor: 'hsl(48deg 95.83% 52.94%)', color: 'black' };
    if (value > 5)
      return { backgroundColor: 'hsl(27.02deg 95.98% 60.98%)', color: 'black' };
    return { backgroundColor: 'hsl(0deg 95.65% 81.96%)', color: 'white' };
  };

  const columnSizes = getResponsiveColumnSizes();

  const columnDefs = useMemo<(ColDef | ColGroupDef)[]>(
    () => [
      {
        headerName: 'Store',
        field: 'storeName',
        headerClass: 'ag-header-responsive custom-header',
        pinned: 'left',
        width: columnSizes.store,
        editable: false,
      },
      {
        headerName: 'SKU',
        field: 'skuName',
        pinned: 'left',
        headerClass: 'ag-header-responsive custom-header',
        width: columnSizes.sku,
        editable: false,
      },
      ...weeks.reduce<ColGroupDef[]>(
        (acc: ColGroupDef[], week: CalendarWeek) => {
          const monthGroup = acc.find(
            (group: ColGroupDef) => group.headerName === week.monthLabel
          );
          const weekColumns: ColDef[] = [
            {
              headerName: 'Sales Units',
              field: `${week.week}_salesUnits`,
              width: columnSizes.week,
              headerClass: 'ag-header-responsive custom-header',
              cellClass: 'ag-cell-responsive',
              editable: true,
              type: 'numericColumn',
            },
            {
              headerName: 'Sales Dollars',
              field: `${week.week}_salesDollars`,
              headerClass: 'ag-header-responsive custom-header',
              cellClass: 'ag-cell-responsive',
              valueFormatter: (p) =>
                p.value != null ? `$${p.value.toFixed(2)}` : '$0.00',
              width: columnSizes.week,
              editable: false,
              type: 'numericColumn',
            },
            {
              headerName: 'GM Dollars',
              field: `${week.week}_gmDollars`,
              headerClass: 'ag-header-responsive custom-header',
              cellClass: 'ag-cell-responsive',
              valueFormatter: (p) =>
                p.value != null ? `$${p.value.toFixed(2)}` : '$0.00',
              width: columnSizes.week,
              editable: false,
              type: 'numericColumn',
            },
            {
              headerName: 'GM Percent',
              field: `${week.week}_gmPercent`,
              headerClass: 'ag-header-responsive custom-header',
              cellClass: 'ag-cell-responsive',
              valueFormatter: (p) =>
                p.value != null ? `${p.value.toFixed(2)}%` : '0.00%',
              width: columnSizes.week,
              editable: false,
              cellStyle: gmPercentCellStyle,
              type: 'numericColumn',
            },
          ];

          if (monthGroup) {
            monthGroup.children.push({
              headerName: week.weekLabel,
              headerClass: 'ag-header-responsive custom-header',
              children: weekColumns,
            });
          } else {
            acc.push({
              headerName: week.monthLabel,
              headerClass: 'ag-header-responsive custom-header',
              children: [
                {
                  headerName: week.weekLabel,
                  headerClass: 'ag-header-responsive custom-header',
                  children: weekColumns,
                },
              ],
            });
          }

          return acc;
        },
        []
      ),
    ],
    [weeks, columnSizes]
  );

  const defaultColDef = useMemo(
    () => ({
      resizable: true,
      sortable: true,
    }),
    []
  );

  return (
    <div className="sku-container sku-table ag-theme-alpine rounded-none">
      <AgGridReact
        ref={gridRef}
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        onCellValueChanged={onCellValueChanged}
        getRowId={(params) => params.data.id}
        animateRows={true}
        headerHeight={columnSizes.headerHeight}
        rowHeight={columnSizes.rowHeight}
      />
    </div>
  );
};

export default Planning;
