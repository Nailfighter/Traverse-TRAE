import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const MINIMAX_URL = "https://api.minimax.io/v1/chat/completions";

export const generateItineraryPrompt = (tripDetails) => {
  const budgetOptions = {
    Low: "500 - 1000 USD",
    Medium: "1000 - 2500 USD",
    High: "2500+ USD",
  };

  const notePart = tripDetails.notes
    ? `The person has provided this note with preferences and additional information: "${tripDetails.notes}".`
    : "";

  return `
You are a professional travel planner. Create a ${tripDetails.noOfDays}-day full-day itinerary for ${tripDetails.destination}.
It should include touristy places as well as exciting and unique locations.
Be specific with location names so they can be found on Google Maps. Do not use generic names like "Broadway Show". Use specific venues.

The budget is ${budgetOptions[tripDetails.budget] || tripDetails.budget} for the whole trip.
Travelers: ${tripDetails.noOfTravelers}.
${notePart}

Output strictly valid JSON. Do not include markdown formatting like \`\`\`json. Just the raw JSON object.

The JSON structure must be exactly:
{
  "1": [
    {
      "name": "Exact Name of Place",
      "description": "Short engaging description.",
      "start": "9:00 AM",
      "end": "11:00 AM",
      "image": null,
      "geo_location": null
    },
    ...
  ],
  "2": [ ... ]
}

Guidelines:
- Keys "1", "2", etc. represent the day number.
- "name": Exact name of the point of interest. No verbs.
- "start" and "end": 12-hour format (e.g., "9:00 AM"). Times must be sequential within a day.
- "image": Always null.
- "geo_location": Always null.
`;
};

export const generatePlacePrompt = (placeName, placeDestination) => {
  return `I need information on ${placeName}, ${placeDestination} for a travel itinerary.
Output strictly valid JSON. Do not include markdown formatting.

JSON format:
{
  "name": "${placeName}",
  "description": "Engaging description or 'No description available.'",
  "start": "9:00 AM",
  "end": "10:00 AM",
  "image": null
}
`;
};

export async function askMiniMax(prompt) {
  const apiKey = process.env.MINIMAX_API_KEY;
  if (!apiKey) {
    throw new Error("MINIMAX_API_KEY is missing in environment variables.");
  }

  const response = await fetch(MINIMAX_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "MiniMax-M2.1-lightning",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that outputs strictly valid JSON. No markdown, no explanations.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.1,
      max_tokens: 4096, // Ensure enough tokens for long itineraries
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = errorText;
    try {
      const errorJson = JSON.parse(errorText);
      if (errorJson.error && errorJson.error.message) {
        errorMessage = errorJson.error.message;
      } else if (errorJson.base_resp && errorJson.base_resp.status_msg) {
        errorMessage = errorJson.base_resp.status_msg;
      }
    } catch (e) {
      // ignore json parse error
    }
    throw new Error(`MiniMax API Error: ${errorMessage}`);
  }

  const data = await response.json();
  let content = data.choices[0].message.content;

  // Fallback for Plan Restriction (Coding Plan vs Lightning)
  if (content.includes("M2.1-lightning is currently not part of Coding Plan")) {
    console.warn("MiniMax-M2.1-lightning rejected. Falling back to MiniMax-M2.1...");

    const fallbackResponse = await fetch(MINIMAX_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "MiniMax-M2.1", // Fallback model
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that outputs strictly valid JSON. No markdown, no explanations.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 4096,
      }),
    });

    if (!fallbackResponse.ok) {
      const errorText = await fallbackResponse.text();
      throw new Error(`MiniMax Fallback API Error: ${errorText}`);
    }

    const fallbackData = await fallbackResponse.json();
    content = fallbackData.choices[0].message.content;
  }

  // Remove <think> tags and their content
  content = content.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

  // Clean up any potential markdown code blocks if the model ignores instructions
  const cleanedContent = content.replace(/```(?:json)?/g, "").trim();

  return { text: cleanedContent };
}
