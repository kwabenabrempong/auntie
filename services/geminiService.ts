
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ExtractedMedicalInfo } from '../types';

if (!process.env.API_KEY) {
  // In a real app, this would be a more robust check,
  // but for this environment we assume it's set.
  console.warn("API_KEY environment variable not set. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const model = 'gemini-2.5-flash-preview-04-17';

export async function analyzeMedicalNotes(notes: string): Promise<ExtractedMedicalInfo> {
  const prompt = `
You are a highly trained medical data extraction AI. Analyze the following unstructured clinical notes and extract the key information into a valid JSON object. The JSON object must conform to this exact structure:
{ 
  "vitals": { "bloodPressure": "string", "heartRate": "string", "temperature": "string", "respiratoryRate": "string" }, 
  "history": "string",
  "principalComplaints": "string",
  "treatmentPlan": "string",
  "prescriptions": [{ "drugName": "string", "formulation": "string", "strength": "string", "dose": "string", "frequency": "string", "roa": "string" }],
  "diagnosis": [{ "name": "string" }]
}

If a piece of information is not present in the notes, use "N/A" for strings or an empty array for lists. For "prescriptions", extract the drug name, formulation (like Tablet or Capsule), strength (like 500mg), dose, frequency, and route of administration (ROA). For "diagnosis", extract the name of the medical condition.

Notes:
---
${notes}
---
`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    
    return JSON.parse(jsonStr) as ExtractedMedicalInfo;
  } catch (error) {
    console.error("Error analyzing medical notes:", error);
    throw new Error("Failed to parse medical notes. The AI model may have returned an unexpected format.");
  }
}


export async function generatePatientSummary(notes: string): Promise<string> {
  const prompt = `
You are a helpful medical assistant. Please provide a concise, easy-to-read summary of the following patient visit notes. The summary should be suitable for a doctor to quickly understand the key points of the visit. Focus on the chief complaint, key findings, diagnosis, and treatment plan. Use bullet points for clarity.

Patient Notes:
---
${notes}
---
`;
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating patient summary:", error);
    throw new Error("Failed to generate patient summary.");
  }
}
