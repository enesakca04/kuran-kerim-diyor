"use client";

import { useEffect } from "react";
import { useUserStore } from "@/store/userStore";

export function useAppInit() {
  const initialize = useUserStore((state) => state.initialize);

  useEffect(() => {
    void initialize();
  }, [initialize]);
}
