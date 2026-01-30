import { useEffect, useRef } from "react";
import { useMap } from "@vis.gl/react-google-maps";
import polyline from "@mapbox/polyline";

export const fetchRouteInfo = async (origin, destination) => {
  const response = await fetch(
    "https://routes.googleapis.com/directions/v2:computeRoutes",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        "X-Goog-FieldMask": "*",
      },
      body: JSON.stringify({
        origin: {
          location: { latLng: { latitude: origin.lat, longitude: origin.lng } },
        },
        destination: {
          location: {
            latLng: { latitude: destination.lat, longitude: destination.lng },
          },
        },
        travelMode: "DRIVE",
      }),
    }
  );

  const data = await response.json();
  const routeInfo = data?.routes?.[0];

  if (!routeInfo) return null;
  return {
    distance: routeInfo.distanceMeters || "N/A",
    duration: routeInfo.duration || "N/A",
    polyline: routeInfo.polyline?.encodedPolyline || null,
  };
};

export const RouteOverlay = ({
  encodedRoute,
  color = "#000000",
  duration = 1000,
}) => {
  const map = useMap();
  const polylineRef = useRef(null);
  const animationFrameId = useRef(null);

  useEffect(() => {
    if (!map || !encodedRoute) return;

    const fullPath = polyline
      .decode(encodedRoute)
      .map(([lat, lng]) => new window.google.maps.LatLng(lat, lng));

    if (!fullPath.length) return;

    if (polylineRef.current) {
      polylineRef.current.setMap(null);
    }

    const animatedLine = new window.google.maps.Polyline({
      path: [],
      strokeColor: color,
      strokeOpacity: 1,
      strokeWeight: 5,
      map: map,
    });

    polylineRef.current = animatedLine;

    const startTime = performance.now();

    function animate(time) {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const pointsToShow = Math.floor(progress * fullPath.length);

      const path = animatedLine.getPath();
      path.clear(); // clear current points

      for (let i = 0; i < pointsToShow; i++) {
        path.push(fullPath[i]);
      }

      if (progress < 1) {
        animationFrameId.current = requestAnimationFrame(animate);
      }
    }

    animationFrameId.current = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }
    };
  }, [map, encodedRoute, color, duration]);

  return null;
};
