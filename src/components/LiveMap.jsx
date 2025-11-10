"use client";
import { useEffect, useRef } from "react";
import tt from "@tomtom-international/web-sdk-maps";
import "@tomtom-international/web-sdk-maps/dist/maps.css";

export function LiveMap() {
  const mapElement = useRef(null);
  const map = useRef(null);
  const userMarker = useRef(null);

  useEffect(() => {
    if (map.current) return;

    const API_KEY = import.meta.env.VITE_TOMTOM_API_KEY;

    if (!API_KEY) {
      console.error("❌ Missing TomTom API Key in .env");
      return;
    }

    console.log("🗺️ TomTom Key Loaded ✅");

    // Initialize map
    map.current = tt.map({
      key: API_KEY,
      container: mapElement.current,
      center: [72.8777, 19.0760], // Default Mumbai center
      zoom: 11,
      style: { map: "basic_main" },
    });

    // Add zoom & rotation controls
    map.current.addControl(new tt.NavigationControl());

    // Add default marker (Mumbai)
    new tt.Marker({ color: "#ff0000" })
      .setLngLat([72.8777, 19.0760])
      .setPopup(new tt.Popup().setText("Default Marker: Mumbai"))
      .addTo(map.current);

    // ✅ Try to get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          console.log("📍 User Location:", latitude, longitude);

          // Center map on user
          map.current.flyTo({ center: [longitude, latitude], zoom: 13 });

          // Create a blue circular marker
          const userMarkerElement = document.createElement("div");
          userMarkerElement.style.backgroundColor = "#3b82f6";
          userMarkerElement.style.width = "18px";
          userMarkerElement.style.height = "18px";
          userMarkerElement.style.borderRadius = "50%";
          userMarkerElement.style.boxShadow = "0 0 10px rgba(59,130,246,0.8)";
          userMarkerElement.style.border = "2px solid white";

          // Add marker for current location
          userMarker.current = new tt.Marker({
            element: userMarkerElement,
            anchor: "center",
          })
            .setLngLat([longitude, latitude])
            .setPopup(new tt.Popup().setText("You are here"))
            .addTo(map.current);
        },
        (error) => {
          console.error("⚠️ Geolocation error:", error.message);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      console.error("❌ Geolocation not supported by this browser.");
    }

    map.current.on("load", () =>
      console.log("✅ TomTom Map Loaded Successfully")
    );
    map.current.on("error", (e) =>
      console.error("TomTom Map Error:", e)
    );

    return () => map.current && map.current.remove();
  }, []);

  return (
    <div
      ref={mapElement}
      style={{
        height: "500px",
        width: "100%",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    />
  );
}
