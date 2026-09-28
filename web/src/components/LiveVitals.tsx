"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { CountUp } from "./CountUp";

type LayoutShift = PerformanceEntry & { value: number; hadRecentInput: boolean };

const noSubscribe = () => () => {};
const lcpSupported = () =>
  typeof PerformanceObserver !== "undefined" &&
  (PerformanceObserver.supportedEntryTypes ?? []).includes("largest-contentful-paint");

// Reads this page's own Core Web Vitals from the visitor's browser.
export function LiveVitals() {
  const [lcp, setLcp] = useState<number | null>(null);
  const [cls, setCls] = useState(0);
  // Assume support on the server; the browser reports the truth after hydration.
  const supported = useSyncExternalStore(noSubscribe, lcpSupported, () => true);

  useEffect(() => {
    if (!lcpSupported()) return;
    const types = PerformanceObserver.supportedEntryTypes;
    const lcpObs = new PerformanceObserver((list) => {
      const last = list.getEntries().at(-1);
      if (last) setLcp(last.startTime);
    });
    lcpObs.observe({ type: "largest-contentful-paint", buffered: true });

    let total = 0;
    const clsObs = new PerformanceObserver((list) => {
      for (const e of list.getEntries() as LayoutShift[]) {
        if (!e.hadRecentInput) total += e.value;
      }
      setCls(total);
    });
    if (types.includes("layout-shift")) clsObs.observe({ type: "layout-shift", buffered: true });

    return () => {
      lcpObs.disconnect();
      clsObs.disconnect();
    };
  }, []);

  if (!supported) {
    return (
      <p className="vitals-note">
        Your browser doesn&rsquo;t report load timings. Open this page in Chrome or Edge to see them.
      </p>
    );
  }

  return (
    <dl className="vitals" aria-live="polite">
      <div>
        <dt>Main content shown (LCP)</dt>
        <dd data-vital="lcp">{lcp === null ? "measuring" : <CountUp value={lcp / 1000} digits={2} unit=" s" />}</dd>
      </div>
      <div>
        <dt>Layout shift (CLS)</dt>
        <dd data-vital="cls">
          <CountUp value={cls} digits={3} />
        </dd>
      </div>
    </dl>
  );
}
