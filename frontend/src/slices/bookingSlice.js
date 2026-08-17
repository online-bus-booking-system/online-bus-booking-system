import { createSlice } from '@reduxjs/toolkit';

const bookingSlice = createSlice({
  name: 'booking',
  initialState: {
    bookings: [],
    activeTicket: null
  },
  reducers: {
    setBookingsAction: (state, { payload }) => {
      state.bookings = payload;
    },
    addBookingAction: (state, { payload }) => {
      state.bookings.unshift(payload);
      state.activeTicket = payload;
    },
    cancelBookingAction: (state, { payload }) => {
      const idx = state.bookings.findIndex((b) => b.id === payload || b.pnrNumber === payload);
      if (idx !== -1) {
        state.bookings[idx].bookingStatus = 'CANCELLED';
      }
    },
    setActiveTicketAction: (state, { payload }) => {
      state.activeTicket = payload;
    }
  }
});

export default bookingSlice.reducer;
export const { setBookingsAction, addBookingAction, cancelBookingAction, setActiveTicketAction } = bookingSlice.actions;
