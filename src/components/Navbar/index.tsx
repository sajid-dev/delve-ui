"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type NavbarProps = {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
};

export default function Navbar({ onToggleSidebar, isSidebarOpen }: NavbarProps) {
  return (
    <nav className="fixed inset-x-0 top-0 z-50 flex h-20 items-center justify-between border-b border-sky-200 bg-sky-100/95 px-6 text-sm text-slate-600 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-sky-100/85">
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
          className="border border-transparent hover:border-border/70"
        >
          <span className="text-xl leading-none">
            {isSidebarOpen ? "×" : "≡"}
          </span>
        </Button>
        <Button asChild variant="ghost" className="h-full px-0 text-left hover:bg-transparent">
          <Link href="/" className="space-y-0.5">
            <h1 className="text-lg font-semibold text-slate-900">Delve</h1>
            <p className="text-xs tracking-wide text-slate-600">LLM assistant workspace</p>
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" className="text-xs font-medium text-slate-700 hover:bg-sky-200/60 hover:text-slate-900">
          <Link href="/admin">Admin</Link>
        </Button>
        <div className="flex flex-col text-right text-xs">
          <span className="text-slate-900">Demo User</span>
          <span className="text-slate-600">demo@workspace.com</span>
        </div>
        <Avatar className="h-9 w-9 border border-sky-200 bg-sky-50 text-slate-700">
          <AvatarFallback className="text-xs font-semibold uppercase">
            DU
          </AvatarFallback>
        </Avatar>
      </div>
    </nav>
  );
}
