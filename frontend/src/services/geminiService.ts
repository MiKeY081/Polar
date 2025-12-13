import { GoogleGenAI, Type } from "@google/genai";
import type { AdvancedMetrics, TestResult } from "@/types";

// Safely access process.env.API_KEY
// We allow bundlers to string-replace process.env.API_KEY first.
const getApiKey = () => {
  try {
    // 1. Direct check (bundler replacement usually targets this exact string)
    // @ts-ignore
    const directKey = process.env.API_KEY;
    if (directKey && typeof directKey === 'string' && !directKey.startsWith('process.env')) {
      return directKey;
    }

    // 2. Runtime check if process object exists (e.g. polyfill)
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      return process.env.API_KEY;
    }
    
    // 3. Fallback to window.process
    // @ts-ignore
    if (typeof window !== 'undefined' && window.process && window.process.env && window.process.env.API_KEY) {
      // @ts-ignore
      return window.process.env.API_KEY;
    }
  } catch (e) {
    // Ignore ReferenceError or other access errors
  }
  return '';
};

const API_KEY = getApiKey();

export const analyzePerformance = async (results: TestResult[]): Promise<AdvancedMetrics> => {
  if (!API_KEY) {
    console.warn("No API Key found. Returning mock analysis.");
    return mockAnalysis();
  }

  // Filter last 20 results for context
  const recentResults = results.slice(-20);
  
  const prompt = `
    Analyze the following cognitive test results for a user.
    The tests include Reaction Time, Pattern Recognition, Stroop, Sequence, and N-Back.
    
    Data: ${JSON.stringify(recentResults)}
    
    Based on accuracy trends, response time variability, and error consistency, estimate:
    1. Decision Confidence (0-100)
    2. Cognitive Load (0-100)
    3. Fatigue Index (0-100)
    4. Behavior Drift (0-100)
    5. A brief summary of their cognitive state.
    6. Any anomalies detected (e.g., "Sudden drop in attention during Stroop").
  `;

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            decisionConfidence: { type: Type.NUMBER },
            cognitiveLoad: { type: Type.NUMBER },
            fatigueIndex: { type: Type.NUMBER },
            behaviorDrift: { type: Type.NUMBER },
            summary: { type: Type.STRING },
            anomalies: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["decisionConfidence", "cognitiveLoad", "fatigueIndex", "behaviorDrift", "summary", "anomalies"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    
    const data = JSON.parse(text);
    return {
      ...data,
      analysisTimestamp: Date.now()
    };

  } catch (error) {
    console.error("AI Analysis failed:", error);
    return mockAnalysis();
  }
};

const mockAnalysis = (): AdvancedMetrics => ({
  decisionConfidence: 78,
  cognitiveLoad: 45,
  fatigueIndex: 22,
  behaviorDrift: 12,
  analysisTimestamp: Date.now(),
  summary: "AI Service unavailable. Simulated analysis: User shows consistent performance with slight improvement in working memory tasks.",
  anomalies: ["Minor latency spike in reaction test", "Consistent Stroop performance"]
});