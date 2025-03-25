import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CalendarWeek } from './calendarSlice';

// Interfaces for planning data
export interface WeekData {
  weekId: string;
  salesUnits: number;
  salesDollars: number;
  gmDollars: number;
  gmPercent: number;
}

export interface PlanningItem {
  id: string;
  storeId: string;
  skuId: string;
  weeksData: { [weekId: string]: WeekData };
}

interface PlanningState {
  planningData: PlanningItem[];
}

// Load state from localStorage if available
const loadState = (): PlanningState => {
  try {
    const serializedState = localStorage.getItem('planning');
    if (serializedState === null) {
      return { planningData: [] };
    }
    const parsedState = JSON.parse(serializedState);
    return {
      planningData: parsedState.planningData || [],
    };
  } catch (err) {
    return { planningData: [] };
  }
};

const planningSlice = createSlice({
  name: 'planning',
  initialState: loadState(),
  reducers: {
    setPlanningData: (state, action: PayloadAction<PlanningItem[]>) => {
      state.planningData = action.payload;
      localStorage.setItem('planning', JSON.stringify(state));
    },
    updatePlanningItem: (
      state,
      action: PayloadAction<{
        storeId: string;
        skuId: string;
        weekId: string;
        salesUnits: number;
        price: number;
        cost: number;
      }>
    ) => {
      const { storeId, skuId, weekId, salesUnits, price, cost } =
        action.payload;

      // Find existing planning item or create new one
      let planningItem = state.planningData.find(
        (item: PlanningItem) => item.storeId === storeId && item.skuId === skuId
      );

      if (!planningItem) {
        planningItem = {
          id: `${storeId}-${skuId}`,
          storeId,
          skuId,
          weeksData: {},
        };
        state.planningData.push(planningItem);
      }

      // Calculate values
      const salesDollars = salesUnits * price;
      const gmDollars = salesDollars - salesUnits * cost;
      const gmPercent = salesDollars > 0 ? (gmDollars / salesDollars) * 100 : 0;

      // Update week data
      planningItem.weeksData[weekId] = {
        weekId,
        salesUnits,
        salesDollars,
        gmDollars,
        gmPercent,
      };

      localStorage.setItem('planning', JSON.stringify(state));
    },
    deletePlanningItem: (
      state,
      action: PayloadAction<{ storeId: string; skuId: string }>
    ) => {
      const { storeId, skuId } = action.payload;
      state.planningData = state.planningData.filter(
        (item: PlanningItem) =>
          !(item.storeId === storeId && item.skuId === skuId)
      );
      localStorage.setItem('planning', JSON.stringify(state));
    },
  },
});

export const { setPlanningData, updatePlanningItem, deletePlanningItem } =
  planningSlice.actions;
export default planningSlice.reducer;
