import { askMiniMax, generateItineraryPrompt } from "./helpers/minimax.js";
import dotenv from "dotenv";
dotenv.config();

async function test() {
  console.log("Testing MiniMax API...");
  console.log("API Key length:", process.env.MINIMAX_API_KEY ? process.env.MINIMAX_API_KEY.length : "Missing");

  const tripDetails = {
    destination: "Paris",
    noOfDays: 1,
    noOfTravelers: 1,
    budget: "Medium",
    notes: "I love art and food."
  };

  const prompt = generateItineraryPrompt(tripDetails);
  console.log("Prompt generated.");

  try {
    const response = await askMiniMax(prompt);
    console.log("Response received:");
    console.log(response.text.substring(0, 500) + "..."); // Print first 500 chars
    
    // Try parsing
    try {
        const json = JSON.parse(response.text);
        console.log("JSON parsing successful!");
    } catch (e) {
        console.error("JSON parsing failed:", e);
    }

  } catch (error) {
    console.error("Error calling MiniMax:", error);
  }
}

test();
