import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface ToastState {
  id: string | null;
  visible: boolean;
  productName: string;
  imageUrl: string;
}

const initialState: ToastState = {
  id: null,
  visible: false,
  productName: '',
  imageUrl: '',
};

const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    showToast: (state, action: PayloadAction<{ productName: string; imageUrl: string }>) => {
      state.id = Math.random().toString(36).substring(2, 9);
      state.visible = true;
      state.productName = action.payload.productName;
      state.imageUrl = action.payload.imageUrl;
    },
    hideToast: (state) => {
      state.visible = false;
    },
  },
});

export const { showToast, hideToast } = toastSlice.actions;
export default toastSlice.reducer;
