// src/api.js
import axios from "axios";

// Backend API base URL
const API_BASE_URL = "https://ai-driven-smart-contract-testing-production.up.railway.app/api/gpt"; // Adjust if needed

// Function to validate contract (compare response with expected contract)
export const validateContract = async (sessionId, apiResponse, expectedContract ,apiEndpoint ,httpMethod) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/contract/validate`, {
      sessionId,
      apiResponse,
      expectedContract,
      apiEndpoint,
      httpMethod
    });
    return response.data;
  } catch (error) {
    console.error("Contract validation failed:", error.response?.data || error.message);
    return { error: "Failed to validate contract." };
  }
};
