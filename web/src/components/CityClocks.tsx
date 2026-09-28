"use client";

import { useEffect, useState } from "react";

const cities = [
  { city: "Sydney", zone: "Australia/Sydney" },
  { city: "Kathmandu", zone: "Asia/Kathmandu" },
] as const;

function read(zone: string) {
  const now = new Date();
  const time = new Intl.DateTimeFormat("en-AU", {
    timeZone: zone,
    hour: "numeric",
    minute: "2-digit",
  }).format(now);
  // Intl has no short name for Nepal time, so label it directly.
  const abbr =
    zone === "Asia/Kathmandu"
      ? "NPT"
      : new Intl.DateTimeFormat("en-AU", { timeZone: zone, timeZoneName: "short" })
          .formatToParts(now)
          .find((p) => p.type === "timeZoneName")?.value ?? "";
  return { time, abbr };
}

export function CityClocks() {
  const [times, setTimes] = useState<{ time: string; abbr: string }[] | null>(null);

  useEffect(() => {
    const tick = () => setTimes(cities.map((c) => read(c.zone)));
    tick();
    const id = setInterval(tick, 15_000);
    return () => clearInterval(id);
  }, []);

  return (
    <dl className="clocks">
      {cities.map((c, i) => (
        <div key={c.city} className="clock">
          <dt>{c.city}</dt>
          <dd>
            <span className="clock-time">{times?.[i].time ?? "--:--"}</span>{" "}
            <span className="clock-zone">{times?.[i].abbr ?? ""}</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}
