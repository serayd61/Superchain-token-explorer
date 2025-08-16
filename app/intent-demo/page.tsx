'use client';

import { useState } from 'react';

export default function IntentDemoPage() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testIntent = async () => {
    if (!input.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/intent/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput: input, userId: 'test' })
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ success: false, error: 'Failed to parse intent' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">🧠 Intent Parser Test</h1>
      
      <div className="mb-4">
        <a href="/" className="text-blue-600 hover:underline">← Back to Home</a>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Test Your Intent</h2>
        
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g., I want to earn 15% on my $10k ETH"
          className="w-full h-24 p-3 border rounded-lg mb-4"
        />
        
        <button
          onClick={testIntent}
          disabled={loading || !input.trim()}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Parsing...' : 'Parse Intent'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {[
          "I want to earn 15% on my $10k ETH",
          "Safest way to earn on USDC",
          "Find arbitrage opportunities",
          "Bridge 1000 USDC to Base"
        ].map((example, i) => (
          <button
            key={i}
            onClick={() => { setInput(example); testIntent(); }}
            className="p-3 text-left bg-gray-50 rounded-lg hover:bg-gray-100"
          >
            "{example}"
          </button>
        ))}
      </div>

      {result && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Result:</h3>
          <pre className="bg-gray-50 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
