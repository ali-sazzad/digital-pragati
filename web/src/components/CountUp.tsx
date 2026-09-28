"use client";

import { useLayoutEffect, useRef } from "react";

// Counts from the last shown value to `value`, writing straight to the DOM so
// React doesn't re-render every frame. The nearest live region is marked busy
// until the final number lands, so screen readers announce it once.
export function CountUp({ value, digits, unit = "" }: { value: number; digits: number; unit?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const shown = useRef(0);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const format = (v: number) => `${v.toFixed(digits)}${unit}`;
    const from = shown.current;
    if (from === value || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      shown.current = value;
      el.textContent = format(value);
      return;
    }
    const live = el.closest("[aria-live]");
    live?.setAttribute("aria-busy", "true");
    const start = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const p = Math.min(1, Math.max(0, (now - start) / 700));
      shown.current = from + (value - from) * (1 - (1 - p) ** 3);
      el.textContent = format(shown.current);
      if (p < 1) raf = requestAnimationFrame(step);
      else live?.setAttribute("aria-busy", "false");
    };
    el.textContent = format(from);
    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      live?.setAttribute("aria-busy", "false");
    };
  }, [value, digits, unit]);

  return <span ref={ref} />;
}
