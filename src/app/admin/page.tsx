"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchAdminDashboard } from "@/lib/api";
import type { AdminDashboard } from "@/types/admin";

export default function AdminPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  useEffect(() => {
    const loadDashboard = async () => {
      setStatus("loading");
      setErrorMessage(undefined);
      try {
        const data = await fetchAdminDashboard();
        setDashboard(data);
        setStatus("idle");
      } catch (error) {
        setStatus("error");
        setErrorMessage(
          error instanceof Error ? error.message : "Unable to load admin dashboard."
        );
        console.error("Failed to load admin dashboard", error);
      }
    };

    loadDashboard();
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <Navbar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((previous) => !previous)}
      />
      <main className="flex-1 overflow-y-auto bg-background pt-20">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-8">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Manage conversations and review assistant activity from this space.
            </p>
          </div>
          {status === "loading" && (
            <p className="text-sm text-muted-foreground">Loading dashboard…</p>
          )}
          {status === "error" && (
            <p className="text-sm text-destructive">
              {errorMessage || "Unable to load dashboard."}
            </p>
          )}
          {dashboard && (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <Card className="shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Total Users</CardTitle>
                  </CardHeader>
                  <CardContent className="text-2xl font-semibold text-foreground">
                    {dashboard.total_users}
                  </CardContent>
                </Card>
                <Card className="shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Active Users</CardTitle>
                  </CardHeader>
                  <CardContent className="text-2xl font-semibold text-foreground">
                    {dashboard.active_users}
                  </CardContent>
                </Card>
                <Card className="shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Total Sessions</CardTitle>
                  </CardHeader>
                  <CardContent className="text-2xl font-semibold text-foreground">
                    {dashboard.total_sessions}
                  </CardContent>
                </Card>
                <Card className="shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Total Tokens Used</CardTitle>
                  </CardHeader>
                  <CardContent className="text-2xl font-semibold text-foreground">
                    {dashboard.total_tokens}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground">User Activity</h2>
                {dashboard.users.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No users found.</p>
                ) : (
                  <Card className="shadow-sm">
                    <CardContent className="px-0">
                      <div className="overflow-x-auto">
                        <table className="w-full table-fixed border-collapse text-sm">
                          <thead>
                            <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                              <th className="px-4 py-3">User</th>
                              <th className="px-4 py-3 w-24">Sessions</th>
                              <th className="px-4 py-3 w-28">Tokens</th>
                              <th className="px-4 py-3 w-28">Status</th>
                              <th className="px-4 py-3 w-48">Last Updated</th>
                              <th className="px-4 py-3 w-32">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {dashboard.users.map((user) => {
                              const userHref = `/admin/users/${encodeURIComponent(user.user_id)}`;
                              return (
                                <tr key={user.user_id} className="border-b border-border/60 last:border-none">
                                  <td className="px-4 py-3 text-foreground">
                                    <Link
                                      href={userHref}
                                      className="font-medium text-primary hover:underline"
                                    >
                                      {user.user_id}
                                    </Link>
                                  </td>
                                  <td className="px-4 py-3 text-muted-foreground">{user.session_count}</td>
                                  <td className="px-4 py-3 text-muted-foreground">{user.total_tokens}</td>
                                  <td className="px-4 py-3 text-muted-foreground">
                                    {user.is_active ? "Active" : "Inactive"}
                                  </td>
                                  <td className="px-4 py-3 text-muted-foreground">
                                    {user.last_active
                                      ? new Date(user.last_active).toLocaleString()
                                      : "—"}
                                  </td>
                                  <td className="px-4 py-3">
                                    <Button asChild size="sm" variant="outline">
                                      <Link href={userHref}>View conversations</Link>
                                    </Button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          )}
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span>Need to return to chat?</span>
            <Button asChild variant="outline" size="sm">
              <Link href="/">Back to Assistant</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
