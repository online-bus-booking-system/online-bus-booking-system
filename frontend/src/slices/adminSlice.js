import { createSlice } from '@reduxjs/toolkit';

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    operators: []
  },
  reducers: {
    setOperatorsAction: (state, { payload }) => {
      state.operators = payload;
    },
    approveOperatorAction: (state, { payload }) => {
      const op = state.operators.find((o) => o.id === payload);
      if (op) {
        op.registrationStatus = 'APPROVED';
        op.status = 'ACTIVE';
      }
    },
    rejectOperatorAction: (state, { payload }) => {
      const op = state.operators.find((o) => o.id === payload);
      if (op) {
        op.registrationStatus = 'REJECTED';
        op.status = 'INACTIVE';
      }
    },
    toggleOperatorStatusAction: (state, { payload }) => {
      const op = state.operators.find((o) => o.id === payload);
      if (op) {
        op.status = op.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      }
    }
  }
});

export default adminSlice.reducer;
export const { setOperatorsAction, approveOperatorAction, rejectOperatorAction, toggleOperatorStatusAction } = adminSlice.actions;
