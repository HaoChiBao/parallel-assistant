
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("Error: GEMINI_API_KEY is not set in environment variables.");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: apiKey });

async function testModel() {
  try {
    console.log("Testing Gemini 3 Pro Preview...");
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: "Hello! Please confirm you are Gemini 3.",
    });
    console.log("Gemini Response:");
    console.log(response)
    console.log(response.text);
  } catch (error) {
    console.error("Error connecting to Gemini API:", error);
  }
}

testModel();
