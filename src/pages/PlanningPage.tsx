import {
  ColDef,
  ColGroupDef,
  CellValueChangedEvent,
  CellClassParams,
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { useRef, useMemo } from 'react';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { RootState } from '../redux/store';
import { updatePlanningItem } from '../redux/features/planningSlice';
import { PermanentSKU } from '../redux/features/skusSlice';
import { PermanentStore } from '../redux/features/storesSlice';
import { CalendarWeek } from '../redux/features/calendarSlice';

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

  const columnDefs = useMemo<(ColDef | ColGroupDef)[]>(
    () => [
      {
        headerName: 'Store',
        field: 'storeName',
        headerClass: 'custom-header',
        pinned: 'left',
        width: 200,
        editable: false,
      },
      {
        headerName: 'SKU',
        field: 'skuName',
        pinned: 'left',
        headerClass: 'custom-header',
        width: 250,
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
              width: 120,
              headerClass: 'custom-header',
              editable: true,
              type: 'numericColumn',
            },
            {
              headerName: 'Sales Dollars',
              field: `${week.week}_salesDollars`,
              headerClass: 'custom-header',
              valueFormatter: (p) =>
                p.value != null ? `$${p.value.toFixed(2)}` : '$0.00',
              width: 120,
              editable: false,
              type: 'numericColumn',
            },
            {
              headerName: 'GM Dollars',
              field: `${week.week}_gmDollars`,
              headerClass: 'custom-header',
              valueFormatter: (p) =>
                p.value != null ? `$${p.value.toFixed(2)}` : '$0.00',
              width: 120,
              editable: false,
              type: 'numericColumn',
            },
            {
              headerName: 'GM Percent',
              field: `${week.week}_gmPercent`,
              headerClass: 'custom-header',
              valueFormatter: (p) =>
                p.value != null ? `${p.value.toFixed(2)}%` : '0.00%',
              width: 100,
              editable: false,
              cellStyle: gmPercentCellStyle,
              type: 'numericColumn',
            },
          ];

          if (monthGroup) {
            monthGroup.children.push({
              headerName: week.weekLabel,
              headerClass: 'custom-header',
              children: weekColumns,
            });
          } else {
            acc.push({
              headerName: week.monthLabel,
              headerClass: 'custom-header',
              children: [
                {
                  headerName: week.weekLabel,
                  headerClass: 'custom-header',
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
    [weeks]
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
      />
    </div>
  );
};

export default Planning;
