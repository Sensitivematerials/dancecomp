"use client";
import { useCallback } from "react";
export function useVibration() {
  const vibrate = useCallback((pattern: number | number[]) => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  }, []);
  const vibrateReady = useCallback(() => { vibrate([100, 80, 100]); }, [vibrate]);
  const vibrateOnStage = useCallback(() => { vibrate([300]); }, [vibrate]);
  return { vibrateReady, vibrateOnStage };
}
