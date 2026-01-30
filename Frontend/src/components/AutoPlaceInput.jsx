import React, { useEffect, useRef, useState } from "react";
import { Input, Listbox, ListboxItem } from "@heroui/react";

const AutoPlaceInput = ({
  destination,
  setDestination,
  destinationError,
  setDestinationError,
  disabled = false,
  noOfPredictions = 5,
  includeLocality = true,
  label = "Where are you going?",
}) => {
  const [predictions, setPredictions] = useState([]);
  const [token, setToken] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const requestIdRef = useRef(0);
  const inputRef = useRef(null);
  const listboxRef = useRef(null);

  useEffect(() => {
    const loadGoogleLibs = async () => {
      const { AutocompleteSessionToken } = await google.maps.importLibrary(
        "places"
      );
      setToken(new AutocompleteSessionToken());
    };
    loadGoogleLibs();
  }, []);

  const handleInputChange = async (value) => {
    if (disabled) return;

    setDestination(value);
    setActiveIndex(-1);

    if (!value.trim()) {
      setPredictions([]);
      return;
    }

    requestIdRef.current += 1;
    const currentRequestId = requestIdRef.current;

    const { AutocompleteSuggestion } = await google.maps.importLibrary(
      "places"
    );

    const request = {
      input: value,
      language: "en-US",
      sessionToken: token,
    };

    if (includeLocality) {
      request.includedPrimaryTypes = ["locality"];
    } else {
      request.includedPrimaryTypes = ["establishment"];
    }

    const { suggestions } =
      await AutocompleteSuggestion.fetchAutocompleteSuggestions(request);

    if (requestIdRef.current === currentRequestId) {
      setPredictions(suggestions.slice(0, noOfPredictions));
    }
  };

  const handlePredictionClick = async (placePrediction) => {
    if (disabled) return;

    try {
      const place = await placePrediction.toPlace();
      await place.fetchFields({
        fields: ["formattedAddress", "displayName"],
      });
      setDestination(
        includeLocality ? `${place.formattedAddress}` : `${place.displayName}`
      );
      setPredictions([]);
      setDestinationError(false);
      setActiveIndex(0);

      const { AutocompleteSessionToken } = await google.maps.importLibrary(
        "places"
      );
      setToken(new AutocompleteSessionToken());

      inputRef.current?.focus();
    } catch (error) {
      console.error("Error handling prediction click:", error);
    }
  };

  const handleKeyDown = (e) => {
    if (disabled || predictions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      const newIndex = activeIndex + 1;
      setActiveIndex(newIndex >= predictions.length ? 0 : newIndex);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const newIndex = activeIndex - 1;
      setActiveIndex(newIndex < 0 ? predictions.length - 1 : newIndex);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < predictions.length) {
        const selectedSuggestion = predictions[activeIndex];
        if (selectedSuggestion && selectedSuggestion.placePrediction) {
          handlePredictionClick(selectedSuggestion.placePrediction);
        }
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setPredictions([]);
      setActiveIndex(0);
    }
  };

  useEffect(() => {
    if (activeIndex >= 0 && listboxRef.current) {
      const activeItem = listboxRef.current.children[activeIndex];
      if (activeItem) {
        activeItem.scrollIntoView({ block: "nearest" });
      }
    }
  }, [activeIndex]);

  useEffect(() => {
    setActiveIndex(0);
  }, [predictions]);

  useEffect(() => {
    if (disabled) {
      setPredictions([]);
      setActiveIndex(0);
    }
  }, [disabled]);

  return (
    <div className="relative w-full">
      <Input
        name="destination"
        label={label}
        labelPlacement="outside"
        placeholder="Eg. New York, Paris, Tokyo"
        isClearable
        isRequired
        showRequiredIcon={false}
        value={destination}
        onValueChange={handleInputChange}
        isInvalid={destinationError}
        errorMessage={destinationError ? "Destination is required" : ""}
        onFocus={() => !disabled && setDestinationError(false)}
        ref={inputRef}
        autoComplete="off"
        onKeyDown={handleKeyDown}
        isDisabled={disabled}
      />

      {predictions.length > 0 && !disabled && (
        <Listbox
          aria-label="Autocomplete suggestions"
          className="absolute z-10 w-full max-h-60 mt-overflow-y-auto bg-white border border-gray-300 rounded-xl shadow-lg mt-0.5"
          items={predictions}
          ref={listboxRef}
          tabIndex={-1}
        >
          {predictions.map((suggestion, index) => (
            <ListboxItem
              key={suggestion.key}
              onAction={() => handlePredictionClick(suggestion.placePrediction)}
              className={
                index === activeIndex ? "bg-[#d4d4d8]" : "cursor-pointer"
              }
            >
              {suggestion.placePrediction.text
                .toString()
                .split(":")[1]
                ?.trim() || suggestion.placePrediction.text.toString()}
            </ListboxItem>
          ))}
        </Listbox>
      )}
    </div>
  );
};

export default AutoPlaceInput;
