"use client";

import { useCallback, useEffect, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import ChatWindow from "@/components/ChatWindow";
import { checkBackendStatus } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [backendStatus, setBackendStatus] = useState<
    "checking" | "online" | "offline"
  >("checking");
  const [backendDetail, setBackendDetail] = useState<string | undefined>();

  const refreshBackendStatus = useCallback(async () => {
    setBackendStatus("checking");
    try {
      const result = await checkBackendStatus();
      setBackendStatus(result.status);
      setBackendDetail(result.detail);
    } catch (error) {
      console.error("Unable to refresh backend status", error);
      setBackendStatus("offline");
      setBackendDetail("Could not reach the LLM backend.");
    }
  }, []);

  useEffect(() => {
    refreshBackendStatus();
  }, [refreshBackendStatus]);

  const isBackendOnline = backendStatus === "online";
  const isCheckingBackend = backendStatus === "checking";

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <Navbar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((previous) => !previous)}
      />
      <div className="relative flex flex-1 min-h-0 overflow-hidden pt-20">
        <Sidebar isOpen={isSidebarOpen} />
        <main
          className={cn(
            "flex-1 min-h-0 overflow-hidden bg-background transition-[margin-left] duration-300",
            isSidebarOpen ? "ml-72" : "ml-0",
            isSidebarOpen ? "lg:ml-72" : "lg:ml-0"
          )}
        >
          <div className="flex h-full w-full flex-col gap-4 p-4 md:p-6 min-h-0">
            {backendStatus === "offline" && (
              <Alert variant="destructive" className="shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <AlertTitle>LLM backend is offline</AlertTitle>
                    <AlertDescription>
                      {backendDetail || "Could not reach the LLM backend."}
                    </AlertDescription>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={refreshBackendStatus}
                    className="border-destructive/40 text-destructive hover:bg-destructive/10"
                  >
                    Retry
                  </Button>
                </div>
              </Alert>
            )}
            {isCheckingBackend && (
              <Alert variant="info" className="shadow-sm">
                <AlertDescription>Checking LLM backend status…</AlertDescription>
              </Alert>
            )}
            <div className="flex min-h-0 flex-1">
              <ChatWindow isBackendOnline={isBackendOnline} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
