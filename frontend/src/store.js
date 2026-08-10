import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import busSlice from './slices/busSlice';
import bookingSlice from './slices/bookingSlice';
import adminSlice from './slices/adminSlice';

const store = configureStore({
  reducer: {
    auth: authSlice,
    bus: busSlice,
    booking: bookingSlice,
    admin: adminSlice
  }
});

export default store;
