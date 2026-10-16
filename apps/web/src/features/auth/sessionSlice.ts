import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  organizationId: string;
};
type SessionState = {
  accessToken: string | null;
  user: SessionUser | null;
};
const initialState: SessionState = { accessToken: null, user: null };
const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    signedIn(
      state,
      action: PayloadAction<{
        accessToken: string;
        user: SessionUser;
      }>,
    ) {
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user;
    },
    signedOut(state) {
      state.accessToken = null;
      state.user = null;
    },
  },
});
export const { signedIn, signedOut } = sessionSlice.actions;
export default sessionSlice.reducer;
