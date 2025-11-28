// src/components/Dashboard.tsx  (or wherever your Dashboard.jsx/tsx lives)
"use client";

import { useEffect, useState, useCallback } from "react";
import { MetricCard } from "@/components/MetricCard";
import { TechGrid } from "@/components/TechGrid";
import { Wind, Navigation2, Fuel, AlertTriangle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LiveMap } from "@/components/LiveMap";

/**
 * Dynamic Dashboard
 *
 * - Expects LiveMap to call onLocationChange({ lat, lng }) when user moves map or selects a location.
 * - Uses a deterministic location-based generator to create AQI, congestion, fuel and alerts.
 * - Persists computed metrics to localStorage per location so refresh shows last-known values.
 * - Shows "Last updated X min ago" based on timestamp stored with metrics.
 *
 * If your LiveMap prop name differs, it will still work thanks to forwarding both props:
 *    <LiveMap onLocationChange={handleLocationChange} onCenterChange={handleLocationChange} />
 *
 */

/* -------------------
   Helpers
   ------------------- */
// simple location key for storage
function locKey(lat: number, lng: number) {
  return `metrics:${lat.toFixed(4)},${lng.toFixed(4)}`;
}

// tiny deterministic hash from coords -> seed (0..1)
function coordSeed(lat: number, lng: number) {
  // mix lat/lng into a number then fractionalize
  const s = Math.sin(lat * 127.1 + lng * 311.7) * 43758.5453123;
  return s - Math.floor(s);
}

// seeded PRNG using the seed in [0,1)
function seededRand(seed: number) {
  let t = seed;
  return () => {
    // xorshift-ish
    t = (t * 9301 + 49297) % 233280;
    return t / 233280;
  };
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

type Metrics = {
  aqi: number;
  aqiLabel: string;
  congestionPct: number;
  fuelLph: number;
  alerts: Array<{ id: string; level: "critical" | "high" | "moderate"; title: string; desc: string }>;
  ts: number; // epoch ms when generated
};

// map numeric AQI -> label
function aqiLabelFromValue(aqi: number) {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for Sensitive Groups";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very Unhealthy";
  return "Hazardous";
}

// generate alerts from aqi + randomness
const ALERT_TEMPLATES = [
  { level: "critical", title: "Critical AQI Level", hint: "Avoid area—health risk" },
  { level: "high", title: "High NO₂ Levels", hint: "Use alternate routes" },
  { level: "high", title: "Traffic Bottleneck", hint: "Expect delays" },
  { level: "moderate", title: "Elevated Emissions", hint: "Worsening during evening" },
  { level: "moderate", title: "Construction Work", hint: "Slow traffic expected" },
];

function generateMetrics(lat: number, lng: number): Metrics {
  const seed = coordSeed(lat, lng);
  const rand = seededRand(Math.floor(seed * 1e6));
  // AQI base 30..300 biased by seed
  const aqiBase = Math.round(30 + Math.pow(rand(), 1.2) * 270);
  // congestion 10..95
  const congestion = Math.round(clamp(10 + Math.round(rand() * 85), 10, 95));
  // fuel wasted 20..400 L/hr scaled by congestion and seed
  const fuel = Math.round(clamp(20 + congestion * (5 + rand() * 1.5), 20, 500));
  const aqiLabel = aqiLabelFromValue(aqiBase);

  // generate 0..3 alerts depending on AQI and rand
  const alerts: Metrics["alerts"] = [];
  // stronger chance for alerts when AQI high
  const alertChance = clamp((aqiBase - 50) / 300 + rand() * 0.5, 0, 1);
  const count = alertChance > 0.6 ? Math.ceil(alertChance * 3) : Math.floor(alertChance * 2);
  // choose templates deterministically
  for (let i = 0; i < Math.max(0, count); i++) {
    const idx = Math.floor(rand() * ALERT_TEMPLATES.length);
    const tmpl = ALERT_TEMPLATES[idx];
    const id = `${lat.toFixed(4)}:${lng.toFixed(4)}:${i}:${tmpl.title.replace(/\s+/g, "-")}`;
    alerts.push({
      id,
      level: tmpl.level as any,
      title: tmpl.title,
      desc: `${tmpl.hint} • AQI: ${aqiBase} • ${congestion}% Traffic Congestion`,
    });
  }

  return {
    aqi: aqiBase,
    aqiLabel,
    congestionPct: congestion,
    fuelLph: fuel,
    alerts,
    ts: Date.now(),
  };
}

// persist and load helpers
function saveMetricsForLocation(lat: number, lng: number, metrics: Metrics) {
  try {
    localStorage.setItem(locKey(lat, lng), JSON.stringify(metrics));
  } catch (e) {
    console.warn("Failed saving metrics to localStorage", e);
  }
}
function loadMetricsForLocation(lat: number, lng: number): Metrics | null {
  try {
    const v = localStorage.getItem(locKey(lat, lng));
    if (!v) return null;
    return JSON.parse(v) as Metrics;
  } catch (e) {
    return null;
  }
}

// human-friendly "last updated X min ago"
function timeAgo(ts: number) {
  const diff = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  return `${Math.floor(diff / 3600)} hr ago`;
}

/* -------------------
   Dashboard Component
   ------------------- */

export default function Dashboard() {
  // current map center (default to some city center)
  const [center, setCenter] = useState<{ lat: number; lng: number }>({ lat: 28.6139, lng: 77.2090 });

  // metrics state (keeps metrics for current center)
  const [metrics, setMetrics] = useState<Metrics | null>(() => loadMetricsForLocation(28.6139, 77.2090));

  // when LiveMap emits location change, this handler runs
  const handleLocationChange = useCallback((payload: { lat: number; lng: number } | null) => {
    if (!payload) return;
    const { lat, lng } = payload;
    setCenter({ lat, lng });

    // try load from storage
    const fromStorage = loadMetricsForLocation(lat, lng);
    if (fromStorage) {
      setMetrics(fromStorage);
      return;
    }

    // otherwise generate deterministically and persist
    const gen = generateMetrics(lat, lng);
    setMetrics(gen);
    saveMetricsForLocation(lat, lng, gen);
  }, []);

  // on first mount if metrics is null, generate for default center
  useEffect(() => {
    if (!metrics) {
      const gen = generateMetrics(center.lat, center.lng);
      setMetrics(gen);
      saveMetricsForLocation(center.lat, center.lng, gen);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

 
  // When reloading the page we want the timestamp to show "2 min ago" style relative time.
  // That will be computed by timeAgo(metrics.ts) when rendering.

  return (
    <div className="relative space-y-6 animate-in fade-in-50 duration-500">
      <TechGrid />

      {/* Header */}
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]">
            Traffic & Environmental Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time monitoring of traffic congestion and air quality — showing data for{" "}
            <span className="font-medium">{center.lat.toFixed(4)}, {center.lng.toFixed(4)}</span>
          </p>
        </div>

        {/* debug controls */}
        <div className="flex gap-2">
          <Button onClick={() => {
            // force refresh data for current center (regenerate & persist)
            const gen = generateMetrics(center.lat, center.lng);
            setMetrics(gen);
            saveMetricsForLocation(center.lat, center.lng, gen);
          }} size="sm">Refresh Data</Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 relative z-10">
        <MetricCard
          title="Average AQI"
          value={metrics ? String(metrics.aqi) : "—"}
          subtitle={metrics ? `${metrics.aqiLabel} • Last updated ${timeAgo(metrics.ts)}` : "No data"}
          icon={Wind}
          variant={metrics ? (metrics.aqi > 150 ? "destructive" : metrics.aqi > 100 ? "warning" : "default") : "default"}
        />
        <MetricCard
          title="Traffic Congestion"
          value={metrics ? `${metrics.congestionPct}%` : "—"}
          subtitle={metrics ? `${metrics.congestionPct > 75 ? "Above average • Rush hour" : "Normal"} • Last updated ${timeAgo(metrics.ts)}` : "No data"}
          icon={Navigation2}
          variant={metrics ? (metrics.congestionPct > 75 ? "warning" : "default") : "default"}
        />
        <MetricCard
          title="Fuel Wasted"
          value={metrics ? `${metrics.fuelLph} L/hr` : "—"}
          subtitle={metrics ? `Estimated across all zones • Last updated ${timeAgo(metrics.ts)}` : "No data"}
          icon={Fuel}
          variant="warning"
        />
        <MetricCard
          title="Active Alerts"
          value={metrics ? String(metrics.alerts.length) : "0"}
          subtitle={metrics ? `${metrics.alerts.length} active • Last updated ${timeAgo(metrics.ts)}` : "No data"}
          icon={AlertTriangle}
          variant={metrics && metrics.alerts.length > 0 ? "destructive" : "default"}
        />
      </div>

      {/* Live Map (expands across area) */}
      <div className="grid gap-6 lg:grid-cols-3 relative z-10">
        <Card className="lg:col-span-3 border-2 glass glow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Live Map View</CardTitle>
                <CardDescription>Interactive traffic and pollution visualization</CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge
                  variant="outline"
                  className="bg-success/10 text-success border-success/30"
                >
                  Traffic
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-destructive/10 text-destructive border-destructive/30"
                >
                  AQI
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* LiveMap: it should call onLocationChange({lat,lng}) when user moves map */}
            <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-primary/30">
              <LiveMap
                // try both prop names so your existing LiveMap (whichever one it uses) receives the handler
                onLocationChange={(c: any) => {
                  if (c?.lat != null && c?.lng != null) handleLocationChange(c);
                }}
                onCenterChange={(c: any) => {
                  if (c?.lat != null && c?.lng != null) handleLocationChange(c);
                }}
                // also expose current center if your LiveMap accepts it
                center={center}
              />
            </div>

            {/* Legend Buttons */}
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                <div className="w-3 h-3 rounded-full bg-success mr-2" />
                Good (0-50)
              </Button>
              <Button variant="outline" size="sm">
                <div className="w-3 h-3 rounded-full bg-warning mr-2" />
                Moderate (51-100)
              </Button>
              <Button variant="outline" size="sm">
                <div className="w-3 h-3 rounded-full bg-destructive mr-2" />
                Unhealthy (100+)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      <Card className="border-2 border-warning/30 bg-warning/5 glass relative z-10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Active Environmental Alerts
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            Showing alerts for {center.lat.toFixed(4)}, {center.lng.toFixed(4)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics && metrics.alerts.length > 0 ? (
              metrics.alerts.map((a) => (
                <div key={a.id} className="flex items-start gap-3 p-3 rounded-lg bg-card border">
                  <div className={`w-2 h-2 rounded-full mt-2 ${a.level === "critical" ? "bg-destructive" : a.level === "high" ? "bg-warning" : "bg-amber-400"}`} />
                  <div className="flex-1">
                    <p className="font-medium">{a.title}</p>
                    <p className="text-sm text-muted-foreground">{a.desc}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-3 rounded-lg bg-card border text-sm text-muted-foreground">
                No active alerts for this area.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
