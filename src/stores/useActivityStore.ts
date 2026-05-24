"use client";

import { useState, useCallback } from "react";
import type { ActivityData } from "@/lib/types";
import { activityData as initialData } from "@/lib/data/activity-data";

let globalData = [...initialData];
let listeners: (() => void)[] = [];

function notify() {
  listeners.forEach((l) => l());
}

/**
 * 활동 데이터 CRUD 스토어
 * In-memory 상태 관리. 페이지 새로고침 시 초기 데이터로 리셋.
 */
export function useActivityStore() {
  const [, setTick] = useState(0);

  const subscribe = useCallback(() => {
    const listener = () => setTick((t) => t + 1);
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  // 컴포넌트 마운트 시 구독
  useState(() => {
    const unsub = subscribe();
    return unsub;
  });

  const getByProduct = useCallback((productId: string) => {
    return globalData.filter((ad) => ad.productId === productId);
  }, []);

  const add = useCallback((item: Omit<ActivityData, "id">) => {
    const newItem: ActivityData = {
      ...item,
      id: `ad-custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    };
    globalData = [...globalData, newItem];
    notify();
    return newItem;
  }, []);

  const update = useCallback((id: string, updates: Partial<ActivityData>) => {
    globalData = globalData.map((ad) =>
      ad.id === id ? { ...ad, ...updates } : ad
    );
    notify();
  }, []);

  const remove = useCallback((id: string) => {
    globalData = globalData.filter((ad) => ad.id !== id);
    notify();
  }, []);

  const getAll = useCallback(() => globalData, []);

  return { getAll, getByProduct, add, update, remove };
}
