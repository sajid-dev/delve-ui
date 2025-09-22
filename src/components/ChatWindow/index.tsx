"use client";

import { useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { addMessage, sendChatMessage } from "@/lib/state/chat-slice";
import { cn } from "@/lib/utils";
import type { Message } from "@/types/message";
import MessageRenderer from "../MessageRenderer";
import { ThinkingIndicator } from "../ThinkingIndicator";

type ChatWindowProps = {
  isBackendOnline?: boolean;
};

export default function ChatWindow({ isBackendOnline = true }: ChatWindowProps) {
  const dispatch = useAppDispatch();
  const messages = useAppSelector((state) => state.chat.messages);
  const status = useAppSelector((state) => state.chat.status);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input.trim() || status === "loading" || !isBackendOnline) return;

    const userMessage: Message = {
      role: "user",
      type: "text",
      content: input.trim(),
    };

    dispatch(addMessage(userMessage));
    setInput("");

    dispatch(sendChatMessage(userMessage.content));
  };

  const composerDisabled = status === "loading" || !isBackendOnline;

  return (
    <div className="flex h-full w-full flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <div className="space-y-1.5 pb-24">
            {messages.map((message, index) => {
              const isUser = message.role === "user";
              return (
                <div
                  key={`${message.role}-${index}`}
                  className={cn(
                    "flex w-full",
                    isUser ? "justify-end" : "justify-start"
                  )}
                >
                  {isUser ? (
                    <div className="max-w-[85%] rounded-lg border border-primary/60 bg-primary text-primary-foreground shadow-sm sm:max-w-[70%]">
                      <div className="px-2.5 py-1.5 text-sm">
                        <MessageRenderer message={message} />
                      </div>
                    </div>
                  ) : (
                    <div className="w-full text-sm text-foreground">
                      <MessageRenderer message={message} />
                    </div>
                  )}
                </div>
              );
            })}
          {status === "loading" && <ThinkingIndicator />}
        </div>
      </div>
      <div className="sticky bottom-0 z-10 flex flex-col gap-3 border-t border-border bg-card/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-card/90">
        {!isBackendOnline && (
          <Alert variant="warning" className="w-full">
            <AlertTitle>LLM backend is offline</AlertTitle>
            <AlertDescription>
              The backend is currently unavailable. Try again once it is online.
            </AlertDescription>
          </Alert>
        )}
        <div className="flex w-full items-end gap-2">
          <Textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask the assistant anything…"
            disabled={composerDisabled}
            className="min-h-[48px] flex-1 resize-none"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleSend}
            disabled={composerDisabled}
            aria-label="Send message"
            className="h-11 w-11 rounded-full border border-transparent bg-primary/10 text-primary hover:bg-primary/20"
          >
            <span className="text-lg leading-none">➤</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
