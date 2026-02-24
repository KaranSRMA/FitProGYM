import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

// Async backend verification
export const verifyAuth = createAsyncThunk(
  "auth/verifyAuth",
  async (_, thunkAPI) => {
    try {
      const res = await axios.post(`${BASE_URL}/auth/tokenVerification`, null, {
        withCredentials: true,
      });

      return res.data ?? { valid: false, role: 'user', is_active: false, 'user_id':null};
    } catch {
      return thunkAPI.rejectWithValue(false);
    }
  }
);

const authSlice = createSlice({
  name: "auth",

  initialState: {
    loggedIn: false,
    role:'user',
    is_active:false,
    user_id:null
  },

  reducers: {
    logout(state) {
      state.loggedIn = false;
      state.role = 'user';
      state.is_active = false;
      state.user_id = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(verifyAuth.fulfilled, (state, action) => {
        const {valid, role, is_active, user_id} = action.payload;
        state.loggedIn = !!valid;
        state.role = role;
        state.is_active = is_active;
        state.user_id = user_id;
      })
      .addCase(verifyAuth.rejected, (state) => {
        state.loggedIn = false;
        state.role = 'user';
        state.is_active = false;
        state.user_id = null;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
