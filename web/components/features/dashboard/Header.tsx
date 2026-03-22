"use client";

import { UserButton } from "@clerk/nextjs";

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between shrink-0">
      <h1 className="text-base font-semibold text-slate-900">
        {title ?? "Dashboard"}
      </h1>
      <UserButton afterSignOutUrl="/sign-in" />
    </header>
  );
}
