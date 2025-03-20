import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GPTRouter = express.Router();
const apiKey =  "AIzaSyAat2iMvyHFCAz-PuDS7b6slVU8EsF8ono";
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
    model: "gemini-2.0-pro-exp-02-05",
});

const sessions = new Map();

// Contract validation route
GPTRouter.post('/contract/validate', async (req, res) => {
  const { sessionId, apiResponse, expectedContract ,apiEndpoint ,httpMethod} = req.body;

  if (!sessionId || typeof sessionId !== 'string') {
    return res.status(400).json({ error: 'Valid sessionId is required' });
  }

  if (!apiResponse || typeof apiResponse !== 'object') {
    return res.status(400).json({ error: 'Valid API response is required' });
  }

  if (!expectedContract || !Array.isArray(expectedContract)) {
    return res.status(400).json({ error: 'Valid expected contract schema is required' });
  }

  if (!apiEndpoint || typeof apiEndpoint !== 'string') {
    return res.status(400).json({ error: 'Valid API endpoint is required' });
  }

  if (!httpMethod || typeof httpMethod !== 'string') {
    return res.status(400).json({ error: 'Valid HTTP method is required' });
  }

  try {
    let chatSession = sessions.get(sessionId);
    if (!chatSession) {
      chatSession = model.startChat();
      sessions.set(sessionId, chatSession);
    }

    const validationPrompt = `
    🏆 You are a top-level contract testing expert, following industry standards.  
  
    📌 **Details:**  
    - 🌐 API Endpoint: ${apiEndpoint}  
    - 🔄 HTTP Method: ${httpMethod}  
    - 📦 API Response: ${JSON.stringify(apiResponse, null, 2)}  
    - 📜 Contract Schema: ${JSON.stringify(expectedContract, null, 2)}  
  
    🛠️ **Contract Testing Analysis:**  
    ✅ **Matching Fields:** (List fields that match with ✅)  
    ❌ **Mismatched Fields:** (List fields that don’t match with ❌)  
    🔍 **Missing Fields:** (List missing fields with ⚠️)  
    ⚠️ **Possible Causes**  
    🔧 **How to Fix**  
  
    🎯 Keep responses **short, structured, and clear** with relevant emojis.
  `;
  
  

    const result = await chatSession.sendMessage(validationPrompt);
    const responseText = result.response.text();

    res.status(200).json({ validationResult: responseText });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      error: 'Failed to validate contract',
      message: error.message || 'An unexpected error occurred',
    });
  }
});

export default GPTRouter;
