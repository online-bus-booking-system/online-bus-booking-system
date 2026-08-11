import { createSlice } from '@reduxjs/toolkit';

const token = localStorage.getItem('token') || '';
const savedUser = JSON.parse(localStorage.getItem('buslink_user') || 'null');
const savedRole = localStorage.getItem('buslink_role') || (savedUser ? savedUser.role : null);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    loginStatus: Boolean(token && savedUser),
    user: savedUser,
    role: savedRole,
    token: token
  },
  reducers: {
    loginAction: (state, { payload }) => {
      state.loginStatus = true;
      state.user = payload.user;
      state.role = payload.user?.role || payload.role || 'customer';
      state.token = payload.token;

      localStorage.setItem('buslink_login', 'true');
      localStorage.setItem('buslink_user', JSON.stringify(state.user));
      localStorage.setItem('buslink_role', state.role);
      localStorage.setItem('token', state.token);
    },
    updateProfileAction: (state, { payload }) => {
      if (state.user) {
        state.user = {
          ...state.user,
          name: payload.name || state.user.name,
          email: payload.email || state.user.email,
          gender: payload.gender || state.user.gender,
          phone: payload.phone || state.user.phone
        };
        localStorage.setItem('buslink_user', JSON.stringify(state.user));
      }
    },
    logoutAction: (state) => {
      state.loginStatus = false;
      state.user = null;
      state.role = null;
      state.token = '';
      localStorage.removeItem('buslink_login');
      localStorage.removeItem('buslink_user');
      localStorage.removeItem('buslink_role');
      localStorage.removeItem('token');
    },
    switchRoleAction: (state, { payload }) => {
      state.role = payload;
      localStorage.setItem('buslink_role', payload);
    }
  }
});

export default authSlice.reducer;
export const { loginAction, updateProfileAction, logoutAction, switchRoleAction } = authSlice.actions;
