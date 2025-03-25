import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Base interface for SKU data
export interface BaseSKUInterface {
  sku: string;
  price: number;
  cost: number;
}

// Interface for permanent SKUs (with id)
export interface PermanentSKU extends BaseSKUInterface {
  id: string;
}

// Interface for temporary SKUs (with tempId)
export interface TempSKU extends BaseSKUInterface {
  tempId: string;
}

// State interface
interface SKUsState {
  skus: PermanentSKU[];
}

// Initial state
const initialState: SKUsState = {
  skus: [],
};

// Load state from localStorage if available
const loadState = () => {
  try {
    const serializedState = localStorage.getItem('skus');
    if (serializedState === null) {
      return initialState;
    }
    return { skus: JSON.parse(serializedState) };
  } catch (err) {
    return initialState;
  }
};

// Create the slice
const skusSlice = createSlice({
  name: 'skus',
  initialState: loadState(),
  reducers: {
    setSKUs: (state, action: PayloadAction<PermanentSKU[]>) => {
      state.skus = action.payload;
      localStorage.setItem('skus', JSON.stringify(action.payload));
    },
    addSKU: (state, action: PayloadAction<PermanentSKU>) => {
      state.skus.push(action.payload);
      localStorage.setItem('skus', JSON.stringify(state.skus));
    },
    updateSKU: (state, action: PayloadAction<PermanentSKU>) => {
      const index = state.skus.findIndex(
        (sku: any) => sku.id === action.payload.id
      );
      if (index !== -1) {
        state.skus[index] = action.payload;
        localStorage.setItem('skus', JSON.stringify(state.skus));
      }
    },
    deleteSKU: (state, action: PayloadAction<string>) => {
      state.skus = state.skus.filter((sku: any) => sku.id !== action.payload);
      localStorage.setItem('skus', JSON.stringify(state.skus));
    },
  },
});

// Export actions and reducer
export const { setSKUs, addSKU, updateSKU, deleteSKU } = skusSlice.actions;
export default skusSlice.reducer;
