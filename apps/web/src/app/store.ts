import { configureStore } from "@reduxjs/toolkit";
import sessionReducer from "../features/auth/sessionSlice";
import { logisticsApi } from "../features/api/logisticsApi";
export const store = configureStore({
  reducer: {
    session: sessionReducer,
    [logisticsApi.reducerPath]: logisticsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(logisticsApi.middleware),
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
