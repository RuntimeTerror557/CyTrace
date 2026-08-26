const { GoogleGenAI, Type } = require('@google/genai');
require('dotenv').config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        score: { 
            type: Type.INTEGER, 
            description: "A threat score from 0 to 100, where 0 is completely safe and 100 is a critical threat."
        },
        severity: { 
            type: Type.STRING, 
            description: "The severity band.",
            enum: ["Safe", "Low", "Medium", "High", "Critical"]
        },
        classification: { 
            type: Type.STRING, 
            description: "The classification label for the threat.",
            enum: ["Safe", "Spam", "Phishing", "Spoofing", "Malware", "BEC", "Credential Theft"]
        },
        reasons: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "A ranked list of human-readable reasons contributing to this score (e.g., 'SPF failed', 'Look-alike domain detected')."
        }
    },
    required: ["score", "severity", "classification", "reasons"]
};

async function generateThreatScore(features) {
    const prompt = `
You are an expert AI Email Threat Detection Engine. 
Your task is to analyze the provided email features and generate a comprehensive threat assessment.

Here are the enriched features extracted from the email:
${JSON.stringify(features, null, 2)}

Analyze these features carefully:
- Authentication (SPF/DKIM/DMARC) passes/fails.
- Header anomalies (e.g., Return-Path mismatch).
- URL/Domain indicators (e.g., typosquatting, new domain, bad reputation).
- IP Geolocation (e.g., unusual origin country, VPN/TOR).
- NLP/Content cues (e.g., urgency language, credential requests).

Output a strict JSON response containing the 'score' (0-100), 'severity' band, 'classification' label, and a 'reasons' array explaining your assessment based ONLY on the provided features.
`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: responseSchema,
                temperature: 0.2
            }
        });

        return JSON.parse(response.text);
    } catch (error) {
        console.error("Error generating threat score:", error);
        throw error;
    }
}

module.exports = {
    generateThreatScore
};
