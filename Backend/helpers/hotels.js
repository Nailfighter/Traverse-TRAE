import fetch from "node-fetch";

export async function findTopHotels(destination) {
  const query = `best hotels in ${destination}`;
  console.log(`Searching for top hotels: ${query}`);

  try {
    const response = await fetch(
      "https://places.googleapis.com/v1/places:searchText",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": process.env.GOOGLE_MAPS_API_KEY,
          "X-Goog-FieldMask":
            "places.id,places.displayName.text,places.formattedAddress,places.rating,places.googleMapsUri,places.websiteUri,places.location",
        },
        body: JSON.stringify({ textQuery: query, maxResultCount: 20 }),
      }
    );

    const data = await response.json();
    if (data.places && data.places.length > 0) {
      // Return top 20 or less
      return data.places.slice(0, 20);
    }
    return [];
  } catch (error) {
    console.error("Error finding top hotels:", error);
    return [];
  }
}

export async function findHotelNear(location, destination) {
  const query = `hotel near ${location}, ${destination}`;
  console.log(`Searching for hotel: ${query}`);

  try {
    const response = await fetch(
      "https://places.googleapis.com/v1/places:searchText",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": process.env.GOOGLE_MAPS_API_KEY,
          "X-Goog-FieldMask":
            "places.id,places.displayName.text,places.formattedAddress,places.rating,places.googleMapsUri,places.websiteUri,places.location",
        },
        body: JSON.stringify({ textQuery: query }),
      }
    );

    const data = await response.json();
    console.log("Hotel Search Response:", JSON.stringify(data, null, 2));
    if (data.places && data.places.length > 0) {
      return data.places[0];
    }
    return null;
  } catch (error) {
    console.error("Error finding hotel:", error);
    return null;
  }
}
