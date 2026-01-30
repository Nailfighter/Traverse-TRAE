import React, { useState, useContext } from "react";

import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";

import ContentCard from "./ContentCard";
import MapCard from "../map/MapCard";

export const ExtraInfoContext = React.createContext();

export const handleDetailClick = async (
  accessToken,
  place,
  setSelectedPlace,
  setExtraInfo
) => {
  try {
    const responsePlaceDetails = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/trips/places/${
        place.place_id
      }/details`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (!responsePlaceDetails.ok) {
      console.error("Failed to fetch place details");
      return;
    }

    const data = await responsePlaceDetails.json();
    setExtraInfo({
      visible: true,
      placeDetails: data,
    });
    setSelectedPlace(place);
  } catch (error) {
    console.error("Error fetching place details:", error);
  }
};

const Layout = ({ emptyTrips }) => {
  const [extraInfo, setExtraInfo] = useState({
    visible: false,
    placeDetails: null,
  });

  return (
    <div className="h-full overflow-hidden">
      <ExtraInfoContext.Provider value={{ extraInfo, setExtraInfo }}>
        {!emptyTrips && (
          <PanelGroup direction="horizontal">
            <Panel defaultSize={35} minSize={35}>
              <ContentCard />
            </Panel>
            <PanelResizeHandle />
            <Panel minSize={20} className="bg-gray-200">
              <MapCard />
            </Panel>
          </PanelGroup>
        )}
        {emptyTrips && <MapCard />}
      </ExtraInfoContext.Provider>
    </div>
  );
};

export default Layout;
