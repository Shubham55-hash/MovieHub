import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AppState {
  isHydrated: boolean;
  isOnline: boolean;
}

const initialState: AppState = {
  isHydrated: false,
  isOnline: true,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setHydrated: (state, action: PayloadAction<boolean>) => {
      state.isHydrated = action.payload;
    },
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },
  },
});

export const { setHydrated, setOnlineStatus } = appSlice.actions;
export default appSlice.reducer;
