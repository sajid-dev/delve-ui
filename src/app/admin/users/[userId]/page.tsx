"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fetchAdminUserConversations } from "@/lib/api";
import type { AdminSessionSummary } from "@/types/admin";

export default function AdminUserMetricsPage() {
  const params = useParams<{ userId?: string }>();
  const userIdRaw = params?.userId;
  const userId = useMemo(
    () => (Array.isArray(userIdRaw) ? userIdRaw[0] : userIdRaw) ?? "",
    [userIdRaw]
  );

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState<AdminSessionSummary[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  useEffect(() => {
    if (!userId) return;

    const loadConversations = async () => {
      setStatus("loading");
      setErrorMessage(undefined);

      try {
        const data = await fetchAdminUserConversations(userId);
        setConversations(data);
        setStatus("idle");
      } catch (error) {
        console.error("Failed to load admin user conversations", error);
        setStatus("error");
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load user conversations."
        );
      }
    };

    loadConversations();
  }, [userId]);

  const totalTokens = useMemo(
    () => conversations.reduce((sum, item) => sum + item.tokens_used, 0),
    [conversations]
  );

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <Navbar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((previous) => !previous)}
      />
      <main className="flex-1 overflow-y-auto bg-background pt-20">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-8">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="sm" variant="outline">
                <Link href="/admin">Back to admin dashboard</Link>
              </Button>
              <h1 className="text-2xl font-semibold text-foreground">
                User metrics
              </h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Reviewing conversations for <span className="font-medium text-foreground">{userId}</span>.
            </p>
          </div>

          {status === "loading" && (
            <p className="text-sm text-muted-foreground">Loading conversations…</p>
          )}
          {status === "error" && (
            <p className="text-sm text-destructive">
              {errorMessage || "Unable to load user conversations."}
            </p>
          )}

          {status !== "loading" && conversations.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2">
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">
                    Conversations
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-semibold text-foreground">
                  {conversations.length}
                </CardContent>
              </Card>
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">
                    Total tokens used
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-semibold text-foreground">
                  {totalTokens}
                </CardContent>
              </Card>
            </div>
          )}

          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-foreground">
                Conversation history
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              {status === "loading" && conversations.length === 0 ? (
                <p className="px-4 py-3 text-sm text-muted-foreground">
                  Loading conversations…
                </p>
              ) : conversations.length === 0 ? (
                <p className="px-4 py-3 text-sm text-muted-foreground">
                  No conversations found for this user.
                </p>
              ) : (
                <ScrollArea className="max-h-[480px]">
                  <div className="min-w-full overflow-x-auto">
                    <table className="w-full table-fixed border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                          <th className="px-4 py-3">Conversation</th>
                          <th className="px-4 py-3 w-24">Messages</th>
                          <th className="px-4 py-3 w-32">Tokens</th>
                          <th className="px-4 py-3 w-40">Created</th>
                          <th className="px-4 py-3 w-40">Updated</th>
                        </tr>
                      </thead>
                      <tbody>
                        {conversations.map((conversation) => (
                          <tr key={conversation.session_id} className="border-b border-border/60 last:border-none">
                            <td className="px-4 py-3 text-foreground">
                              {conversation.title || conversation.session_id}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {conversation.message_count}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {conversation.tokens_used}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {conversation.created_at
                                ? new Date(conversation.created_at).toLocaleString()
                                : "—"}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {conversation.updated_at
                                ? new Date(conversation.updated_at).toLocaleString()
                                : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
