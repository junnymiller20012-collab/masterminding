"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState } from "react";
import Link from "next/link";
import { GraduationCap, Search, BookOpen, Users } from "lucide-react";

export default function ExplorePage() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "popular" | "price_asc" | "price_desc">("newest");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const courses = useQuery(api.courses.listPublished, { search: debouncedSearch || undefined, sortBy });

  function handleSearch(val: string) {
    setSearch(val);
    clearTimeout((window as any).__searchTimer);
    (window as any).__searchTimer = setTimeout(() => setDebouncedSearch(val), 400);
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-slate-100 px-4 sm:px-8 h-16 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-sm z-10">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#0F766E] flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-slate-900 text-sm sm:text-base">MasterMinding</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/sign-in" className="text-sm font-medium text-slate-600 hover:text-slate-900 px-2 py-1.5">Sign in</Link>
          <Link href="/sign-up" className="text-sm font-medium bg-[#0F766E] text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-[#0D6D65] whitespace-nowrap">Get started</Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Browse Courses</h1>
          <p className="text-slate-500">Discover courses from expert mentors</p>
        </div>

        {/* Search + Sort */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-slate-700"
          >
            <option value="newest">Newest first</option>
            <option value="popular">Most popular</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
          </select>
        </div>

        {/* Grid */}
        {courses === undefined ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3,4,5,6].map((i) => (
              <div key={i} className="border border-slate-200 rounded-2xl overflow-hidden animate-pulse">
                <div className="h-40 bg-slate-100" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-slate-100 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                  <div className="h-3 bg-slate-100 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-2xl">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-slate-600 mb-1">No courses found</p>
            <p className="text-sm text-slate-400">{search ? "Try a different search term" : "Check back soon — new courses are added regularly"}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map((course) => (
              <Link
                key={course._id}
                href={`/${course.mentorSlug}/${course.slug}`}
                className="border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all group"
              >
                <div className="h-40 bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center overflow-hidden">
                  {course.coverImageUrl ? (
                    <img src={course.coverImageUrl} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    <BookOpen className="w-10 h-10 text-white/60" />
                  )}
                </div>
                <div className="p-4">
                  <p className="font-semibold text-slate-900 text-sm group-hover:text-teal-700 transition-colors leading-tight mb-2 line-clamp-2">{course.title}</p>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                      {course.mentorAvatarUrl ? (
                        <img src={course.mentorAvatarUrl} alt={course.mentorName} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="text-[9px] font-bold text-teal-700">{course.mentorName.charAt(0)}</span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500">{course.mentorName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-teal-700 text-sm">${(course.priceCents / 100).toFixed(0)}</span>
                    {course.enrollmentCount > 0 && (
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {course.enrollmentCount}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
