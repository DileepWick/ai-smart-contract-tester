import React, { useState } from "react";
import { Globe, Send, ServerCrash, CheckCircle, Code, FileJson, AlertCircle, Settings, X, Loader } from "lucide-react";
import { validateContract } from "./api";

const App = () => {
  const [sessionId] = useState("test-session-123");
  const [apiEndpoint, setApiEndpoint] = useState("");
  const [httpMethod, setHttpMethod] = useState("GET");
  const [requestBody, setRequestBody] = useState("");
  const [apiResponse, setApiResponse] = useState(null);
  const [expectedContract, setExpectedContract] = useState([]);
  const [validationResult, setValidationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCallingApi, setIsCallingApi] = useState(false);
  const [showApiConfigModal, setShowApiConfigModal] = useState(false);
  const [showFullScreenResult, setShowFullScreenResult] = useState(false);

  const needsRequestBody = ["POST", "PUT", "PATCH"].includes(httpMethod);

  const handleCallApi = async () => {
    setIsCallingApi(true);
    setApiResponse(null); // Clear previous response
    try {
      const options = { method: httpMethod };
      
      if (needsRequestBody && requestBody) {
        try {
          const bodyObj = JSON.parse(requestBody);
          options.headers = { 'Content-Type': 'application/json' };
          options.body = JSON.stringify(bodyObj);
        } catch (err) {
          // If not valid JSON, try sending as plain text
          options.headers = { 'Content-Type': 'text/plain' };
          options.body = requestBody;
        }
      }

      const response = await fetch(apiEndpoint, options);
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
    setValidationResult(null); // Clear previous result
    try {
      const result = await validateContract(
        sessionId, 
        apiResponse, 
        expectedContract, 
        apiEndpoint, 
        httpMethod,
        needsRequestBody ? requestBody : null
      );
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

  // Modal for API Configuration
  const ApiConfigModal = () => {
    if (!showApiConfigModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-xl shadow-2xl p-6 border border-gray-700 w-full max-w-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-200 flex items-center">
              <Globe className="mr-2 text-blue-400 w-5 h-5" />
              API Configuration
            </h2>
            <button 
              onClick={() => setShowApiConfigModal(false)} 
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
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
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>
          
          {/* Request Body */}
          {needsRequestBody && (
            <div className="mb-6">
              <label htmlFor="requestBody" className="text-sm font-medium text-gray-300 block mb-2 flex items-center">
                <FileJson className="mr-2 text-blue-400 w-4 h-4" />
                Request Body
              </label>
              <textarea
                id="requestBody"
                className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-56"
                placeholder="Enter request body (JSON format preferred)"
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
              />
            </div>
          )}
          
          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setShowApiConfigModal(false)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg shadow transition-colors duration-200"
            >
              Close
            </button>
            <button
              onClick={() => {
                setShowApiConfigModal(false);
                handleCallApi();
              }}
              disabled={isCallingApi || !apiEndpoint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow transition-colors duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCallingApi ? (
                <>
                  <Loader className="animate-spin mr-2 w-4 h-4" />
                  Calling API...
                </>
              ) : (
                <>
                  <Send className="mr-2 w-4 h-4" />
                  Call API
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Full Screen Validation Result Modal
  const FullScreenResultModal = () => {
    if (!showFullScreenResult || !validationResult) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col items-center justify-center p-4 text-[20px]">
        <div className="bg-gray-900 rounded-xl shadow-2xl p-6 border border-purple-700 w-full max-w-6xl h-full max-h-screen flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-purple-400 flex items-center">
              <CheckCircle className="mr-3 text-purple-400 w-6 h-6" />
              Validation Result
            </h2>
            <button 
              onClick={() => setShowFullScreenResult(false)} 
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
          </div>
          
          <div className="flex-1 bg-gray-800 rounded-lg p-6 border border-gray-700 overflow-auto">
            <pre className="text-base text-gray-200 font-mono whitespace-pre-wrap">
              {validationResult}
            </pre>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-center mb-8 pt-4">
          <Code className="text-blue-400 mr-3 w-8 h-8" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            AI-Driven Contract Testing
          </h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Contract Config */}
          <div className="space-y-6">
            {/* API Configuration Summary */}
            <div className="bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-200 flex items-center">
                  <Globe className="mr-2 text-blue-400 w-5 h-5" />
                  API Summary
                </h2>
                <button
                  onClick={() => setShowApiConfigModal(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow transition-colors duration-200 flex items-center justify-center"
                >
                  <Settings className="mr-2 w-4 h-4" />
                  Configure API
                </button>
              </div>
              
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Endpoint:</span>
                    <span className="text-gray-200 font-mono truncate max-w-xs">{apiEndpoint || "Not set"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Method:</span>
                    <span className="text-gray-200 font-mono">{httpMethod}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Body:</span>
                    <span className="text-gray-200 font-mono">
                      {needsRequestBody 
                        ? (requestBody ? "Provided" : "Not provided") 
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex">
                <button
                  onClick={handleCallApi}
                  disabled={isCallingApi || !apiEndpoint}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow transition-colors duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCallingApi ? (
                    <>
                      <Loader className="animate-spin mr-2 w-5 h-5" />
                      Calling API...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 w-5 h-5" />
                      Call API
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {/* Expected Contract */}
            <div className="bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700">
              <label htmlFor="contract" className="text-xl font-semibold text-gray-200 block mb-4 flex items-center">
                <FileJson className="mr-2 text-purple-400 w-5 h-5" />
                Expected Contract (JSON)
              </label>
              <textarea
                id="contract"
                className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-96"
                placeholder='Enter expected contract (JSON format)'
                defaultValue={JSON.stringify(expectedContract, null, 2)}
                onChange={handleContractChange}
              />
              
              <div className="mt-4">
                <button
                  onClick={handleValidateContract}
                  disabled={isLoading || !apiResponse || !expectedContract}
                  className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg shadow transition-colors duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader className="animate-spin mr-2 w-5 h-5" />
                      Validating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 w-5 h-5" />
                      Validate Contract
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          {/* Right Panel - Results */}
          <div className="space-y-6">
            {/* API Response Display */}
            <div className="bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-gray-200 mb-3 flex items-center">
                <Code className="mr-2 text-blue-400 w-5 h-5" />
                API Response
              </h3>
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-700 h-96 overflow-auto">
                {isCallingApi ? (
                  <div className="h-full flex items-center justify-center text-gray-300 flex-col">
                    <Loader className="w-12 h-12 mb-4 animate-spin text-blue-400" />
                    <p className="text-lg">Fetching API response...</p>
                  </div>
                ) : apiResponse ? (
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
            
            {/* Validation Result - With Expandable Option */}
            <div className={`bg-gray-800 rounded-xl shadow-xl p-6 border ${validationResult ? 'border-purple-700' : 'border-gray-700'}`}>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xl font-semibold text-gray-200 flex items-center">
                  <CheckCircle className="mr-2 text-purple-400 w-5 h-5" />
                  Validation Result
                </h3>
                {validationResult && (
                  <button
                    onClick={() => setShowFullScreenResult(true)}
                    className="px-3 py-1 bg-purple-700 hover:bg-purple-600 text-white text-sm font-medium rounded-lg shadow transition-colors duration-200"
                  >
                    Expand View
                  </button>
                )}
              </div>
              
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-700 h-96 overflow-auto">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center text-gray-300 flex-col">
                    <div className="mb-4 relative">
                      <Loader className="w-16 h-16 animate-spin text-purple-500" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ServerCrash className="w-8 h-8 text-purple-300" />
                      </div>
                    </div>
                    <p className="text-lg">Validating contract...</p>
                    <p className="text-sm text-gray-500 mt-2">This may take a moment</p>
                  </div>
                ) : validationResult ? (
                  <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap">
                    {validationResult}
                  </pre>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500 flex-col">
                    <AlertCircle className="w-10 h-10 mb-3 opacity-50" />
                    <p>Validation results will appear here after you validate the contract</p>
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
      
      {/* API Configuration Modal */}
      <ApiConfigModal />
      
      {/* Full Screen Validation Result Modal */}
      <FullScreenResultModal />
    </div>
  );
};

export default App;