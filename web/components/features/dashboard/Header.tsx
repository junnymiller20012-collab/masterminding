"use client";

import { UserButton } from "@clerk/nextjs";
import { Menu } from "lucide-react";
import { useSidebar } from "./SidebarContext";

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  const { toggle } = useSidebar();

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 md:px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={toggle}
          className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-base font-semibold text-slate-900 dark:text-white">
          {title ?? "Dashboard"}
        </h1>
      </div>
      <UserButton
        afterSignOutUrl="/sign-in"
        userProfileProps={{
          appearance: {
            elements: {
              profileSection__activeDevices: { display: "none" },
              profileSection__danger: { display: "none" },
            },
          },
        }}
      />
    </header>
  );
}
