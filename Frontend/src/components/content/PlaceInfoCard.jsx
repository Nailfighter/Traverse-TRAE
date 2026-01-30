import { useState, useContext } from "react";

import {
  Card,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Button,
  CardBody,
  Image,
  Chip,
} from "@heroui/react";
import {
  StarIcon,
  MapPinIcon,
  PhoneIcon,
  GlobeAsiaAustraliaIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/solid";

import { HourglassIcon } from "lucide-react";

import { ExtraInfoContext } from "./Layout";

const ImageComponent = ({ name, imageData }) => {
  return (
    <img
      className="h-50 w-full object-cover rounded-xl"
      alt={name}
      src={imageData}
    />
  );
};

const WeekdayChip = ({ day, openTime, isClosed }) => {
  return (
    <Popover placement="top" showArrow={true}>
      <PopoverTrigger>
        <div
          className={`relative inline-flex items-center justify-center p-1 font-bold text-[10px] bg-gray-200 rounded-full text-center w-5.5 h-5.5 overflow-hidden ${
            isClosed ? "text-gray-400" : ""
          }`}
        >
          {day}
          {isClosed && (
            <div className="absolute w-[95%] h-0.5 bg-gray-400 rotate-45"></div>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent>
        <div className="px-1 py-2">
          <div className="text-tiny">{openTime}</div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

const HoursOfOperation = ({ weekHours }) => {
  const parsedHours = weekHours.map((entry) => {
    const [day, timePart] = entry.split(": ");
    const isClosed = timePart.trim().toLowerCase() === "closed";

    return {
      day: day.trim().slice(0, 2),
      hoursOfOperation: isClosed ? null : timePart.trim(),
      isClosed,
    };
  });

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <HourglassIcon className="h-4.5 w-4.5" />
      {parsedHours.map(({ day, isClosed, hoursOfOperation }, index) => (
        <WeekdayChip
          key={index}
          day={day}
          isClosed={isClosed}
          openTime={hoursOfOperation || "Closed"}
        />
      ))}
    </div>
  );
};

const PlaceInfoCard = () => {
  const [isMinimised, setIsMinimized] = useState(true);
  const { extraInfo } = useContext(ExtraInfoContext);
  const placeDetails = extraInfo.placeDetails || {
    displayName: { text: "Old Main" },
    image: null,
    rating: -1,
    userRatingCount: 1000,
    internationalPhoneNumber: "+1 (332) 865-4200",
    formattedAddress: "Some Address",
    websiteUri: "https://www.psu.edu",
    postalAddress: {
      administrativeArea: "Pennsylvania",
      locality: "University Park",
    },
    types: ["historical_landmark"],
    googleMapsLinks: {
      reviewsUri:
        "https://www.google.com/maps/place//data=!4m4!3m3!1s0x89cea89efcb72baf:0xeed0826489ad38fc!9m1!1b1",
    },
    regularOpeningHours: {
      weekdayDescriptions: [
        "Monday: 8:00 AM – 5:00 PM",
        "Tuesday: 8:00 AM – 5:00 PM",
        "Wednesday: 8:00 AM – 5:00 PM",
        "Thursday: 8:00 AM – 5:00 PM",
        "Friday: 8:00 AM – 5:00 PM",
        "Saturday: Closed",
        "Sunday: Closed",
      ],
    },
    googleMapsUri: "https://maps.google.com/?cid=17208397544500836604",
  };

  return (
    extraInfo.visible && (
      <Card className="absolute bottom-4 left-4 p-2 min-w-140 max-w-170 h-auto">
        <CardBody className="overflow-visible">
          <div className="flex flex-col gap-3">
            <div>
              <div className="flex justify-between items-center gap-4">
                <h1 className="text-[24px] font-semibold leading-[1.2] ">
                  {placeDetails.displayName.text}
                </h1>
                <div className="flex items-center gap-2">
                  <a
                    href={placeDetails.googleMapsUri}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      variant="bordered"
                      className="flex items-center text-sm font-medium p-2.5  border border-bcolor rounded-full h-10"
                    >
                      <img
                        src="/google-maps.png"
                        alt="Google Maps Icon"
                        className="h-full aspect-square ml-1"
                      />
                      Open in Maps
                    </Button>
                  </a>
                  <Button
                    isIconOnly
                    variant="light"
                    size="sm"
                    onPress={() => setIsMinimized(!isMinimised)}
                    className="rounded-full p-1.5"
                  >
                    {isMinimised ? <ChevronDownIcon /> : <ChevronUpIcon />}
                  </Button>
                </div>
              </div>
              {isMinimised && placeDetails.rating && (
                <div className="flex items-center gap-1.5 text-[13px] font-medium text-gray-600">
                  <StarIcon className="h-4 w-4 text-[#fbbc04]" />
                  {placeDetails.rating}
                  <div className="w-0.5 h-0.5 bg-subcolor rounded-full shrink-0" />
                  <a
                    href={placeDetails.googleMapsLinks.reviewsUri}
                    className="antialiased transition-all hover:text-black"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {`${placeDetails.userRatingCount} Reviews`}
                  </a>
                  <div className="w-0.5 h-0.5 bg-subcolor rounded-full shrink-0" />
                  {[
                    placeDetails?.postalAddress?.locality,
                    placeDetails?.postalAddress?.administrativeArea,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </div>
              )}
            </div>

            {isMinimised && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <ImageComponent
                    name={placeDetails.name}
                    imageData={placeDetails?.image || ""}
                  />
                </div>

                <div className="flex items-center gap-2">
                  {placeDetails.types.slice(0, 2).map((type, index) => (
                    <Chip key={index} variant="shadow" className="h-6 text-xs">
                      {type
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (c) => c.toUpperCase())}
                    </Chip>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPinIcon className="h-4.5 aspect-square" />
                  <span>{placeDetails.formattedAddress}</span>
                </div>

                {placeDetails.internationalPhoneNumber && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <PhoneIcon className="ml-0.5 h-4 aspect-square" />
                    <span>{placeDetails.internationalPhoneNumber}</span>
                  </div>
                )}

                {placeDetails.websiteUri && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <GlobeAsiaAustraliaIcon className="h-4.5 aspect-square" />
                    <a
                      href={placeDetails.websiteUri}
                      className="text-blue-600 hover:underline overflow-hidden text-ellipsis whitespace-nowrap"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {placeDetails.websiteUri}
                    </a>
                  </div>
                )}

                {placeDetails.regularOpeningHours?.weekdayDescriptions?.length >
                  0 && (
                  <HoursOfOperation
                    weekHours={
                      placeDetails.regularOpeningHours.weekdayDescriptions
                    }
                  />
                )}
              </>
            )}
          </div>
        </CardBody>
      </Card>
    )
  );
};

export default PlaceInfoCard;
