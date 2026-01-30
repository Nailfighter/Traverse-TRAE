import React, { useContext } from "react";
import { AppContext } from "../../App.jsx";
import HotelCard from "./HotelCard.jsx";
import { BuildingOffice2Icon } from "@heroicons/react/24/outline";

const HotelList = () => {
  const { currentTrip } = useContext(AppContext);

  // Aggregate all hotels from the itinerary
  const hotels = [];
  if (currentTrip?.itinerary) {
    Object.keys(currentTrip.itinerary).forEach((day) => {
      const places = currentTrip.itinerary[day];
      places.forEach((place) => {
        if (place.name.startsWith("🏨 ")) {
          hotels.push({ ...place, day });
        }
      });
    });
  }

  if (hotels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
        <div className="p-4 bg-gray-50 rounded-full">
          <BuildingOffice2Icon className="w-8 h-8" />
        </div>
        <div className="text-center">
          <p className="font-medium text-gray-600">No hotels found</p>
          <p className="text-sm">Hotels will appear here once generated in your itinerary.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 pb-20 overflow-y-auto scrollbar-hide h-full">
      {hotels.map((hotel, index) => (
        <div key={`${hotel.id}-${index}`} className="flex flex-col gap-2">
          <HotelCard hotel={hotel} />
        </div>
      ))}
    </div>
  );
};

export default HotelList;
