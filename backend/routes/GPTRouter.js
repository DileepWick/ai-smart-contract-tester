import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GPTRouter = express.Router();
const apiKey =  "AIzaSyAat2iMvyHFCAz-PuDS7b6slVU8EsF8ono";
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash"
  });
  
  const sessions = new Map();
  
  // Contract validation route
  GPTRouter.post('/contract/validate', async (req, res) => {
    const { apiResponse, expectedContract } = req.body;
  
    if (!apiResponse || typeof apiResponse !== 'object') {
      return res.status(400).json({ error: 'Valid API response is required' });
    }
  
    if (!expectedContract || !Array.isArray(expectedContract)) {
      return res.status(400).json({ error: 'Valid expected contract schema is required' });
    }
  
    try {
      let chatSession = sessions.get('contractValidation');
      if (!chatSession) {
        chatSession = model.startChat();
        sessions.set('contractValidation', chatSession);
      }
  
      const validationPrompt = `
        Given the following API response for a product:
        ${JSON.stringify(apiResponse, null, 2)}
  
        Validate it against the expected contract schema:
        ${JSON.stringify(expectedContract, null, 2)}
  
        If the response matches the contract, reply "Valid Contract".
        If it does not, list the missing or incorrect fields and suggest how to fix them.
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