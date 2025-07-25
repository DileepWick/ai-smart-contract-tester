import React, { useState } from "react";
import { Globe, Send, ServerCrash, CheckCircle, Code, FileJson, AlertCircle, Settings, X, Loader, Eye } from "lucide-react";
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

  // Schema builder functions
  const addSchemaField = () => {
    setSchemaFields([...schemaFields, { name: "", type: "string", required: false, description: "" }]);
  };

  const removeSchemaField = (index) => {
    if (schemaFields.length > 1) {
      setSchemaFields(schemaFields.filter((_, i) => i !== index));
    }
  };

  const updateSchemaField = (index, field, value) => {
    const updated = schemaFields.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    setSchemaFields(updated);
  };

  const generateContractFromSchema = () => {
    const contract = {
      type: "object",
      properties: {},
      required: schemaFields.filter(f => f.required && f.name).map(f => f.name)
    };

    schemaFields.forEach(field => {
      if (field.name) {
        contract.properties[field.name] = {
          type: field.type,
          ...(field.description && { description: field.description })
        };
      }
    });

    setExpectedContract([contract]);
  };

  // Function to handle API call
  const handleCallApi = async () => {
    setIsCallingApi(true);
    setApiResponse(null);
    try {
      const options = { method: httpMethod };
      
      if (needsRequestBody && requestBody) {
        try {
          const bodyObj = JSON.parse(requestBody);
          options.headers = { 'Content-Type': 'application/json' };
          options.body = JSON.stringify(bodyObj);
        } catch (err) {
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
    setValidationResult(null);
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
      <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-200 w-full max-w-2xl max-h-full overflow-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Globe className="mr-3 text-black w-6 h-6" />
              API Configuration
            </h2>
            <button 
              onClick={() => setShowApiConfigModal(false)} 
              className="text-gray-400 hover:text-black transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* API Endpoint */}
          <div className="mb-6">
            <label htmlFor="apiEndpoint" className="text-sm font-semibold text-gray-900 block mb-2">
              API Endpoint
            </label>
            <div className="relative">
              <input
                type="url"
                id="apiEndpoint"
                className="w-full p-3 pl-10 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                placeholder="https://api.example.com/endpoint"
                value={apiEndpoint}
                onChange={(e) => setApiEndpoint(e.target.value)}
              />
              <Globe className="absolute left-3 top-3.5 text-gray-400 w-4 h-4" />
            </div>
          </div>
          
          {/* HTTP Method */}
          <div className="mb-6">
            <label htmlFor="httpMethod" className="text-sm font-semibold text-gray-900 block mb-2">
              HTTP Method
            </label>
            <select
              id="httpMethod"
              className="w-full p-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm"
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
              <label htmlFor="requestBody" className="text-sm font-semibold text-gray-900 block mb-2 flex items-center">
                <FileJson className="mr-2 text-black w-4 h-4" />
                Request Body
              </label>
              <textarea
                id="requestBody"
                className="w-full p-3 bg-white border-2 border-gray-200 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-black h-56"
                placeholder="Enter request body (JSON format preferred)"
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
              />
            </div>
          )}
          
          {/* Footer Buttons */}
          <div className="flex flex-col sm:flex-row sm:justify-end gap-3 mt-6">
            <button
              onClick={() => setShowApiConfigModal(false)}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-xl transition-colors duration-200 w-full sm:w-auto"
            >
              Close
            </button>
            <button
              onClick={() => {
                setShowApiConfigModal(false);
                handleCallApi();
              }}
              disabled={isCallingApi || !apiEndpoint}
              className="px-6 py-3 bg-black hover:bg-gray-800 text-white font-semibold rounded-xl transition-colors duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
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
      <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-200 w-full max-w-6xl h-full max-h-screen flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <CheckCircle className="mr-3 text-black w-6 h-6" />
              Validation Result
            </h2>
            <button 
              onClick={() => setShowFullScreenResult(false)} 
              className="text-gray-400 hover:text-black transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
          </div>
          
          <div className="flex-1 bg-gray-50 rounded-xl p-6 border-2 border-gray-200 overflow-auto">
            <pre className="text-sm text-gray-900 font-mono whitespace-pre-wrap">
              {validationResult}
            </pre>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="w-full max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-center mb-8 pt-4">
          <Code className="text-black mr-3 w-8 h-8" />
          <h1 className="text-3xl font-bold text-black">
            AI-Powered CDCT 
          </h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Contract Config */}
          <div className="space-y-6">
            {/* API Configuration Summary */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-200">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <Globe className="mr-2 text-black w-5 h-5" />
                  API Configuration
                </h2>
                <button
                  onClick={() => setShowApiConfigModal(true)}
                  className="px-4 py-2 bg-black hover:bg-gray-800 text-white font-semibold rounded-xl transition-colors duration-200 flex items-center justify-center text-sm w-full sm:w-auto"
                >
                  <Settings className="mr-2 w-4 h-4" />
                  Configure API
                </button>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-100">
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 font-medium">Endpoint:</span>
                    <span className="text-gray-900 font-mono truncate max-w-xs">{apiEndpoint || "Not configured"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 font-medium">Method:</span>
                    <span className="text-gray-900 font-mono font-bold">{httpMethod}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 font-medium">Body:</span>
                    <span className="text-gray-900 font-mono">
                      {needsRequestBody 
                        ? (requestBody ? "✓ Provided" : "⚠ Not provided") 
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <button
                  onClick={handleCallApi}
                  disabled={isCallingApi || !apiEndpoint}
                  className="w-full px-4 py-3 bg-black hover:bg-gray-800 text-white font-semibold rounded-xl transition-colors duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 flex items-center mb-4">
                <FileJson className="mr-2 text-black w-5 h-5" />
                Expected Contract (JSON Schema)
              </h2>
              
              <div className="text-sm text-gray-600 mb-4">
                Define the expected API response structure in JSON format:
              </div>
              
              <textarea
                className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-black h-96"
                placeholder='Enter expected contract (JSON format)&#10;&#10;Example:&#10;{&#10;  "type": "object",&#10;  "properties": {&#10;    "id": {"type": "number"},&#10;    "name": {"type": "string"},&#10;    "email": {"type": "string"}&#10;  },&#10;  "required": ["id", "name"]&#10;}'
                defaultValue={JSON.stringify(expectedContract, null, 2)}
                onChange={handleContractChange}
              />
              
              <div className="mt-4 flex space-x-3">
                <button
                  onClick={() => {
                    try {
                      const parsed = JSON.parse(document.querySelector('textarea').value);
                      alert(`Preview:\n\n${JSON.stringify(parsed, null, 2)}`);
                    } catch (e) {
                      alert('Invalid JSON format. Please check your syntax.');
                    }
                  }}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-xl transition-colors duration-200 flex items-center justify-center"
                >
                  <Eye className="mr-2 w-4 h-4" />
                  Preview Schema
                </button>
                <button
                  onClick={handleValidateContract}
                  disabled={isLoading || !apiResponse || !expectedContract.length}
                  className="flex-1 px-4 py-3 bg-black hover:bg-gray-800 text-white font-semibold rounded-xl transition-colors duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader className="animate-spin mr-2 w-5 h-5" />
                      Validating Contract...
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
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                <Code className="mr-2 text-black w-5 h-5" />
                API Response
              </h3>
              <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-100 h-96 overflow-auto">
                {isCallingApi ? (
                  <div className="h-full flex items-center justify-center text-gray-600 flex-col">
                    <Loader className="w-12 h-12 mb-4 animate-spin text-black" />
                    <p className="text-lg font-medium">Fetching API response...</p>
                  </div>
                ) : apiResponse ? (
                  <pre className="text-xs text-gray-900 font-mono whitespace-pre-wrap">
                    {JSON.stringify(apiResponse, null, 2)}
                  </pre>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400 flex-col">
                    <AlertCircle className="w-10 h-10 mb-3 opacity-50" />
                    <p className="text-center font-medium">No API response yet</p>
                    <p className="text-center text-sm">Configure and call your API to see the response</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Validation Result */}
            <div className={`bg-white rounded-2xl shadow-lg p-6 border-2 ${validationResult ? 'border-black' : 'border-gray-200'}`}>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <CheckCircle className="mr-2 text-black w-5 h-5" />
                  Validation Result
                </h3>
                {validationResult && (
                  <button
                    onClick={() => setShowFullScreenResult(true)}
                    className="px-3 py-1 bg-black hover:bg-gray-800 text-white text-sm font-semibold rounded-lg transition-colors duration-200"
                  >
                    Full View
                  </button>
                )}
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-100 h-96 overflow-auto">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center text-gray-600 flex-col">
                    <div className="mb-4 relative">
                      <Loader className="w-16 h-16 animate-spin text-black" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ServerCrash className="w-8 h-8 text-gray-400" />
                      </div>
                    </div>
                    <p className="text-lg font-medium">Validating contract...</p>
                    <p className="text-sm text-gray-500 mt-2">This may take a moment</p>
                  </div>
                ) : validationResult ? (
                  <pre className="text-sm text-gray-900 font-mono whitespace-pre-wrap">
                    {validationResult}
                  </pre>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400 flex-col">
                    <AlertCircle className="w-10 h-10 mb-3 opacity-50" />
                    <p className="text-center font-medium">Validation results will appear here</p>
                    <p className="text-center text-sm">First call your API, then validate the contract</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p className="font-medium">AI-Powered Contract Testing Tool • v1.0.0</p>
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