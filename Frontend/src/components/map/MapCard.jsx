import React, { useState, useContext, useEffect, useRef } from "react";
import PlaceInfoCard from "../content/PlaceInfoCard.jsx";
import { AppContext } from "../../App.jsx";
import { handleDetailClick, ExtraInfoContext } from "../content/Layout.jsx";
import { Map, AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import { Spinner } from "@heroui/react";
import { AnimatedMarker } from "./AnimatedMarkers.jsx";
import { RouteOverlay } from "./Routes.jsx";

const MapLoadingScreen = ({ onLoadComplete }) => {
  const [loadingText, setLoadingText] = useState("Initializing map");

  useEffect(() => {
    const textCycle = [
      "Initializing map",
      "Loading locations",
      "Preparing markers",
    ];
    let index = 0;

    const textInterval = setInterval(() => {
      index = (index + 1) % textCycle.length;
      setLoadingText(textCycle[index]);
    }, 300);

    const autoFinishTimeout = setTimeout(() => {
      onLoadComplete();
    }, 600);

    return () => {
      clearInterval(textInterval);
      clearTimeout(autoFinishTimeout);
    };
  }, [onLoadComplete]);

  return (
    <div className="absolute inset-0 bg-gray-200 flex flex-col items-center justify-center">
      <Spinner
        size="lg"
        color="default"
        className="mb-4 [&>svg]:text-[#000000]"
        variant="simple"
      />
      <div className="text-center text-xl text-[#000000] max-w-xs font-semibold">
        {loadingText}
      </div>
    </div>
  );
};

function getBounds(places, padding = 0.005) {
  if (!places || places.length === 0) return null;

  let north = -90,
    south = 90,
    east = -180,
    west = 180;

  places.forEach(({ location }) => {
    const lat = location.lat ?? location.latitude;
    const lng = location.lng ?? location.longitude;

    if (lat > north) north = lat;
    if (lat < south) south = lat;
    if (lng > east) east = lng;
    if (lng < west) west = lng;
  });

  return {
    north: north + padding,
    south: south - padding,
    east: east + padding,
    west: west - padding,
  };
}

const BoundsController = ({ places, selectedPlace, manualDeselect }) => {
  const map = useMap();
  const prevSelectedPlace = useRef(selectedPlace);

  const smoothZoomToAll = () => {
    const bounds = getBounds(places);
    if (!bounds) return;

    const centerLat = (bounds.north + bounds.south) / 2;
    const centerLng = (bounds.east + bounds.west) / 2;

    const currentZoom = map.getZoom();
    const targetZoom = Math.max(0, currentZoom - 6);

    let zoomLevel = currentZoom;
    let panProgress = 0;
    const totalSteps = currentZoom - targetZoom;

    const currentCenter = map.getCenter();
    const startLat = currentCenter.lat();
    const startLng = currentCenter.lng();

    const latIncrement = (centerLat - startLat) / totalSteps;
    const lngIncrement = (centerLng - startLng) / totalSteps;

    const zoomInterval = setInterval(() => {
      if (zoomLevel <= targetZoom) {
        clearInterval(zoomInterval);
        setTimeout(() => {
          const googleBounds = new google.maps.LatLngBounds();
          googleBounds.extend({ lat: bounds.north, lng: bounds.east });
          googleBounds.extend({ lat: bounds.south, lng: bounds.west });
          map.fitBounds(googleBounds, { padding: 50 });
        }, 100);
        return;
      }

      panProgress++;
      const newLat = startLat + latIncrement * panProgress;
      const newLng = startLng + lngIncrement * panProgress;

      map.panTo({ lat: newLat, lng: newLng });

      zoomLevel -= 1;
      map.setZoom(zoomLevel);
    }, 150);
  };

  useEffect(() => {
    if (!map || !places || places.length === 0) return;

    if (selectedPlace) {
      const lat = selectedPlace.location.lat - 0.001;
      const lng = selectedPlace.location.lng;

      map.panTo({ lat, lng });
      map.setZoom(18);
      prevSelectedPlace.current = selectedPlace;
      return;
    }

    if (manualDeselect && prevSelectedPlace.current) {
      setTimeout(() => {
        smoothZoomToAll();
      }, 100);
      prevSelectedPlace.current = null;
      return;
    }

    if (!prevSelectedPlace.current) {
      const bounds = getBounds(places);
      if (bounds) {
        const googleBounds = new google.maps.LatLngBounds();
        googleBounds.extend({ lat: bounds.north, lng: bounds.east });
        googleBounds.extend({ lat: bounds.south, lng: bounds.west });
        map.fitBounds(googleBounds, { padding: 50 });
      }
    }

    prevSelectedPlace.current = selectedPlace;
  }, [map, places, selectedPlace, manualDeselect]);

  return null;
};

const MapCard = () => {
  const {
    accessToken,
    currentTrip,
    selectedDay,
    selectedPlace,
    setSelectedPlace,
    routes,
  } = useContext(AppContext);
  const { setExtraInfo } = useContext(ExtraInfoContext);

  const [currentPlaces, setCurrentPlaces] = useState([]);
  const [showLoading, setShowLoading] = useState(true);
  const [manualDeselect, setManualDeselect] = useState(false);
  const [visibleRouteCount, setVisibleRouteCount] = useState(0);

  useEffect(() => {
    if (currentTrip?.itinerary?.[selectedDay]?.length > 0) {
      setCurrentPlaces(currentTrip.itinerary[selectedDay]);
      setSelectedPlace(null);
      setManualDeselect(false);
    } else {
      setCurrentPlaces([]);
      setSelectedPlace(null);
      setManualDeselect(false);
    }
  }, [currentTrip, selectedDay]);

  useEffect(() => {
    if (!routes || routes.length === 0) return;

    setVisibleRouteCount(0);

    const interval = setInterval(() => {
      setVisibleRouteCount((prev) => {
        if (prev < routes.length) {
          return prev + 1;
        } else {
          clearInterval(interval);
          return prev;
        }
      });
    }, 600); // Adjust delay (ms) between routes

    return () => clearInterval(interval);
  }, [routes]);

  const handleMarkerClick = async (place) => {
    setManualDeselect(false);
    await handleDetailClick(accessToken, place, setSelectedPlace, setExtraInfo);
    setSelectedPlace(place);
  };

  const handleMapClick = () => {
    setExtraInfo({ visible: false, placeDetails: null });
    setSelectedPlace(null);
    setManualDeselect(true);
  };

  return (
    <div className="relative w-full h-full">
      <div className="w-full h-full">
        {showLoading ? (
          <MapLoadingScreen
            onLoadComplete={() => {
              setShowLoading(false);
            }}
          />
        ) : (
          <Map
            defaultZoom={16}
            defaultCenter={{
              lat: currentPlaces[0]?.location?.lat || 0,
              lng: currentPlaces[0]?.location?.lng || 0,
            }}
            mapId={"75511d602c79b2588c56c9d2"}
            disableDefaultUI={true}
            reuseMaps={true}
            onClick={handleMapClick}
          >
            <BoundsController
              places={currentPlaces}
              selectedPlace={selectedPlace}
              manualDeselect={manualDeselect}
            />

            {currentPlaces
              .sort((a, b) => a.order_index - b.order_index)
              .map((place, index) => (
                <AdvancedMarker
                  key={place.place_id}
                  position={place.location}
                  title={place.name}
                >
                  <AnimatedMarker
                    place={place}
                    index={index}
                    onClick={handleMarkerClick}
                  />
                </AdvancedMarker>
              ))}

            {routes.slice(0, visibleRouteCount).map((route, index) => (
              <RouteOverlay
                key={index}
                encodedRoute={route.polyline}
                color="#2e2e2e"
              />
            ))}
          </Map>
        )}
      </div>

      <PlaceInfoCard />
    </div>
  );
};

export default MapCard;
