"use client";

import { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";

export function useInitUser() {
  const { user, isLoaded } = useUser();
  const upsert = useMutation(api.users.upsert);
  const initialized = useRef(false);

  useEffect(() => {
    if (!isLoaded || !user || initialized.current) return;
    initialized.current = true;

    upsert({
      name: user.fullName ?? user.username ?? "Mentor",
      email: user.primaryEmailAddress?.emailAddress ?? "",
      avatarUrl: user.imageUrl ?? undefined,
    }).catch(console.error);
  }, [isLoaded, user, upsert]);
}
