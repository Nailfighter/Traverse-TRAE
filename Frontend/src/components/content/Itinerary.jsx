import { useEffect, useContext, useState } from "react";
import { Button } from "@heroui/react";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

import PlaceCard from "./PlaceCard.jsx";

import { AppContext } from "../../App.jsx";
import TravelTime from "../map/TravelTime.jsx";

function formatDuration(input) {
  if (!input || typeof input !== "string") {
    return "N/A";
  }

  const totalSeconds = parseInt(input.replace(/\D/g, ""), 10);

  const minutes = Math.floor(totalSeconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 60) {
    return `${minutes} min${minutes !== 1 ? "s" : ""}`;
  } else if (hours < 24) {
    const remMinutes = minutes % 60;
    return `${hours} hr${hours !== 1 ? "s" : ""} ${remMinutes} minute${
      remMinutes !== 1 ? "s" : ""
    }`;
  } else {
    const remHours = hours % 24;
    return `${days} day${days !== 1 ? "s" : ""} ${remHours} hour${
      remHours !== 1 ? "s" : ""
    }`;
  }
}

function metersToMiles(meters) {
  if (meters == null || isNaN(meters)) return "N/A";
  const miles = meters / 1609.344;
  return `${+miles.toFixed(2)} mi`;
}

const Itinerary = () => {
  const { accessToken, currentTrip, routes, places, setPlaces, selectedDay } =
    useContext(AppContext);

  useEffect(() => {
    if (currentTrip?.itinerary) {
      const sortedPlaces = [
        ...(currentTrip.itinerary[parseInt(selectedDay)] || []),
      ]
        .filter((p) => !p.name.startsWith("🏨 ")) // Hide hotels
        .sort((a, b) => a.order_index - b.order_index);
      setPlaces(sortedPlaces);
    }
  }, [currentTrip, setPlaces]);

  const [timeInfo, showTimeInfo] = useState(true);
  const sensors = useSensors(useSensor(PointerSensor));

  const saveOrder = async (places) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/trips/places/order`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            places: places.map((place) => ({
              place_id: place.place_id,
              order_index: place.order_index,
              start_time: place.start,
              end_time: place.end,
            })),
          }),
        }
      );
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save order");
      }
    } catch (error) {
      console.error("Error saving order:", error);
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
      const oldIndex = places.findIndex(
        (place) => place.place_id === active.id
      );
      const newIndex = places.findIndex((place) => place.place_id === over.id);

      if (oldIndex === -1 || newIndex === -1) {
        console.warn("Could not find place indices for drag operation");
        return;
      }

      const newPlaces = arrayMove(places, oldIndex, newIndex);

      const originalTimes = places.map((place) => ({
        start: place.start,
        end: place.end,
      }));

      newPlaces.forEach((place, index) => {
        place.order_index = index;
        place.start = originalTimes[index].start;
        place.end = originalTimes[index].end;
      });

      setPlaces(newPlaces);
      console.log("New order:", newPlaces);
      saveOrder(newPlaces);
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-4 pt-1 ">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext
          items={places.map((p) => p.place_id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col flex-grow gap-4 h-full overflow-y-scroll overflow-hidden p-4 scrollbar-hide ">
            {places.map((place, index) => (
              <div className="flex flex-col gap-4 w-full " key={place.place_id}>
                <PlaceCard
                  index={index}
                  place={place}
                  setPlaces={setPlaces}
                  showTimeInfo={showTimeInfo}
                  places={places}
                />
                {index < places.length - 1 && timeInfo && (
                  <TravelTime
                    duration={formatDuration(routes[index]?.duration)}
                    distance={metersToMiles(routes[index]?.distance)}
                  />
                )}
              </div>
            ))}
            {places.length === 0 && (
              <div className="text-center text-gray-500">
                No places added for this day
              </div>
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default Itinerary;
