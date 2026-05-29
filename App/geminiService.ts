
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export async function getParkingGuide(locationName: string, slotId: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide a detailed, professional navigation guide for a user who has just reserved parking slot "${slotId}" at "${locationName}". 
      Explain the typical entry process with FasTag/RFID, how to reach the reserved level, and the significance of the "ParkSense" digital indicator at the slot. 
      Keep the tone helpful and concise. Structure it with bullet points.`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Proceed to the main entrance. Your FasTag will be scanned automatically. Follow the internal signage to your reserved level and slot.";
  }
}

export interface GroundingResult {
  text: string;
  links: { title: string; uri: string }[];
}

export async function searchParking(query: string, coords?: { latitude: number, longitude: number }): Promise<GroundingResult> {
  try {
    const config: any = {
      tools: [{ googleMaps: {} }],
    };

    if (coords) {
      config.toolConfig = {
        retrievalConfig: {
          latLng: {
            latitude: coords.latitude,
            longitude: coords.longitude
          }
        }
      };
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview", // Maps grounding requires 2.5 series
      contents: `Find parking locations or venues with parking near: ${query}. Provide a brief summary of the best options.`,
      config,
    });

    const text = response.text || "No specific details found for this search.";
    const links: { title: string; uri: string }[] = [];

    // Extract grounding chunks for links
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    chunks.forEach((chunk: any) => {
      if (chunk.maps) {
        links.push({
          title: chunk.maps.title || "View on Google Maps",
          uri: chunk.maps.uri
        });
      }
    });

    return { text, links };
  } catch (error) {
    console.error("Search Error:", error);
    return { 
      text: "Could not fetch real-time parking data. Please try again or search manually.", 
      links: [] 
    };
  }
}
