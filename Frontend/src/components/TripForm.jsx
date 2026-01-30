import React, { useEffect, useContext, useState, use } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Button,
  Form,
  Input,
  DatePicker,
  Textarea,
  addToast,
} from "@heroui/react";
import { today, getLocalTimeZone } from "@internationalized/date";
import { motion } from "framer-motion";

import { PlusIcon } from "@heroicons/react/24/solid";
import { CurrencyDollarIcon } from "@heroicons/react/24/outline";

import AutoPlaceInput from "./AutoPlaceInput";
import { AppContext } from "../App";

const Loader = () => {
  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      <div className="flex gap-2">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="w-3 h-3 bg-black rounded-full"
            animate={{
              y: [-8, 8, -8],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 0.2,
            }}
          />
        ))}
      </div>
    </div>
  );
};

const getItinerary = async (tripDetails, accessToken) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/trips/generate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tripDetails),
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch itinerary:", error);
    return null;
  }
};

export default function TripForm() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState(today(getLocalTimeZone()));
  const [noOfDays, setNoOfDays] = useState(1);
  const [noOfTravelers, setNoOfTravelers] = useState(1);
  const [budget, setBudget] = useState("Low");
  const [preferences, setPreferences] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { accessToken, fetchData, emptyTrips, isAnnonymous } =
    useContext(AppContext);
  const [destinationError, setDestinationError] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    setIsEnabled(!isAnnonymous);
  }, [isAnnonymous]);

  useEffect(() => {
    if (emptyTrips) {
      const timeout = setTimeout(() => {
        onOpen();
      }, 700);

      return () => clearTimeout(timeout);
    }
  }, [emptyTrips, onOpen]);

  const resetFields = () => {
    setDestination("");
    setStartDate(today(getLocalTimeZone()));
    setNoOfDays(1);
    setNoOfTravelers(1);
    setBudget("Low");
    setPreferences("");
  };

  const handleButtonClick = () => {
    if (!isEnabled) {
      addToast({
        title: "Sign In Required",
        description:
          "Only one trip allowed for guest users. Please sign in to create more trips.",
        color: "warning",
      });
      return;
    }

    onOpen();
  };

  const handleTripCreation = async () => {
    if (!destination.trim()) {
      setDestinationError(true);
      return;
    }
    setDestinationError(false);

    const tripDetails = {
      title: `Trip to ${destination}`,
      destination,
      start_date: startDate.add({ days: 1 }).toString(),
      end_date: startDate.add({ days: noOfDays + 1 }).toString(),
      noOfDays,
      noOfTravelers,
      budget,
      notes: preferences,
    };

    setIsLoading(true);

    try {
      const data = await getItinerary(tripDetails, accessToken);

      if (!data || data.error) {
        addToast({
          title: "Trip Creation Failed",
          description:
            data?.error || "Failed to create your trip. Please try again.",
          color: "danger",
        });
        console.error("Failed to create trip:", data?.error || "Unknown error");
      } else {
        onClose();
        resetFields();
        fetchData();
      }
    } catch (err) {
      addToast({
        title: "Trip Creation Failed",
        description: "An unexpected error occurred. Please try again.",
        color: "danger",
      });
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (emptyTrips && isEnabled) {
        onOpen();
      }
    }, 800);

    return () => clearTimeout(timeout);
  }, [emptyTrips, isEnabled]);

  return (
    <div className="px-2 mt-6 mb-1">
      <button
        onClick={handleButtonClick}
        className={`w-full transition-all duration-200 ${
          isEnabled
            ? "button-animation swivel hover:cursor-pointer text-black hover:text-gray-700"
            : "text-gray-500 cursor-not-allowed opacity-50 hover:opacity-70"
        }`}
        disabled={isLoading}
      >
        <PlusIcon className="w-6 h-6 mx-auto" />
      </button>

      <Modal
        backdrop={"blur"}
        isOpen={isOpen}
        onClose={onClose}
        isKeyboardDismissDisabled={true}
        size="md"
        isDismissable={!emptyTrips && !isLoading}
        hideCloseButton={emptyTrips}
      >
        <ModalContent>
          {(onClose) => (
            <div>
              <ModalHeader className="flex flex-col gap-1">
                Create a New Trip
              </ModalHeader>

              <ModalBody>
                <Form
                  className="flex flex-col gap-3"
                  validationBehavior="aria"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleTripCreation();
                  }}
                >
                  <AutoPlaceInput
                    destination={destination}
                    setDestination={setDestination}
                    destinationError={destinationError}
                    setDestinationError={setDestinationError}
                    disabled={isLoading}
                  />

                  <DatePicker
                    label="When are you planning to travel?"
                    labelPlacement="outside"
                    minValue={today(getLocalTimeZone())}
                    value={startDate}
                    onChange={setStartDate}
                    isDisabled={isLoading}
                  />

                  <span className="text-sm flex gap-2 w-full justify-between items-center">
                    How many days will you travel?
                    <NumberInput
                      setNumber={setNoOfDays}
                      number={noOfDays}
                      max={7}
                      unit="days"
                      disabled={isLoading}
                    />
                  </span>

                  <span className="text-sm flex gap-2 w-full justify-between items-center">
                    How many people are traveling?
                    <NumberInput
                      setNumber={setNoOfTravelers}
                      number={noOfTravelers}
                      max={10}
                      unit="people"
                      disabled={isLoading}
                    />
                  </span>

                  <span className="text-sm w-full flex flex-col gap-2">
                    What is Your Budget?
                    <BudgetInput
                      budget={budget}
                      setBudget={setBudget}
                      disabled={isLoading}
                    />
                  </span>

                  <Textarea
                    className="w-full"
                    label="What kind of experience do you want? Any preferences?"
                    placeholder="I'd love to visit a local brewery or see a waterfall ...."
                    labelPlacement="outside"
                    isClearable
                    value={preferences}
                    onValueChange={setPreferences}
                    isDisabled={isLoading}
                  />
                </Form>
              </ModalBody>

              <ModalFooter>
                {!emptyTrips && (
                  <Button
                    color="danger"
                    variant="light"
                    onPress={onClose}
                    isDisabled={isLoading}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  type="submit"
                  variant="light"
                  className="bg-black px-3 text-[12px] font-semibold text-white hover:!bg-[#2e2e2e] ml-4"
                  onPress={handleTripCreation}
                  isLoading={isLoading}
                  isDisabled={isLoading}
                >
                  {isLoading ? "Creating Trip..." : "Create Trip"}
                </Button>
              </ModalFooter>
            </div>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}

const NumberInput = ({ setNumber, number, max, unit, disabled }) => {
  const increment = () => setNumber((c) => Math.min(max, c + 1));
  const decrement = () => setNumber((c) => Math.max(1, c - 1));

  return (
    <div className="min-w-39 flex justify-between items-center gap-2 rounded-xl p-1 py-1 w-fit text-sm font-medium text-[#81818a] bg-gray-100 hover:bg-gray-200">
      <Button
        isIconOnly
        variant="light"
        size="sm"
        onPress={decrement}
        className="text-xl text-[#a1a1aa]"
        radius="full"
        isDisabled={disabled}
      >
        −
      </Button>
      <span className="min-w-[24px] text-center">
        {number}{" "}
        {unit === "people"
          ? number === 1
            ? "person"
            : "people"
          : unit === "days"
          ? number === 1
            ? "day"
            : "days"
          : unit}
      </span>
      <Button
        isIconOnly
        variant="light"
        size="sm"
        onPress={increment}
        className="text-xl text-[#a1a1aa]"
        radius="full"
        isDisabled={disabled}
      >
        +
      </Button>
    </div>
  );
};

const BudgetInput = ({ budget, setBudget, disabled }) => {
  const budgetOptions = {
    Low: "500 - 1000 USD",
    Medium: "1000 - 2500 USD",
    High: "2500+ USD",
  };

  return (
    <div className="w-full grid grid-cols-3 gap-4">
      {Object.keys(budgetOptions).map((option, index) => (
        <div
          key={option}
          className={`w-full flex flex-col gap-1 border-2 rounded-lg p-2 ${
            disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
          } ${
            budget === option
              ? "bg-gray-200 border-gray-200"
              : "border-gray-200 hover:bg-gray-200"
          }`}
          onClick={() => !disabled && setBudget(option)}
        >
          <div className="flex items-center justify-center">
            {Array.from({ length: index + 1 }).map((_, i) => (
              <CurrencyDollarIcon
                key={i}
                className="w-[28px] aspect-square text-[#282f32]"
              />
            ))}
          </div>
          <span className="block text-xs font-semibold text-[#282f32]">
            {option}
          </span>
          <span className="text-xs font-medium text-[#81818a]">
            {budgetOptions[option]}
          </span>
        </div>
      ))}
    </div>
  );
};
