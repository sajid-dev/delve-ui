"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  clearAllConversations,
  deleteConversation,
  loadConversations,
  setSelectedConversationId,
} from "@/lib/state/conversations-slice";
import { loadConversationMessages, resetChat } from "@/lib/state/chat-slice";
import { cn } from "@/lib/utils";

type SidebarProps = {
  isOpen: boolean;
};

const USER_ID = "jack";

export default function Sidebar({ isOpen }: SidebarProps) {
  const dispatch = useAppDispatch();
  const { items, status, selectedConversationId } = useAppSelector(
    (state) => state.conversations
  );
  const isNewConversationActive = !selectedConversationId;

  const handleSelectConversation = (conversationId: string) => {
    dispatch(setSelectedConversationId(conversationId));
    dispatch(loadConversationMessages({ conversationId, userId: USER_ID }));
  };

  const handleDeleteConversation = async (conversationId: string) => {
    const conversation = items.find(
      (item) => item.conversationId === conversationId
    );
    const displayTitle = conversation?.title ?? "this conversation";
    const shouldDelete = window.confirm(
      `Are you sure you want to delete "${displayTitle}"?`
    );
    if (!shouldDelete) {
      return;
    }

    try {
      await dispatch(deleteConversation({ conversationId, userId: USER_ID })).unwrap();
      if (selectedConversationId === conversationId) {
        dispatch(resetChat());
      }
    } catch (error) {
      console.error("Unable to delete conversation", error);
    }
  };

  const handleStartNewConversation = () => {
    dispatch(setSelectedConversationId(undefined));
    dispatch(resetChat());
    dispatch(loadConversations(USER_ID));
  };

  const handleClearAllConversations = async () => {
    if (items.length === 0) return;
    const shouldClear = window.confirm(
      "Are you sure you want to delete all conversations? This action cannot be undone."
    );
    if (!shouldClear) return;

    try {
      await dispatch(clearAllConversations(USER_ID)).unwrap();
      dispatch(resetChat());
    } catch (error) {
      console.error("Unable to clear conversations", error);
    }
  };

  useEffect(() => {
    if (isOpen && status === "idle" && items.length === 0) {
      dispatch(loadConversations(USER_ID));
    }
  }, [dispatch, isOpen, status, items.length]);

  return (
    <aside
      className={cn(
        "fixed left-0 top-20 bottom-0 z-40 w-72 border-r border-border bg-muted shadow-sm transition-transform duration-300",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div
        className={cn(
          "flex h-full flex-col gap-4 overflow-hidden p-4 transition-opacity duration-200",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      >
        <div className="flex h-full flex-1 flex-col overflow-hidden">
          <div className="flex h-full flex-col gap-4 overflow-hidden px-6 py-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Conversations
              </p>
              <p className="text-xs text-muted-foreground/80">
                Jump back into a recent thread
              </p>
            </div>
            <Button
              type="button"
              variant={isNewConversationActive ? "secondary" : "outline"}
              className="h-9 justify-start text-left text-sm"
              onClick={handleStartNewConversation}
            >
              Start new conversation
            </Button>
            <ScrollArea className="flex-1 pr-2">
              <div className="space-y-1">
                {status === "loading" && items.length > 0 && (
                  <p className="text-xs text-muted-foreground">Loading conversations…</p>
                )}
                {status !== "loading" && items.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    No conversations available.
                  </p>
                )}
                {items.map((conversation) => {
                  const isActive =
                    conversation.conversationId === selectedConversationId;
                  return (
                    <div
                      key={conversation.conversationId}
                      className="flex items-center gap-1"
                    >
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        className="h-9 flex-1 justify-start text-left text-sm font-medium"
                        onClick={() => handleSelectConversation(conversation.conversationId)}
                      >
                        <span className="truncate">{conversation.title}</span>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleDeleteConversation(conversation.conversationId);
                        }}
                        aria-label="Delete conversation"
                      >
                        <span aria-hidden>🗑</span>
                      </Button>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
            <Button
              type="button"
              variant="outline"
              className="mt-2 w-full text-xs"
              onClick={handleClearAllConversations}
              disabled={items.length === 0}
            >
              Clear all conversations
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
