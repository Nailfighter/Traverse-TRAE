# Plan: Enhance Hotel Recommendations and Update UI

I will update the hotel recommendation logic to provide a curated list of top hotels for the destination (instead of one per day) and update the UI styling as requested.

## 1. Backend: Improve Hotel Search Logic
- **Modify `Backend/helpers/hotels.js`**:
  - Create a new function `findTopHotels(destination)` that queries Google Places for "best hotels in [Destination]" and returns the top 5 results (instead of just 1).
- **Modify `Backend/routes/trips.js`**:
  - Remove the loop that adds a hotel to *every* day based on the last location.
  - Instead, perform a single call to `findTopHotels` for the overall destination.
  - Add these 5 hotels to the itinerary (storing them under Day 1 for persistence) with the "🏨 " marker. This ensures they are saved to the database but hidden from the main itinerary view by existing logic.

## 2. Frontend: Update Hotel List and Styling
- **Modify `Frontend/src/components/content/HotelList.jsx`**:
  - Remove the "Day X Recommendation" text.
  - Display the hotels as a clean, single list.
- **Modify `Frontend/src/components/content/ContentCard.jsx`**:
  - Change the active tab indicator color from Blue (`#22d3ee`) to **Black** to match the user's design preference.

## 3. Verification
- Generate a new trip to confirm:
  - The "Hotels" tab shows a list of ~5 top hotels.
  - The "Itinerary" tab remains focused on activities.
  - The tab indicator is black.