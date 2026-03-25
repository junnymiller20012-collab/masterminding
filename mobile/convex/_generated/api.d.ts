/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as affiliates from "../affiliates.js";
import type * as coupons from "../coupons.js";
import type * as courses from "../courses.js";
import type * as enrollments from "../enrollments.js";
import type * as files from "../files.js";
import type * as mentors from "../mentors.js";
import type * as milestones from "../milestones.js";
import type * as notes from "../notes.js";
import type * as progress from "../progress.js";
import type * as reviews from "../reviews.js";
import type * as sectionQA from "../sectionQA.js";
import type * as sections from "../sections.js";
import type * as users from "../users.js";
import type * as waitlist from "../waitlist.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  affiliates: typeof affiliates;
  coupons: typeof coupons;
  courses: typeof courses;
  enrollments: typeof enrollments;
  files: typeof files;
  mentors: typeof mentors;
  milestones: typeof milestones;
  notes: typeof notes;
  progress: typeof progress;
  reviews: typeof reviews;
  sectionQA: typeof sectionQA;
  sections: typeof sections;
  users: typeof users;
  waitlist: typeof waitlist;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
