import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function main() {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await response.json();
    console.log("--- Available Models ---");
    if (data.models) {
      data.models.forEach((m: any) => console.log(m.name));
    } else {
      console.log("No models found. Check your API key!");
      console.log(data);
    }
  } catch (error) {
    console.error("Error listing models:", error);
  }
}

main();
