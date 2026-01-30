import React, { useContext, useState } from "react";
import {
  MagnifyingGlassIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/solid";
import { Button, ToastProvider } from "@heroui/react";

import TripForm from "./TripForm";
import { AppContext } from "../App";
import { supabase } from "../RouterPage";

const ImageComponent = ({ name, imageData }) => {
  return (
    <img
      className="h-full w-full object-cover rounded-lg"
      alt={name}
      src={imageData}
    />
  );
};

const TripBox = ({
  trip,
  onHover,
  onLeave,
  isHovered,
  isSelected,
  onClick,
}) => {
  return (
    <div
      className="relative w-full h-full aspect-square cursor-pointer"
      onMouseEnter={() => onHover(trip.trip_id)}
      onMouseLeave={() => onLeave()}
    >
      <div
        className={
          isSelected
            ? `border-3 border-[#2e2e2e] rounded-xl w-full h-full button-animation`
            : "w-full h-full button-animation"
        }
      >
        <button
          variant="light"
          className="w-full h-full border-3 border-white rounded-xl hover:cursor-pointer"
          onClick={onClick}
        >
          <ImageComponent
            name={trip.destination}
            imageData={trip?.banner || ""}
          />
        </button>
      </div>

      {isHovered && (
        <div className="absolute top-[20%] left-full ml-4 rounded-2xl bg-white border border-gray-300 shadow-lg px-4 p-2 text-[13px] text-gray-900 z-50 whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[250px]">
          <div className="font-bold">{trip.destination.split(",")[0]}</div>
        </div>
      )}
    </div>
  );
};

const SideBar = () => {
  const { allUserTrips, currentTrip, setCurrentTrip, setSelectedDay } =
    useContext(AppContext);
  const [hoveredTripId, setHoveredTripId] = useState(null);

  return (
    <div className="w-18 h-screen border-r border-bcolor flex flex-col gap-1 p-[10px]">
      <div className="flex items-center justify-center">
        <PaperAirplaneIcon className="transform translate-x-0.5 rotate-[335deg] h-8 w-8" />
      </div>
      <TripForm />

      <div className="border border-gray-300 mb-5" />

      <div className="grid grid-cols-1 gap-4 w-full">
        {allUserTrips.map((trip, key) => (
          <TripBox
            key={trip.trip_id}
            trip={trip}
            onHover={setHoveredTripId}
            onLeave={() => setHoveredTripId(null)}
            isHovered={hoveredTripId === trip.trip_id}
            isSelected={currentTrip.tripHeader?.trip_id === trip.trip_id}
            onClick={() => {
              if (currentTrip.tripHeader?.trip_id === trip.trip_id) return;
              setCurrentTrip((prev) => ({
                tripHeader: allUserTrips[key],
              }));
              setSelectedDay("1");
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default SideBar;
