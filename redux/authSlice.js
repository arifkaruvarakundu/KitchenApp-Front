// redux/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isAuthenticated: false,  // Authentication state
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Action to set the user as authenticated
    setAuthenticated: (state, action) => {
      state.isAuthenticated = true;
    },
    
    // Action to set the user as not authenticated
    setNotAuthenticated: (state) => {
      state.isAuthenticated = false;
    },
  },
});

export const { setAuthenticated, setNotAuthenticated } = authSlice.actions;

export default authSlice.reducer;

