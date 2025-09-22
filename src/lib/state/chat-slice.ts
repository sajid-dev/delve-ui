import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

import { fetchConversationDetail, sendMessage } from "@/lib/api";
import type { Message } from "@/types/message";

export type ChatState = {
  messages: Message[];
  status: "idle" | "loading";
  error?: string;
  conversationId?: string;
};

const initialState: ChatState = {
  messages: [],
  status: "idle",
  conversationId: undefined,
};

export const sendChatMessage = createAsyncThunk<
  { messages: Message[]; conversationId?: string },
  string,
  { state: { chat: ChatState }; rejectValue: string }
>("chat/sendMessage", async (prompt, thunkApi) => {
    try {
      const conversationId = thunkApi.getState().chat.conversationId;
      const result = await sendMessage(prompt, conversationId);
      return result;
    } catch (error) {
      return thunkApi.rejectWithValue(
        error instanceof Error ? error.message : "Failed to reach assistant"
      );
    }
  });

export const loadConversationMessages = createAsyncThunk<
  { conversationId: string; messages: Message[] },
  { conversationId: string; userId: string },
  { rejectValue: string }
>("chat/loadConversationMessages", async ({ conversationId, userId }, thunkApi) => {
  try {
    const detail = await fetchConversationDetail(conversationId, userId);
    return { conversationId: detail.conversationId, messages: detail.messages };
  } catch (error) {
    return thunkApi.rejectWithValue(
      error instanceof Error ? error.message : "Failed to load conversation"
    );
  }
});

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    addMessage(state, action: PayloadAction<Message>) {
      state.messages.push(action.payload);
    },
    resetChat(state) {
      state.messages = [];
      state.error = undefined;
      state.status = "idle";
      state.conversationId = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendChatMessage.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.status = "idle";
        state.conversationId =
          action.payload.conversationId ?? state.conversationId;
        state.messages.push(...action.payload.messages);
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.status = "idle";
        state.error = action.payload as string | undefined;
        const errorMessage: Message = {
          role: "ai",
          type: "alert",
          content: {
            level: "error",
            message:
              action.payload ??
              "Something went wrong while contacting the assistant.",
          },
        };
        state.messages.push(errorMessage);
      })
      .addCase(loadConversationMessages.pending, (state, action) => {
        state.status = "loading";
        state.error = undefined;
        state.conversationId = action.meta.arg.conversationId;
        state.messages = [];
      })
      .addCase(loadConversationMessages.fulfilled, (state, action) => {
        state.status = "idle";
        state.conversationId = action.payload.conversationId;
        state.messages = action.payload.messages;
      })
      .addCase(loadConversationMessages.rejected, (state, action) => {
        state.status = "idle";
        state.error = action.payload as string | undefined;
        const errorMessage: Message = {
          role: "ai",
          type: "alert",
          content: {
            level: "error",
            message:
              action.payload ??
              "We couldn’t load that conversation. Please try again.",
          },
        };
        state.messages = [errorMessage];
      });
  },
});

export const { addMessage, resetChat } = chatSlice.actions;
export const chatReducer = chatSlice.reducer;
