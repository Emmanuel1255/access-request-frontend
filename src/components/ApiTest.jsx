// src/components/ApiTest.jsx
import React, { useState, useEffect } from 'react';
import { runApiTests } from '../utils/apiTest';

const ApiTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const results = await runApiTests();
    setTestResults(results);
    setLoading(false);
  };

  useEffect(() => {
    // Auto-run tests when component mounts (for development)
    runTests();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>API Connection Test</h2>
      <button onClick={runTests} disabled={loading}>
        {loading ? 'Running Tests...' : 'Run Tests Again'}
      </button>
      
      <div style={{ marginTop: '20px' }}>
        {testResults.map((result, index) => (
          <div key={index} style={{ 
            margin: '10px 0', 
            padding: '10px', 
            backgroundColor: result.status === 'PASS' ? '#d4edda' : '#f8d7da',
            border: `1px solid ${result.status === 'PASS' ? '#c3e6cb' : '#f5c6cb'}`,
            borderRadius: '4px'
          }}>
            <strong>{result.test}:</strong> {result.status}
            {result.error && <div>Error: {result.error}</div>}
            {result.note && <div>Note: {result.note}</div>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApiTest;