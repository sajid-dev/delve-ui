import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

import {
  clearSessions,
  deleteSession,
  fetchConversations,
} from "@/lib/api";
import type { ConversationSummary } from "@/types/conversation";

export type ConversationsState = {
  items: ConversationSummary[];
  status: "idle" | "loading" | "error";
  error?: string;
  selectedConversationId?: string;
};

const initialState: ConversationsState = {
  items: [],
  status: "idle",
  selectedConversationId: undefined,
};

export const loadConversations = createAsyncThunk<
  ConversationSummary[],
  string,
  { rejectValue: string }
>("conversations/load", async (userId, thunkApi) => {
  try {
    return await fetchConversations(userId);
  } catch (error) {
    return thunkApi.rejectWithValue(
      error instanceof Error ? error.message : "Failed to load conversations"
    );
  }
});

export const deleteConversation = createAsyncThunk<
  string,
  { conversationId: string; userId: string },
  { rejectValue: string }
>("conversations/delete", async ({ conversationId, userId }, thunkApi) => {
  try {
    await deleteSession(conversationId, userId);
    return conversationId;
  } catch (error) {
    return thunkApi.rejectWithValue(
      error instanceof Error ? error.message : "Failed to delete conversation"
    );
  }
});

export const clearAllConversations = createAsyncThunk<
  void,
  string,
  { rejectValue: string }
>("conversations/clearAll", async (userId, thunkApi) => {
  try {
    await clearSessions(userId);
  } catch (error) {
    return thunkApi.rejectWithValue(
      error instanceof Error ? error.message : "Failed to clear conversations"
    );
  }
});

const conversationsSlice = createSlice({
  name: "conversations",
  initialState,
  reducers: {
    setSelectedConversationId(state, action: PayloadAction<string | undefined>) {
      state.selectedConversationId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadConversations.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(loadConversations.fulfilled, (state, action) => {
        state.status = "idle";
        state.items = action.payload;
      })
      .addCase(loadConversations.rejected, (state, action) => {
        state.status = "error";
        state.error = action.payload;
        state.items = [];
      })
      .addCase(deleteConversation.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (item) => item.conversationId !== action.payload
        );
        if (state.selectedConversationId === action.payload) {
          state.selectedConversationId = undefined;
        }
      })
      .addCase(deleteConversation.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(clearAllConversations.fulfilled, (state) => {
        state.items = [];
        state.selectedConversationId = undefined;
      })
      .addCase(clearAllConversations.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { setSelectedConversationId } = conversationsSlice.actions;
export const conversationsReducer = conversationsSlice.reducer;
