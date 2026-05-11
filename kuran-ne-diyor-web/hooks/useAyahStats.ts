"use client";

import { useCallback, useEffect, useState } from "react";
import apiClient from "@/services/apiClient";
import type { AyahStats } from "@/types/api";

export function useAyahStats(ayahId: string) {
  const [stats, setStats] = useState<AyahStats | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<AyahStats>(`/stats/${ayahId}`);
      setStats(response.data);
    } finally {
      setLoading(false);
    }
  }, [ayahId]);

  useEffect(() => {
    queueMicrotask(() => {
      void refresh();
    });
  }, [refresh]);

  return { stats, loading, refresh, setStats };
}
