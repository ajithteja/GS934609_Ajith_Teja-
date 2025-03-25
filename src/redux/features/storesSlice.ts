import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface BaseStoreInterface {
  name: string;
  city: string;
  state: string;
}

export interface PermanentStore extends BaseStoreInterface {
  id: string;
}

export interface TempStore extends BaseStoreInterface {
  tempId: string;
}

export type StoreInterface = PermanentStore | TempStore;

interface StoresState {
  stores: PermanentStore[];
}

// Load initial state from localStorage if available
const loadInitialState = (): StoresState => {
  try {
    const savedStores = localStorage.getItem('stores');
    if (savedStores) {
      return JSON.parse(savedStores);
    }
  } catch (error) {
    console.error('Error loading stores from localStorage:', error);
  }
  return { stores: [] };
};

const initialState: StoresState = loadInitialState();

const storesSlice = createSlice({
  name: 'stores',
  initialState,
  reducers: {
    setStores: (state, action: PayloadAction<PermanentStore[]>) => {
      state.stores = action.payload;
      // Save to localStorage
      localStorage.setItem(
        'stores',
        JSON.stringify({ stores: action.payload })
      );
    },
    addStore: (state, action: PayloadAction<PermanentStore>) => {
      state.stores.push(action.payload);
      // Save to localStorage
      localStorage.setItem('stores', JSON.stringify({ stores: state.stores }));
    },
    updateStore: (state, action: PayloadAction<PermanentStore>) => {
      const index = state.stores.findIndex(
        (store) => store.id === action.payload.id
      );
      if (index !== -1) {
        state.stores[index] = action.payload;
        // Save to localStorage
        localStorage.setItem(
          'stores',
          JSON.stringify({ stores: state.stores })
        );
      }
    },
    deleteStore: (state, action: PayloadAction<string>) => {
      state.stores = state.stores.filter(
        (store) => store.id !== action.payload
      );
      // Save to localStorage
      localStorage.setItem('stores', JSON.stringify({ stores: state.stores }));
    },
  },
});

export const { setStores, addStore, updateStore, deleteStore } =
  storesSlice.actions;

export default storesSlice.reducer;
