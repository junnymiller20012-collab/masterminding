"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Settings,
  GraduationCap,
  Sun,
  Moon,
  TrendingUp,
  X,
  Link2,
  Compass,
  BookMarked,
} from "lucide-react";
import { useSidebar } from "./SidebarContext";
import { useLanguage } from "@/contexts/LanguageContext";

export function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { open, close } = useSidebar();
  const { lang, setLang, t } = useLanguage();

  const navItems = [
    { href: "/dashboard", label: t.navDashboard, icon: LayoutDashboard },
    { href: "/courses", label: t.navCourses, icon: BookOpen },
    { href: "/students", label: t.navStudents, icon: Users },
    { href: "/growth", label: t.navGrowth, icon: TrendingUp },
    { href: "/affiliates", label: t.navAffiliates, icon: Link2 },
    { href: "/explore", label: t.navExplore, icon: Compass },
    { href: "/my-learning", label: t.navMyLearning, icon: BookMarked },
    { href: "/settings", label: t.navSettings, icon: Settings },
  ];

  useEffect(() => setMounted(true), []);

  // Close sidebar on route change (mobile)
  useEffect(() => { close(); }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const isDark = theme === "dark";

  return (
    <aside
      className={[
        "fixed inset-y-0 left-0 z-50 w-60 shrink-0 h-screen",
        "md:relative md:z-auto md:translate-x-0",
        "bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800",
        "flex flex-col transition-transform duration-300 ease-in-out",
        open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
      ].join(" ")}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#0F766E] flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-slate-900 dark:text-white text-sm">
            MasterMinding
          </span>
        </div>
        {/* Close button — mobile only */}
        <button
          onClick={close}
          className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={[
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150",
                isActive
                  ? "bg-teal-50 dark:bg-teal-900/30 text-[#0F766E] dark:text-teal-400"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white",
              ].join(" ")}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Dark mode + Language toggles */}
      {mounted && (
        <div className="px-3 pb-4 space-y-1">
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4 shrink-0" /> : <Moon className="w-4 h-4 shrink-0" />}
            {isDark ? t.lightMode : t.darkMode}
          </button>
          <button
            onClick={() => setLang(lang === "en" ? "es" : "en")}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <span className="w-4 h-4 shrink-0 text-base leading-none">{lang === "en" ? "🇪🇸" : "🇺🇸"}</span>
            {lang === "en" ? t.switchToSpanish : t.switchToEnglish}
          </button>
        </div>
      )}
    </aside>
  );
}
