import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const GPTRouter = express.Router();
const apiKey = "Use Your own key";
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-thinking-exp-01-21",
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

  Perform a **strict contract validation** of the API response against the contract schema.  
  - If a **required field** is missing ❌, **fail the test** and explain why.  
  - If an **optional field** is missing ⚠️, mention it but do not fail the test.  
  - If types do not match 🎭, highlight the mismatch.  
  - If everything is correct ✅, confirm that the contract is valid

Use the following format for the response:

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
