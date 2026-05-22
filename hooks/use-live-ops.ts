"use client";

import { useEffect, useMemo, useState } from "react";
import { baseZones, stadiumProfiles, type StadiumKey, type ZoneState } from "@/lib/stadium-data";
import { clamp } from "@/lib/utils";

function riskFor(density: number): ZoneState["risk"] {
  if (density >= 82) return "Critical";
  if (density >= 64) return "Elevated";
  return "Stable";
}

function seededDensity(index: number, bias: number) {
  return clamp(42 + ((index * 17) % 37) + bias, 24, 92);
}

export function buildZones(stadiumKey: StadiumKey, tick = 0): ZoneState[] {
  const profile = stadiumProfiles.find((item) => item.key === stadiumKey) ?? stadiumProfiles[0];
  return baseZones.map((zone, index) => {
    const wave = Math.sin(tick / 2 + index * 0.77) * 7;
    const density = clamp(seededDensity(index, profile.congestionBias) + wave, 12, 96);
    const wait = Math.round(2 + density / 8 + (zone.type === "food" ? 4 : 0));
    const flow = Math.round(620 + density * 38 + Math.cos(tick + index) * 120);

    return {
      ...zone,
      density,
      wait,
      flow,
      risk: riskFor(density)
    };
  });
}

export function useLiveOps(initialKey: StadiumKey = "narendra_modi") {
  const [stadiumKey, setStadiumKey] = useState<StadiumKey>(initialKey);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => setTick((value) => value + 1), 2400);
    return () => window.clearInterval(interval);
  }, []);

  const stadium = useMemo(
    () => stadiumProfiles.find((item) => item.key === stadiumKey) ?? stadiumProfiles[0],
    [stadiumKey]
  );

  const zones = useMemo(() => buildZones(stadiumKey, tick), [stadiumKey, tick]);
  const criticalZones = zones.filter((zone) => zone.risk === "Critical");
  const avgDensity = Math.round(zones.reduce((sum, zone) => sum + zone.density, 0) / zones.length);
  const safestGate = zones
    .filter((zone) => zone.type === "gate" || zone.type === "exit")
    .sort((a, b) => a.density - b.density)[0];
  const busiestZone = [...zones].sort((a, b) => b.density - a.density)[0];
  const queueAvg = Math.round(zones.reduce((sum, zone) => sum + zone.wait, 0) / zones.length);

  const timeline = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, index) => ({
        time: `${index * 5}m`,
        density: clamp(avgDensity + Math.sin((tick + index) / 2) * 10, 20, 96),
        flow: clamp(58 + Math.cos((tick + index) / 2.5) * 18, 20, 95),
        safety: clamp(100 - avgDensity + Math.sin(index) * 9, 12, 95)
      })),
    [avgDensity, tick]
  );

  const gateBalance = zones
    .filter((zone) => zone.type === "gate" || zone.type === "exit")
    .slice(0, 6)
    .map((zone) => ({ name: zone.label.replace(" Gate", ""), load: Math.round(zone.density), wait: zone.wait }));

  const assistantSummary = [
    `${busiestZone.label} is trending ${busiestZone.risk.toLowerCase()} at ${Math.round(busiestZone.density)}% density.`,
    `Route fans toward ${safestGate.label}; projected queue is ${safestGate.wait} minutes.`,
    criticalZones.length > 0
      ? "Keep emergency aisle lighting active and trigger steward redeployment."
      : "No hard safety breach detected. Continue predictive load balancing."
  ];

  return {
    stadium,
    stadiumKey,
    setStadiumKey,
    zones,
    avgDensity,
    queueAvg,
    criticalZones,
    safestGate,
    busiestZone,
    timeline,
    gateBalance,
    assistantSummary,
    tick
  };
}
