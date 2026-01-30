import React, { use, useEffect, useState } from "react";
import { HeroUIProvider } from "@heroui/react";
import "./App.css";

import SideBar from "./components/SideBar.jsx";
import Header from "./components/Header.jsx";
import Layout from "./components/content/Layout.jsx";
import { supabase } from "./RouterPage.jsx";

import { APIProvider } from "@vis.gl/react-google-maps";
import { fetchRouteInfo } from "./components/map/Routes.jsx";
import { data } from "react-router-dom";

export const AppContext = React.createContext();

async function fetchTripItinerary(token, trip_id) {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/trips/${trip_id}/itinerary`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) {
      return { error: `Failed to fetch itinerary for trip ${trip_id}` };
    }
    const data = await response.json();
    return data;
  } catch (error) {
    return { error: error.message };
  }
}

export default function App() {
  const [accessToken, setAccessToken] = useState(null);
  const [isAnnonymous, setIsAnnonymous] = useState(false);
  const [allUserTrips, setAllUserTrips] = useState([]);
  const [currentTrip, setCurrentTrip] = useState({
    tripHeader: null,
    itinerary: null,
  });
  const [emptyTrips, setEmptyTrips] = useState(true);
  const [places, setPlaces] = useState([]);
  const [selectedDay, setSelectedDay] = useState("1");
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [routes, setRoutes] = useState([]);

  const fetchAllTrips = async (token) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/trips/`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch trips");
      }
      const allUserData = await response.json();
      setAllUserTrips(allUserData);
      setEmptyTrips(allUserData.length === 0);
      setCurrentTrip({
        tripHeader: allUserData[0],
        itinerary: null,
      });
    } catch (error) {
      console.error("Error fetching trips:", error);
    }
  };

  const fetchData = async () => {
    const session = await supabase.auth.getSession();
    const token = session.data.session.access_token;
    setAccessToken(token);

    await fetchAllTrips(token);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const fetchItinerary = async () => {
      if (currentTrip.tripHeader && accessToken) {
        const itineraryData = await fetchTripItinerary(
          accessToken,
          currentTrip.tripHeader.trip_id
        );

        if (itineraryData.error) {
          console.error("Error fetching itinerary:", itineraryData.error);
        } else {
          setCurrentTrip((prev) => ({
            ...prev,
            itinerary: itineraryData,
          }));
        }
      }
    };

    fetchItinerary();
  }, [currentTrip.tripHeader]);

  useEffect(() => {
    const fetchRoutes = async () => {
      if (currentTrip.itinerary && selectedDay) {
        const places = currentTrip.itinerary[selectedDay] || [];
        const newRoutes = [];

        for (let i = 0; i < places.length - 1; i++) {
          const origin = places[i].location;
          const destination = places[i + 1].location;

          const routeInfo = await fetchRouteInfo(origin, destination);
          if (routeInfo) {
            newRoutes.push({
              origin,
              destination,
              distance: routeInfo.distance,
              duration: routeInfo.duration,
              polyline: routeInfo.polyline,
            });
          }
        }

        setRoutes(newRoutes);
      }
    };

    fetchRoutes();
  }, [currentTrip.itinerary, selectedDay, places]);

  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <HeroUIProvider>
        <AppContext.Provider
          value={{
            currentTrip,
            setCurrentTrip,
            allUserTrips,
            accessToken,
            fetchData,
            emptyTrips,
            selectedDay,
            setSelectedDay,
            selectedPlace,
            setSelectedPlace,
            routes,
            setRoutes,
            places,
            setPlaces,
            isAnnonymous,
            setIsAnnonymous,
          }}
        >
          <div className="flex flex-row w-screen h-screen max-h-screen overflow-hidden">
            <SideBar />
            <div className="w-full h-full flex flex-col overflow-hidden">
              <Header />
              <Layout emptyTrips={emptyTrips} />
            </div>
          </div>
        </AppContext.Provider>
      </HeroUIProvider>
    </APIProvider>
  );
}
