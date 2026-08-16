import { createSlice } from '@reduxjs/toolkit';

const busSlice = createSlice({
  name: 'bus',
  initialState: {
    buses: [],
    routes: [],
    trips: [],
    searchParams: { source: 'Pune', destination: 'Mumbai', date: '' },
    selectedTrip: null,
    selectedSeats: [],
    boardingPoint: null,
    droppingPoint: null,
    passengers: [],
    contactEmail: '',
    contactPhone: ''
  },
  reducers: {
    setBusesAction: (state, { payload }) => {
      state.buses = payload;
    },
    setRoutesAction: (state, { payload }) => {
      state.routes = payload;
    },
    setTripsAction: (state, { payload }) => {
      state.trips = payload;
    },
    setSearchParamsAction: (state, { payload }) => {
      state.searchParams = payload;
    },
    setSelectedTripAction: (state, { payload }) => {
      state.selectedTrip = payload;
      state.selectedSeats = [];
      state.boardingPoint = null;
      state.droppingPoint = null;
      state.passengers = [];
      state.contactEmail = '';
      state.contactPhone = '';
    },
    setSelectedSeatsAction: (state, { payload }) => {
      state.selectedSeats = payload;
    },
    setBoardingDroppingAction: (state, { payload }) => {
      state.boardingPoint = payload.boardingPoint;
      state.droppingPoint = payload.droppingPoint;
    },
    setPassengersAction: (state, { payload }) => {
      state.passengers = payload;
    },
    setContactInfoAction: (state, { payload }) => {
      state.contactEmail = payload.contactEmail;
      state.contactPhone = payload.contactPhone;
    },
    addBusAction: (state, { payload }) => {
      state.buses.unshift(payload);
    },
    updateBusAction: (state, { payload }) => {
      const idx = state.buses.findIndex((b) => b.id === payload.id);
      if (idx !== -1) state.buses[idx] = { ...state.buses[idx], ...payload };
    },
    addRouteAction: (state, { payload }) => {
      state.routes.unshift(payload);
    },
    scheduleTripAction: (state, { payload }) => {
      state.trips.unshift(payload);
    }
  }
});

export default busSlice.reducer;
export const {
  setBusesAction,
  setRoutesAction,
  setTripsAction,
  setSearchParamsAction,
  setSelectedTripAction,
  setSelectedSeatsAction,
  setBoardingDroppingAction,
  setPassengersAction,
  setContactInfoAction,
  addBusAction,
  updateBusAction,
  addRouteAction,
  scheduleTripAction
} = busSlice.actions;
