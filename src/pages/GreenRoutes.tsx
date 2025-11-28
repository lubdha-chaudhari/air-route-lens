"use client";

import { useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navigation, Leaf, Clock, Wind, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import tt from "@tomtom-international/web-sdk-maps";
import "@tomtom-international/web-sdk-maps/dist/maps.css";

/**
 * Routes.tsx
 *
 * - Requires VITE_TOMTOM_API_KEY in .env (client-side Vite key)
 * - Optional: VITE_OPENWEATHER_API_KEY for air quality sampling
 *
 * Flow:
 * 1. Geocode start/end using TomTom Search API
 * 2. Request alternatives from TomTom Routing API
 * 3. (Optional) sample AQI via OpenWeather for each route and pick lowest average AQI
 * 4. Render a single Eco-Optimized Route with an embedded TomTom mini-map
 */

// Environment keys
const TOMTOM_KEY = (import.meta as any).env?.VITE_TOMTOM_API_KEY;
const OPENWEATHER_KEY = (import.meta as any).env?.VITE_OPENWEATHER_API_KEY;

// Helpers
function kmFromMeters(m: number) {
  return +(m / 1000).toFixed(1);
}
function minFromSeconds(s: number) {
  return Math.round(s / 60);
}
function openWeatherAqiToLabelAndApprox(aqi: number | null) {
  if (aqi == null) return { label: "Unknown", approx: null };
  switch (aqi) {
    case 1:
      return { label: "Good", approx: 40 };
    case 2:
      return { label: "Fair", approx: 80 };
    case 3:
      return { label: "Moderate", approx: 120 };
    case 4:
      return { label: "Unhealthy", approx: 180 };
    case 5:
      return { label: "Very Unhealthy", approx: 250 };
    default:
      return { label: "Unknown", approx: null };
  }
}

type RouteCandidate = {
  id: string;
  name: string;
  distanceKm: number;
  durationMin: number;
  coords: [number, number][];
  avgAqi?: number | null;
  displayLevel?: string;
  displayAqi?: number | null;
};

export default function Routes() {
  const [startText, setStartText] = useState("Connaught Place");
  const [endText, setEndText] = useState("Indira Gandhi Airport");
  const [loading, setLoading] = useState(false);
  const [chosenRoute, setChosenRoute] = useState<RouteCandidate | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // -------------------
  // TomTom helpers
  // -------------------

  // Geocode text -> [lng, lat]
  async function geocode(query: string): Promise<[number, number] | null> {
    if (!TOMTOM_KEY) {
      console.error("Missing VITE_TOMTOM_API_KEY");
      return null;
    }
    try {
      const url = `https://api.tomtom.com/search/2/search/${encodeURIComponent(
        query
      )}.json?key=${TOMTOM_KEY}&limit=1`;
      const r = await fetch(url);
      if (!r.ok) {
        console.warn("TomTom geocoding failed", await r.text());
        return null;
      }
      const j = await r.json();
      const first = j.results?.[0];
      if (!first) return null;
      // TomTom returns position: {lat, lon}
      const lat = first.position?.lat ?? first.lat ?? null;
      const lon = first.position?.lon ?? first.lon ?? null;
      if (lat == null || lon == null) return null;
      return [lon, lat];
    } catch (e) {
      console.error("Geocode error", e);
      return null;
    }
  }

  // Request route alternatives from TomTom
  async function fetchTomTomAlternatives(
    start: [number, number],
    end: [number, number]
  ): Promise<RouteCandidate[]> {
    if (!TOMTOM_KEY) throw new Error("Missing TOMTOM key");
    // Use calculateRoute endpoint — request polyline geometry
    const base = "https://api.tomtom.com/routing/1/calculateRoute";
    // TomTom REST path expects lat,lng order in the path for calculateRoute: lat1,lng1:lat2,lng2
    const path = `${start[1]},${start[0]}:${end[1]},${end[0]}`; // lat,lng : lat,lng
    const url = `${base}/${path}/json?key=${TOMTOM_KEY}&maxAlternatives=3&routeRepresentation=polyline`;
    const res = await fetch(url);
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`TomTom routing error: ${txt}`);
    }
    const j = await res.json();
    const routes: RouteCandidate[] = [];

    // TomTom response shape varies. Defensive parsing:
    const tomRoutes = j.routes ?? j.routes?.routes ?? j;
    if (Array.isArray(j.routes)) {
      j.routes.forEach((rt: any, idx: number) => {
        const summary = rt.summary ?? {};
        const geometry = rt.geometry ?? rt;
        // geometry can be in encoded polyline or coordinates array
        let coords: [number, number][] = [];
        if (geometry?.coordinates && Array.isArray(geometry.coordinates)) {
          // often coordinates are [lng,lat] pairs
          coords = geometry.coordinates.map((c: any[]) => [c[0], c[1]]);
        } else if (rt.legs && Array.isArray(rt.legs)) {
          // legs -> points
          const pts: [number, number][] = [];
          rt.legs.forEach((leg: any) => {
            (leg.points ?? []).forEach((p: any) => {
              // p.latitude/p.longitude or p.lat/p.lon
              const lat = p.latitude ?? p.lat;
              const lon = p.longitude ?? p.lon;
              if (lat != null && lon != null) pts.push([lon, lat]);
            });
          });
          coords = pts;
        } else if (rt.geometry && rt.geometry.points) {
          // alternative shapes
          coords = rt.geometry.points.map((p: any) => [p.longitude, p.latitude]);
        }
        const lengthInMeters = summary.lengthInMeters ?? summary.length ?? 0;
        const travelTime = summary.travelTimeInSeconds ?? summary.travelTime ?? 0;
        routes.push({
          id: `r-${idx}`,
          name: `Alternative ${idx + 1}`,
          distanceKm: kmFromMeters(lengthInMeters),
          durationMin: minFromSeconds(travelTime),
          coords,
        });
      });
    } else if (Array.isArray(j.routes?.routes)) {
      j.routes.routes.forEach((rt: any, idx: number) => {
        const summary = rt.summary ?? {};
        const coords =
          rt.geometry?.coordinates?.map((c: any[]) => [c[0], c[1]]) ?? [];
        routes.push({
          id: `r-${idx}`,
          name: `Alternative ${idx + 1}`,
          distanceKm: kmFromMeters(summary.lengthInMeters ?? 0),
          durationMin: minFromSeconds(summary.travelTimeInSeconds ?? 0),
          coords,
        });
      });
    } else {
      // fallback: try to glean summary at root
      const summary = j.summary ?? {};
      const coords =
        j.geometry?.coordinates?.map((c: any[]) => [c[0], c[1]]) ?? [];
      routes.push({
        id: `r-0`,
        name: `Route`,
        distanceKm: kmFromMeters(summary.lengthInMeters ?? 0),
        durationMin: minFromSeconds(summary.travelTimeInSeconds ?? 0),
        coords,
      });
    }

    return routes;
  }

  // Sample N points along coords
  function sampleCoords(coords: [number, number][], maxSamples = 6) {
    if (!coords || coords.length === 0) return [];
    const step = Math.max(1, Math.floor(coords.length / maxSamples));
    const sample: [number, number][] = [];
    for (let i = 0; i < coords.length; i += step) sample.push(coords[i]);
    if (sample.length && sample[sample.length - 1] !== coords[coords.length - 1]) {
      sample.push(coords[coords.length - 1]);
    }
    return sample.slice(0, maxSamples);
  }

  // Query OpenWeather Air Pollution (if key present). Returns OpenWeather "main.aqi" (1..5) or null
  async function fetchOpenWeatherAqi(lat: number, lon: number): Promise<number | null> {
    if (!OPENWEATHER_KEY) return null;
    try {
      const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_KEY}`;
      const r = await fetch(url);
      if (!r.ok) return null;
      const j = await r.json();
      const a = j?.list?.[0]?.main?.aqi ?? null;
      return a;
    } catch (e) {
      console.warn("OpenWeather AQI fetch error", e);
      return null;
    }
  }

  // -------------------
  // Main action: find green route
  // -------------------
  async function findGreenRoute() {
    setLoading(true);
    setMessage(null);
    setChosenRoute(null);

    if (!TOMTOM_KEY) {
      setMessage("TomTom API key missing — add VITE_TOMTOM_API_KEY to .env and restart.");
      setLoading(false);
      return;
    }

    try {
      // 1) geocode start & end
      setMessage("Geocoding addresses...");
      const start = (await geocode(startText)) ?? [77.2090, 28.6139]; // fallback to CP
      const end = (await geocode(endText)) ?? [77.1025, 28.5562]; // fallback to IGI

      // 2) attempt to request TomTom eco route if no AQI provider is configured
      if (!OPENWEATHER_KEY) {
        setMessage("Requesting TomTom eco route (no AQI provider configured)...");
        try {
          // Try TomTom routeType=eco (best-effort). If it fails, we'll request alternatives.
          const ecoUrl = `https://api.tomtom.com/routing/1/calculateRoute/${start[1]},${start[0]}:${end[1]},${end[0]}/json?key=${TOMTOM_KEY}&routeType=eco&routeRepresentation=polyline`;
          const ecoResp = await fetch(ecoUrl);
          if (ecoResp.ok) {
            const ej = await ecoResp.json();
            const rt = ej.routes?.[0] ?? ej;
            const summary = rt.summary ?? {};
            const coords =
              rt.geometry?.coordinates?.map((c: any[]) => [c[0], c[1]]) ??
              rt.legs?.flatMap((leg: any) =>
                (leg.points ?? []).map((p: any) => [p.longitude, p.latitude])
              ) ??
              [];
            const candidate: RouteCandidate = {
              id: "eco-tomtom",
              name: "Eco Route (TomTom)",
              distanceKm: kmFromMeters(summary.lengthInMeters ?? 0),
              durationMin: minFromSeconds(summary.travelTimeInSeconds ?? 0),
              coords,
              displayLevel: "Eco",
            };
            setChosenRoute(candidate);
            setMessage(null);
            setLoading(false);
            return;
          }
        } catch (e) {
          // fall through to alternatives
          console.warn("TomTom eco request failed, falling back to alternatives", e);
        }
      }

      // 3) fetch alternatives and compute AQI if possible
      setMessage("Fetching route alternatives...");
      const candidates = await fetchTomTomAlternatives(start, end);
      if (!candidates || candidates.length === 0) {
        setMessage("No routes returned from TomTom.");
        setLoading(false);
        return;
      }

      // If AQI provider not present or candidates have no coords, pick first
      if (!OPENWEATHER_KEY || candidates.every((c) => !c.coords || c.coords.length === 0)) {
        const fallback = candidates[0];
        fallback.displayLevel = "Unknown";
        setChosenRoute(fallback);
        setMessage(null);
        setLoading(false);
        return;
      }

      setMessage("Sampling air quality along routes...");
      // For each route gather sample points and query AQI
      for (const c of candidates) {
        const samples = sampleCoords(c.coords, 5);
        const aqiValues: number[] = [];
        for (const [lng, lat] of samples) {
          const a = await fetchOpenWeatherAqi(lat, lng);
          if (a != null) aqiValues.push(a);
          // small gap to reduce burst
          await new Promise((r) => setTimeout(r, 120));
        }
        if (aqiValues.length > 0) {
          const approxList = aqiValues
            .map((v) => openWeatherAqiToLabelAndApprox(v).approx)
            .filter((x) => x != null) as number[];
          c.avgAqi = approxList.length
            ? Math.round(approxList.reduce((s, n) => s + n, 0) / approxList.length)
            : null;
          c.displayAqi = c.avgAqi ?? null;
          c.displayLevel = c.avgAqi != null
            ? c.avgAqi <= 50
              ? "Good"
              : c.avgAqi <= 100
              ? "Moderate"
              : c.avgAqi <= 200
              ? "Unhealthy"
              : "Hazardous"
            : "Unknown";
        } else {
          c.avgAqi = null;
          c.displayLevel = "Unknown";
        }
      }

      // Choose route with lowest avgAqi (nulls last)
      const ranked = candidates.slice().sort((a, b) => {
        if (a.avgAqi == null && b.avgAqi == null) return 0;
        if (a.avgAqi == null) return 1;
        if (b.avgAqi == null) return -1;
        return a.avgAqi - b.avgAqi;
      });

      const winner = ranked[0];
      if (winner) {
        winner.name = "Eco-Optimized Route";
        setChosenRoute(winner);
        setMessage(null);
      } else {
        setMessage("Unable to decide on a route.");
      }
    } catch (err: any) {
      console.error(err);
      setMessage("Error computing route — check console for details.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Navigation className="h-8 w-8 text-primary" />
          Green Route Planner
        </h1>
        <p className="text-muted-foreground mt-1">Find routes with optimal air quality and minimal traffic</p>
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle>Plan Your Journey</CardTitle>
          <CardDescription>Enter start and end locations to find the best eco-friendly route</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Starting Point</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input value={startText} onChange={(e: any) => setStartText(e.target.value)} className="pl-9" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Destination</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input value={endText} onChange={(e: any) => setEndText(e.target.value)} className="pl-9" />
              </div>
            </div>
          </div>
          <Button onClick={findGreenRoute} className="w-full mt-4 bg-gradient-primary hover:opacity-90" disabled={loading}>
            <Navigation className="mr-2 h-4 w-4" />
            {loading ? "Searching..." : "Find Green Route"}
          </Button>

          {message && <p className="mt-3 text-sm text-muted-foreground">{message}</p>}
        </CardContent>
      </Card>

      {/* Single recommended route */}
      {chosenRoute ? (
        <Card className="border-2 border-success/30 bg-success/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Leaf className="h-5 w-5 text-success" />
              Eco-Optimized Route
              <Badge className="ml-2">Recommended</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Navigation className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Distance</p>
                  <p className="font-semibold">{chosenRoute.distanceKm} km</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-semibold">{chosenRoute.durationMin} min</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Wind className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Air Quality</p>
                  <p className="font-semibold">
                    {chosenRoute.displayLevel ?? "Unknown"} {chosenRoute.displayAqi ? `• AQI ${chosenRoute.displayAqi}` : ""}
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <RouteMiniMap path={chosenRoute.coords} height={240} />
            </div>

            <div className="flex gap-2">
              <Button className="flex-1 bg-gradient-primary hover:opacity-90">Select Route</Button>
              <Button variant="outline" className="flex-1">View Details</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="text-sm text-muted-foreground">No eco route chosen yet — run a search.</div>
      )}

      <Card className="border-2 border-success/30 bg-success/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-success" />
            Sustainable Travel Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="p-3 rounded-lg bg-card border">
              <h3 className="font-semibold mb-1 text-sm">Prefer Carpooling</h3>
              <p className="text-xs text-muted-foreground">During rush hour to reduce traffic congestion and emissions</p>
            </div>
            <div className="p-3 rounded-lg bg-card border">
              <h3 className="font-semibold mb-1 text-sm">Avoid High Pollution Zones</h3>
              <p className="text-xs text-muted-foreground">NH-8 between 6-8 PM shows elevated NO₂ levels</p>
            </div>
            <div className="p-3 rounded-lg bg-card border">
              <h3 className="font-semibold mb-1 text-sm">Use Public Transport</h3>
              <p className="text-xs text-muted-foreground">Metro and buses are eco-friendly alternatives</p>
            </div>
            <div className="p-3 rounded-lg bg-card border">
              <h3 className="font-semibold mb-1 text-sm">Plan Off-Peak Travel</h3>
              <p className="text-xs text-muted-foreground">Travel outside 8-10 AM and 6-8 PM for better air quality</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Mini Map component
 * - Accepts path: [lng, lat][]
 * - Ensures container has non-zero height, uses tomtom style string and calls resize on load
 */
function RouteMiniMap({ path, height = 140 }: { path: [number, number][]; height?: number }) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<tt.Map | null>(null);

  useEffect(() => {
    const API_KEY = TOMTOM_KEY;
    if (!API_KEY) {
      console.error("Missing VITE_TOMTOM_API_KEY — tomtom map will not load");
      return;
    }
    if (!mapRef.current) return;

    // ensure container has height
    mapRef.current.style.height = `${height}px`;

    // cleanup previous
    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }

    const center = path && path.length ? path[Math.floor(path.length / 2)] : [77.17, 28.58];

    mapInstance.current = tt.map({
      key: API_KEY,
      container: mapRef.current,
      center,
      zoom: 11,
      style: `https://api.tomtom.com/maps-sdk-for-web/2.0/styles/basic-main/style.json?key=${API_KEY}`,

      interactive: false,
    });

    mapInstance.current.on("load", () => {
      try {
        mapInstance.current?.resize();
      } catch (e) {
        // ignore
      }

      // draw line
      if (path && path.length) {
        const srcId = "mini-route-src";
        if (mapInstance.current?.getLayer(`${srcId}-layer`)) {
          try {
            mapInstance.current.removeLayer(`${srcId}-layer`);
          } catch (e) {}
        }
        if (mapInstance.current?.getSource(srcId)) {
          try {
            mapInstance.current.removeSource(srcId);
          } catch (e) {}
        }

        try {
          mapInstance.current?.addSource(srcId, {
            type: "geojson",
            data: {
              type: "Feature",
              geometry: { type: "LineString", coordinates: path },
            },
          } as any);

          mapInstance.current?.addLayer({
            id: `${srcId}-layer`,
            type: "line",
            source: srcId,
            layout: { "line-join": "round", "line-cap": "round" },
            paint: { "line-color": "#16a34a", "line-width": 4, "line-opacity": 0.95 },
          });

          // markers
          if (path.length >= 2) {
            const start = path[0];
            const end = path[path.length - 1];
            new (tt as any).Marker({ color: "#2563eb" }).setLngLat(start).addTo(mapInstance.current as any);
            new (tt as any).Marker({ color: "#9333ea" }).setLngLat(end).addTo(mapInstance.current as any);

            try {
              const bounds = path.reduce((b: any, c) => b.extend(c), new (tt as any).LngLatBounds(path[0], path[0]));
              mapInstance.current?.fitBounds(bounds, { padding: 16, maxZoom: 13 });
            } catch (e) {}
          }
        } catch (e) {
          console.warn("Mini map draw error", e);
        }
      }
    });

    return () => {
      mapInstance.current && mapInstance.current.remove();
      mapInstance.current = null;
    };
  }, [path, height]);

  return <div ref={mapRef} className="w-full rounded-md overflow-hidden border" style={{ height }} />;
}
