import React, { useContext, useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Button,
  Form,
  addToast,
} from "@heroui/react";
import { MapPinPlus } from "lucide-react";
import { motion } from "framer-motion";

import AutoPlaceInput from "../AutoPlaceInput";
import { AppContext } from "../../App";

// Minimalistic Loader Component
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

export default function AddPlaceForm({ dayNumber }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [destination, setDestination] = useState("");
  const [isEnabled, setIsEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { accessToken, currentTrip, fetchData, isAnnonymous } =
    useContext(AppContext);

  const [destinationError, setDestinationError] = useState(false);

  useEffect(() => {
    setIsEnabled(!isAnnonymous);
  }, [isAnnonymous]);

  const handleAddingPlace = async () => {
    if (!isEnabled) {
      addToast({
        title: "Sign In Required",
        description:
          "Adding places is currently disabled. Please sign in to enable this feature.",
        color: "warning",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/trips/${
          currentTrip.tripHeader.trip_id
        }/itinerary`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            destination: currentTrip.tripHeader.destination,
            place_name: destination,
            day_number: dayNumber,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add place");
      }

      fetchData();
      setDestination("");
      onClose();
      addToast({
        title: "Success",
        description: "Place added to the itinerary",
        color: "success",
      });
    } catch (error) {
      console.error("Error adding place:", error);
      addToast({
        title: "Error",
        description: "Failed to add place. Please try again.",
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleButtonPress = () => {
    if (!isEnabled) {
      addToast({
        title: "Sign In Required",
        description: "Adding places is currently disabled. Please sign in to enable this feature.",
        color: "warning",
      });
      return;
    }
    onOpen();
  };

  return (
    <div>
      <Button
        variant="bordered"
        className={`flex items-center text-sm font-medium p-3 border border-bcolor rounded-full ${
          !isEnabled || isLoading
            ? "opacity-50 cursor-not-allowed bg-gray-100 text-gray-400"
            : ""
        }`}
        onPress={handleButtonPress}
        isDisabled={isLoading}
      >
        <MapPinPlus className="h-5 w-5 mr-1" />
        Add Place
      </Button>

      <Modal
        backdrop={"blur"}
        isOpen={isOpen}
        onClose={onClose}
        isKeyboardDismissDisabled={true}
        size="md"
        isDismissable={!isLoading}
      >
        <ModalContent>
          {(onClose) => (
            <div>
              <ModalHeader className="flex flex-col gap-1">
                Add a New Place
              </ModalHeader>

              <ModalBody className="h-23">
                <Form
                  className="flex flex-col gap-4"
                  validationBehavior="aria"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAddingPlace();
                  }}
                >
                  <AutoPlaceInput
                    destination={destination}
                    setDestination={setDestination}
                    destinationError={destinationError}
                    setDestinationError={setDestinationError}
                    noOfPredictions={2}
                    includeLocality={false}
                    label="Enter a place"
                    disabled={isLoading}
                  />
                </Form>
              </ModalBody>

              <ModalFooter>
                <Button
                  color="danger"
                  variant="light"
                  onPress={onClose}
                  isDisabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="light"
                  className="bg-black px-3 h-auto text-[12px] font-semibold text-white hover:!bg-[#2e2e2e] ml-4"
                  onPress={handleAddingPlace}
                  isDisabled={!isEnabled || isLoading}
                  isLoading={isLoading}
                >
                  {isLoading ? "Adding Place..." : "Add Place"}
                </Button>
              </ModalFooter>
            </div>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
