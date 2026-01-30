import React, { use, useContext, useEffect, useState } from "react";
import { CalendarDaysIcon } from "@heroicons/react/24/solid";

import AddPlaceForm from "./AddPlaceForm.jsx";
import Itinerary from "./Itinerary.jsx";
import HotelList from "./HotelList.jsx";
import { AppContext } from "../../App.jsx";
import { Tabs, Tab, ToastProvider } from "@heroui/react";

const ImageComponent = ({ name, imageData }) => {
  return (
    <img className="w-full h-full object-cover" alt={name} src={imageData} />
  );
};

const DayTabs = ({ fullItinerary, selectedDay, setSelectedDay }) => {
  const { setPlaces } = useContext(AppContext);
  const days = Object.keys(fullItinerary);

  return (
    <Tabs
      selectedKey={selectedDay}
      onSelectionChange={(key) => {
        setSelectedDay(key);
        const sortedPlaces = [...(fullItinerary[Number(key)] || [])].sort(
          (a, b) => a.order_index - b.order_index
        );
        setPlaces(sortedPlaces);
      }}
      radius="full"
      variant="solid"
      className="w-full"
      classNames={{
        tabList: "flex w-full gap-1",
        tab: "flex-1 justify-center",
      }}
    >
      {days.map((day) => (
        <Tab key={day} title={`Day ${day}`} />
      ))}
    </Tabs>
  );
};

function formattedDate(date) {
  if (!date) return "No date provided";

  return new Date(date)
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
    .replace(/ (\d{4})$/, ", $1");
}

const ContentCard = () => {
  const { currentTrip, selectedDay, setSelectedDay, setPlaces } = useContext(AppContext);
  const tripHeader = currentTrip.tripHeader;
  const [noOfDays, setNoOfDays] = useState(0);
  const [activeTab, setActiveTab] = useState("itinerary");

  useEffect(() => {
    if (activeTab === "hotels" && currentTrip?.itinerary) {
      const allHotels = [];
      Object.keys(currentTrip.itinerary).forEach((day) => {
        const places = currentTrip.itinerary[day];
        places.forEach((place) => {
          if (place.name.startsWith("🏨 ")) {
            allHotels.push({ ...place, day });
          }
        });
      });
      setPlaces(allHotels);
    } else if (activeTab === "itinerary" && currentTrip?.itinerary) {
      const sortedPlaces = [
        ...(currentTrip.itinerary[parseInt(selectedDay)] || []),
      ]
        .filter((p) => !p.name.startsWith("🏨 "))
        .sort((a, b) => a.order_index - b.order_index);
      setPlaces(sortedPlaces);
    }
  }, [activeTab, currentTrip, selectedDay, setPlaces]);

  useEffect(() => {
    if (tripHeader?.start_date && tripHeader?.end_date) {
      const startDate = new Date(tripHeader.start_date);
      const endDate = new Date(tripHeader.end_date);
      const diffTime = Math.abs(endDate - startDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setNoOfDays(diffDays);
    }
  }, [tripHeader]);

  return (
    <div className="flex flex-col h-full max-h-full overflow-hidden ">
      <div className="relative flex-grow-0 w-full h-70">
        <ImageComponent
          name={tripHeader?.destination}
          imageData={tripHeader?.banner || ""}
        />
        <div className="absolute top-0 left-0 w-full h-full bg-black opacity-40"></div>
        <div className="absolute bottom-0 w-full text-white font-bold text-4xl p-4">
          {`${noOfDays} ${noOfDays > 1 ? "Days" : "Day"} in ${tripHeader?.destination
            }`}
          <div className="text-lg font-light flex  mt-2 gap-2">
            <CalendarDaysIcon className="h-6 aspect-square inline" />
            {formattedDate(tripHeader?.start_date)} -{" "}
            {formattedDate(tripHeader?.end_date)}
          </div>
        </div>
      </div>
      <div className="flex flex-col flex-grow gap-4 p-5 pb-0 h-full overflow-hidden">
        <div className="flex items-center justify-between">
          <Tabs
            selectedKey={activeTab}
            onSelectionChange={setActiveTab}
            color="primary"
            variant="underlined"
            classNames={{
              tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
              cursor: "w-full bg-black",
              tab: "max-w-fit px-0 h-12",
              tabContent: "group-data-[selected=true]:text-black font-bold text-lg"
            }}
          >
            <Tab key="itinerary" title="Itinerary" />
            <Tab key="hotels" title="Hotels" />
          </Tabs>
          {activeTab === "itinerary" && (
            <AddPlaceForm dayNumber={selectedDay} />
          )}
        </div>

        {activeTab === "itinerary" && (
          <DayTabs
            fullItinerary={currentTrip?.itinerary || { 1: [] }}
            selectedDay={selectedDay}
            setSelectedDay={setSelectedDay}
          />
        )}

        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {activeTab === "itinerary" ? <Itinerary /> : <HotelList />}
        </div>
      </div>
    </div>
  );
};

export default ContentCard;
