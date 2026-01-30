import React from "react";
import {
  CarFront,
  Bike,
  TramFront,
  Footprints,
  MapPinPlus,
} from "lucide-react";

const TravelTime = ({ duration, distance }) => (
  <div className="flex text-[11px] items-center text-subcolor gap-1.5 font-medium w-full">
    <div className="mt-1 grow h-px bg-[radial-gradient(circle,_gray_1px,_transparent_1px)] bg-[length:4px_1px]" />
    <CarFront className="h-5 w-5 text-subcolor shrink-0" />
    {duration}
    <div className="w-0.5 h-0.5 bg-subcolor rounded-full shrink-0" />
    {distance}
    <div className="mt-1 grow h-px bg-[radial-gradient(circle,_gray_1px,_transparent_1px)] bg-[length:4px_1px]" />
  </div>
);

export default TravelTime;
