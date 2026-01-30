import fetch from "node-fetch";
import { Readable } from "stream";

export async function getPlaceID(placeName, destination = "") {
  const response = await fetch(
    "https://places.googleapis.com/v1/places:searchText",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": process.env.GOOGLE_MAPS_API_KEY,
        "X-Goog-FieldMask": "places.id",
      },
      body: JSON.stringify({ textQuery: `${placeName} ${destination}` }),
    }
  );
  const data = await response.json();

  return data.places?.[0]?.id;
}

export async function getPlacePhotoAdr(placeID) {
  const response = await fetch(
    `https://places.googleapis.com/v1/places/${placeID}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": process.env.GOOGLE_MAPS_API_KEY,
        "X-Goog-FieldMask": "photos",
      },
    }
  );
  const data = await response.json();
  return data.photos?.[0];
}

export async function getPlacePhotoStream(
  placeName,
  maxHeightPx = 4000,
  maxWidthPx = 4000
) {
  try {
    const placeID = await getPlaceID(placeName);
    if (!placeID) {
      throw new Error(`Could not find place ID for "${placeName}"`);
    }

    const photoPath = await getPlacePhotoAdr(placeID);
    if (!photoPath) {
      throw new Error(`No photos found for place "${placeName}"`);
    }

    const response = await fetch(
      `https://places.googleapis.com/v1/${photoPath.name}/media?key=${process.env.GOOGLE_MAPS_API_KEY}&maxHeightPx=${maxHeightPx}&maxWidthPx=${maxWidthPx}`
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch photo for place "${placeName}" with ID "${placeID}"`
      );
    }

    return response.body;
  } catch (error) {
    console.error(`Error in getPlacePhotoStream: ${error.message}`);
    throw error;
  }
}

export async function getPlaceBannerStream(
  placeName,
  maxHeightPx = 320,
  maxWidthPx = 210
) {
  try {
    const stream = await getPlacePhotoStream(
      placeName,
      maxHeightPx,
      maxWidthPx
    );
    return { stream, contentType: "image/jpeg" };
  } catch (err) {
    return {
      error: `Could not fetch banner for "${placeName}": ${err.message}`,
    };
  }
}

export async function getPlaceDetails(placeID) {
  try {
    const response = await fetch(
      `https://places.googleapis.com/v1/places/${placeID}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": process.env.GOOGLE_MAPS_API_KEY,
          "X-Goog-FieldMask":
            "displayName.text,types,formattedAddress,googleMapsUri,googleMapsLinks.reviewsUri,regularOpeningHours.weekdayDescriptions,internationalPhoneNumber,rating,userRatingCount,websiteUri,postalAddress.locality,postalAddress.administrativeArea,types",
        },
      }
    );

    if (!response.ok) throw new Error("Place detail fetch failed");

    const data = await response.json();
    return data;
  } catch (err) {
    return { error: `Could not fetch place details: ${err.message}` };
  }
}

export async function getPlaceGeoLocation(placeID) {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?place_id=${placeID}&key=${process.env.GOOGLE_MAPS_API_KEY}`
    );
    if (!response.ok) throw new Error("Place geolocation fetch failed");
    const data = await response.json();

    const results = data.results?.[0].geometry.location;

    if (!results) throw new Error("No geolocation data found");
    return {
      lat: results.lat,
      lng: results.lng,
    };
  } catch (err) {
    return { error: `Could not fetch place geolocation: ${err.message}` };
  }
}
