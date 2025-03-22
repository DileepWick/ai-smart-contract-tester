import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const GPTRouter = express.Router();
const apiKey = "AIzaSyAat2iMvyHFCAz-PuDS7b6slVU8EsF8ono";
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash-8b",
});

const sessions = new Map();

// Contract validation route
GPTRouter.post("/contract/validate", async (req, res) => {
  const { sessionId, apiResponse, expectedContract, apiEndpoint, httpMethod } =
    req.body;

  if (!sessionId || typeof sessionId !== "string") {
    return res.status(400).json({ error: "Valid sessionId is required" });
  }

  if (!apiResponse || typeof apiResponse !== "object") {
    return res.status(400).json({ error: "Valid API response is required" });
  }

  if (!expectedContract || !Array.isArray(expectedContract)) {
    return res
      .status(400)
      .json({ error: "Valid expected contract schema is required" });
  }

  if (!apiEndpoint || typeof apiEndpoint !== "string") {
    return res.status(400).json({ error: "Valid API endpoint is required" });
  }

  if (!httpMethod || typeof httpMethod !== "string") {
    return res.status(400).json({ error: "Valid HTTP method is required" });
  }

  try {
    let chatSession = sessions.get(sessionId);
    if (!chatSession) {
      chatSession = model.startChat();
      sessions.set(sessionId, chatSession);
    }

    const validationPrompt = `🏆 Act like a top-tier contract testing expert! 🚀

📌 🔍 **Contract Test Details**

🌐 API Endpoint: ${apiEndpoint}
🔄 HTTP Method: ${httpMethod}
📦 API Response:
${JSON.stringify(apiResponse, null, 2)}
📜 Expected Contract:
${JSON.stringify(expectedContract, null, 2)}

🛠️ 📊 **Results**

✅/❌ Overall Result: (Pass/Fail here)

✅ Matching Fields:
(List of matching fields)

❌ Mismatched Fields:
🔹 Field Name → Expected: (value), Received: (value)
🔹 Field Name → Expected: (value), Received: (value)

⚠️ Missing Fields:
🚨 Field Name (Expected, but missing!)
🚨 Field Name (Expected, but missing!)

🤖 **AI Insights** ✨

📊 Predictive Analysis:
(Risks & breaking changes concisely)

🔧 Suggested Fixes:
🛠️ Field Name → Fix Suggestion
🛠️ Field Name → Fix Suggestion

🎯 Give short, exactly formatted answers! Plz! 🙏`;

    const result = await chatSession.sendMessage(validationPrompt);
    const responseText = result.response.text();

    res.status(200).json({ validationResult: responseText });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      error: "Failed to validate contract",
      message: error.message || "An unexpected error occurred",
    });
  }
});

export default GPTRouter;
