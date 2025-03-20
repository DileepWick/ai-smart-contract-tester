import { useState } from "react";
import { validateContract } from "./api";

function App() {
  const [sessionId] = useState("test-session-123");

  // Sample API response and expected contract for validation
  const [apiResponse, setApiResponse] = useState({
    id: 1,
    name: "Product A",
    price: 100.0,
    stock: 50,
    category: "Electronics"
  });

  const [expectedContract] = useState([
    { field: "id", type: "number" },
    { field: "name", type: "string" },
    { field: "price", type: "number" },
    { field: "stock", type: "number" },
    { field: "category", type: "string" }
  ]);

  const [validationResult, setValidationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Handle contract validation
  const handleValidateContract = async () => {
    setIsLoading(true);
    try {
      const result = await validateContract(sessionId, apiResponse, expectedContract);
      console.log("Validation Result:", result.validationResult); // Debugging log
      setValidationResult(result.validationResult || result.error);
    } catch (error) {
      console.error("Error validating contract:", error); // Log errors
      setValidationResult("An error occurred during validation.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <div className="flex items-center justify-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            <span className="mr-2">🛠️</span>
            AI-Powered Contract Testing
          </h1>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Contract Validation</h2>
          <div className="flex justify-center">
            <button
              onClick={handleValidateContract}
              disabled={isLoading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow transition-colors duration-200 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                "Validate Contract"
              )}
            </button>
          </div>
        </div>

        {validationResult && (
          <div className="mb-8 bg-gray-50 rounded-lg border border-gray-200 p-4 animate-fade-in">
            <h3 className="text-lg font-medium text-gray-700 mb-2">Validation Result</h3>
            <div className="bg-gray-800 text-gray-100 p-4 rounded-md font-mono text-sm overflow-x-auto">
              <pre>{validationResult}</pre>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-lg font-medium text-gray-700 mb-2">API Response</h3>
            <div className="bg-white p-3 rounded-md border border-gray-200 overflow-x-auto">
              <pre className="text-xs text-gray-700">{JSON.stringify(apiResponse, null, 2)}</pre>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-lg font-medium text-gray-700 mb-2">Expected Contract</h3>
            <div className="bg-white p-3 rounded-md border border-gray-200 overflow-x-auto">
              <pre className="text-xs text-gray-700">{JSON.stringify(expectedContract, null, 2)}</pre>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-center text-gray-500 text-sm">
        AI-Powered Contract Testing Tool • v1.0.0
      </div>
    </div>
  );
}

export default App;