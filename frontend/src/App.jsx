import React, { useState } from "react";
import { Globe, Send, ServerCrash, CheckCircle, Code, FileJson, AlertCircle } from "lucide-react";
import { validateContract } from "./api";

const App = () => {
  const [sessionId] = useState("test-session-123");
  const [apiEndpoint, setApiEndpoint] = useState("");
  const [httpMethod, setHttpMethod] = useState("GET");
  const [apiResponse, setApiResponse] = useState(null);
  const [expectedContract, setExpectedContract] = useState([]);
  const [validationResult, setValidationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCallingApi, setIsCallingApi] = useState(false);

  const handleCallApi = async () => {
    setIsCallingApi(true);
    try {
      const response = await fetch(apiEndpoint, { method: httpMethod });
      const data = await response.json();
      setApiResponse(data);
    } catch (error) {
      console.error("Error calling API:", error);
      setApiResponse({ error: "Failed to fetch data from API" });
    } finally {
      setIsCallingApi(false);
    }
  };

  const handleValidateContract = async () => {
    if (!apiResponse) {
      return;
    }
    
    setIsLoading(true);
    try {
      const result = await validateContract(sessionId, apiResponse, expectedContract);
      setValidationResult(result.validationResult || result.error);
    } catch (error) {
      console.error("Error validating contract:", error);
      setValidationResult("An error occurred during validation.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleContractChange = (e) => {
    try {
      setExpectedContract(JSON.parse(e.target.value));
    } catch (error) {
      // Handle invalid JSON silently
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-center mb-8 pt-4">
          <Code className="text-blue-400 mr-3 w-8 h-8" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            AI-Powered Contract Testing
          </h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Inputs */}
          <div className="bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-gray-200 mb-5 flex items-center">
              <Globe className="mr-2 text-blue-400 w-5 h-5" />
              API Configuration
            </h2>
            
            {/* API Endpoint */}
            <div className="mb-4">
              <label htmlFor="apiEndpoint" className="text-sm font-medium text-gray-300 block mb-2">
                API Endpoint
              </label>
              <div className="relative">
                <input
                  type="url"
                  id="apiEndpoint"
                  className="w-full p-3 pl-10 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://api.example.com/endpoint"
                  value={apiEndpoint}
                  onChange={(e) => setApiEndpoint(e.target.value)}
                />
                <Globe className="absolute left-3 top-3.5 text-gray-500 w-4 h-4" />
              </div>
            </div>
            
            {/* HTTP Method */}
            <div className="mb-4">
              <label htmlFor="httpMethod" className="text-sm font-medium text-gray-300 block mb-2">
                HTTP Method
              </label>
              <select
                id="httpMethod"
                className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={httpMethod}
                onChange={(e) => setHttpMethod(e.target.value)}
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
            
            {/* Expected Contract */}
            <div className="mb-6">
              <label htmlFor="contract" className="text-sm font-medium text-gray-300 block mb-2 flex items-center">
                <FileJson className="mr-2 text-purple-400 w-4 h-4" />
                Expected Contract (JSON)
              </label>
              <textarea
                id="contract"
                className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-40"
                placeholder='Enter expected contract (JSON format)'
                defaultValue={JSON.stringify(expectedContract, null, 2)}
                onChange={handleContractChange}
              />
            </div>
            
            {/* Call API Button */}
            <div className="flex justify-center mb-4">
              <button
                onClick={handleCallApi}
                disabled={isCallingApi || !apiEndpoint}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow transition-colors duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="mr-2 w-4 h-4" />
                {isCallingApi ? "Calling API..." : "Call API"}
              </button>
            </div>
            
            {/* Validate Contract Button */}
            <div className="flex justify-center">
              <button
                onClick={handleValidateContract}
                disabled={isLoading || !apiResponse || !expectedContract}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg shadow transition-colors duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <ServerCrash className="animate-pulse mr-2 w-4 h-4" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 w-4 h-4" />
                    Validate Contract
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Right Panel - Results */}
          <div className="space-y-6">
            {/* API Response Display - Always visible */}
            <div className="bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700">
              <h3 className="text-lg font-medium text-gray-200 mb-3 flex items-center">
                <Code className="mr-2 text-blue-400 w-5 h-5" />
                API Response
              </h3>
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-700 h-64 overflow-auto">
                {apiResponse ? (
                  <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap">
                    {JSON.stringify(apiResponse, null, 2)}
                  </pre>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500 flex-col">
                    <AlertCircle className="w-10 h-10 mb-3 opacity-50" />
                    <p>No API response yet. Click "Call API" to fetch data.</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Validation Result */}
            <div className={`bg-gray-800 rounded-xl shadow-xl p-6 border ${validationResult ? 'border-purple-700' : 'border-gray-700'}`}>
              <h3 className="text-lg font-medium text-gray-200 mb-3 flex items-center">
                <CheckCircle className="mr-2 text-purple-400 w-5 h-5" />
                Validation Result
              </h3>
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-700 h-32 overflow-auto">
                {validationResult ? (
                  <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap">
                    {validationResult}
                  </pre>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    Validation results will appear here
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>AI-Powered Contract Testing Tool • v1.0.0</p>
        </div>
      </div>
    </div>
  );
};

export default App;