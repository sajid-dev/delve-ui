import type { Message } from "@/types/message";

export type ConversationSummary = {
  conversationId: string;
  title: string;
  updatedAt?: string;
  messageCount?: number;
};

export type ConversationDetail = {
  conversationId: string;
  title?: string;
  messages: Message[];
};
