import { configureStore } from '@reduxjs/toolkit';
import storesReducer from './features/storesSlice';
import skusReducer from './features/skusSlice';
import planningReducer from './features/planningSlice';
import calendarReducer from './features/calendarSlice';

export const store = configureStore({
  reducer: {
    stores: storesReducer,
    skus: skusReducer,
    planning: planningReducer,
    calendar: calendarReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
