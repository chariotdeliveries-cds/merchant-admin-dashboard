import { useEffect, useMemo, useRef, useState } from "react";

export default function MapPicker({
  apiKey,
  label = "Location",
  initialAddress = "",
  initialCenter = { lat: 5.6037, lng: -0.187 }, // Accra default
  onSelect
}) {
  const mapRef = useRef(null);
  const inputRef = useRef(null);

  const mapObjRef = useRef(null);
  const markerRef = useRef(null);
  const listenersRef = useRef([]);

  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState(initialAddress || "");

  const id = useMemo(
    () => `gm-${Math.random().toString(16).slice(2)}-${Date.now()}`,
    []
  );

  // keep text box synced when parent updates initialAddress
  useEffect(() => {
    setQuery(initialAddress || "");
  }, [initialAddress]);

  // ✅ Load Google script only once
  useEffect(() => {
    if (!apiKey) {
      console.error("Missing VITE_GOOGLE_MAPS_API_KEY");
      return;
    }

    const scriptId = "google-maps-js";
    const existing = document.getElementById(scriptId);

    const load = () =>
      new Promise((resolve, reject) => {
        if (window.google?.maps) return resolve();

        if (existing) {
          existing.addEventListener("load", () => resolve(), { once: true });
          existing.addEventListener(
            "error",
            () => reject(new Error("Google Maps failed to load")),
            { once: true }
          );
          return;
        }

        const s = document.createElement("script");
        s.id = scriptId;
        s.async = true;
        s.defer = true;
        s.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error("Google Maps failed to load"));
        document.head.appendChild(s);
      });

    load()
      .then(() => setReady(true))
      .catch((err) => {
        console.error(err);
        setReady(false);
      });
  }, [apiKey]);

  // ✅ Init map ONCE when script is ready
  useEffect(() => {
    if (!ready) return;
    if (!mapRef.current) return;
    if (mapObjRef.current) return; // already initialized

    const map = new window.google.maps.Map(mapRef.current, {
      center: initialCenter,
      zoom: 13,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false
    });

    const marker = new window.google.maps.Marker({
      position: initialCenter,
      map,
      draggable: true
    });

    mapObjRef.current = map;
    markerRef.current = marker;

    // map click listener
    const clickListener = map.addListener("click", (e) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      marker.setPosition({ lat, lng });
      onSelect?.({ address: (inputRef.current?.value || "").trim(), lat, lng });
    });

    // marker drag listener
    const dragListener = marker.addListener("dragend", () => {
      const pos = marker.getPosition();
      const lat = pos.lat();
      const lng = pos.lng();
      onSelect?.({ address: (inputRef.current?.value || "").trim(), lat, lng });
    });

    listenersRef.current.push(clickListener, dragListener);

    // ✅ Places autocomplete (addresses + notable places)
    if (inputRef.current && window.google.maps.places) {
      const ac = new window.google.maps.places.Autocomplete(inputRef.current, {
        fields: ["name", "formatted_address", "geometry"],
        types: ["geocode", "establishment"],
        strictBounds: false
      });

      const placeListener = ac.addListener("place_changed", () => {
        const place = ac.getPlace();
        if (!place?.geometry?.location) return;

        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();

        const name = (place.name || "").trim();
        const formatted = (place.formatted_address || "").trim();

        // Prefer "Place Name — Address" for landmarks/churches/schools
        const address =
          name && formatted
            ? `${name} — ${formatted}`
            : (formatted || name || inputRef.current.value || "").trim();

        setQuery(address);
        map.setCenter({ lat, lng });
        map.setZoom(15);
        marker.setPosition({ lat, lng });

        onSelect?.({ address, lat, lng });
      });

      listenersRef.current.push(placeListener);
    }

    // cleanup on unmount
    return () => {
      try {
        listenersRef.current.forEach((l) => l.remove());
      } catch {}
      listenersRef.current = [];
      mapObjRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]); // IMPORTANT: only depends on ready

  // ✅ If parent changes initialCenter later, move marker/center
  useEffect(() => {
    const map = mapObjRef.current;
    const marker = markerRef.current;
    if (!map || !marker) return;

    if (
      Number.isFinite(initialCenter?.lat) &&
      Number.isFinite(initialCenter?.lng)
    ) {
      map.setCenter(initialCenter);
      marker.setPosition(initialCenter);
    }
  }, [initialCenter?.lat, initialCenter?.lng]);

  return (
    <div className="p-3">
      <p className="text-xs font-bold uppercase text-gray-500 mb-2">{label}</p>

      <input
        ref={inputRef}
        id={`${id}-input`}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search a place (e.g. Accra Mall, a church, a school)…"
        className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      />

      <div className="mt-3">
        <div
          ref={mapRef}
          className="w-full h-56 rounded-lg border border-gray-200 bg-gray-50"
        />
      </div>

      {!apiKey && (
        <p className="mt-2 text-xs text-red-600">
          Missing VITE_GOOGLE_MAPS_API_KEY in your .env
        </p>
      )}

      {apiKey && !ready && (
        <p className="mt-2 text-xs text-gray-400">Loading map…</p>
      )}
    </div>
  );
}
