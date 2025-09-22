import { configureStore } from "@reduxjs/toolkit";

import { chatReducer } from "@/lib/state/chat-slice";
import { conversationsReducer } from "@/lib/state/conversations-slice";

export const store = configureStore({
  reducer: {
    chat: chatReducer,
    conversations: conversationsReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
});

export type AppStore = typeof store;
export type AppDispatch = AppStore["dispatch"];
export type RootState = ReturnType<AppStore["getState"]>;
