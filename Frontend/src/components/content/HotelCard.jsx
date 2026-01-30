import React from "react";
import { Button } from "@heroui/react";
import { MapPinIcon, StarIcon } from "@heroicons/react/24/solid";

const HotelCard = ({ hotel }) => {
  const cleanName = hotel.name.replace("🏨 ", "");

  // Extract rating if present in description or use a default
  const ratingMatch = hotel.description.match(/Rating: (\d+(\.\d+)?)/);
  const rating = ratingMatch ? ratingMatch[1] : "4.5";

  const handleBookClick = () => {
    const query = encodeURIComponent(cleanName);
    const url = `https://www.google.com/maps/search/?api=1&query=${query}&query_place_id=${hotel.google_place_id || hotel.id
      }`;
    window.open(url, "_blank");
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="flex flex-col sm:flex-row h-full">
        {/* Image Section */}
        {hotel.image && (
          <div className="sm:w-48 h-48 sm:h-auto shrink-0 relative">
            <img
              src={hotel.image}
              alt={cleanName}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.parentElement.style.display = "none";
              }}
            />
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 text-xs font-bold text-gray-800 shadow-sm">
              <StarIcon className="w-3 h-3 text-yellow-500" />
              {rating}
            </div>
          </div>
        )}

        {/* Content Section */}
        <div className="flex flex-col flex-grow p-5 justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-bold text-gray-900 line-clamp-1">
                {cleanName}
              </h3>
            </div>

            <p className="text-sm text-gray-500 line-clamp-2">
              {hotel.description}
            </p>

            <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
              <MapPinIcon className="w-3 h-3" />
              <span>Check-in: {hotel.start}</span>
              <span>•</span>
              <span>Check-out: {hotel.end}</span>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button
              className="bg-black text-white font-medium px-6 rounded-full hover:bg-gray-800"
              size="sm"
              onPress={handleBookClick}
            >
              Book Room
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelCard;
