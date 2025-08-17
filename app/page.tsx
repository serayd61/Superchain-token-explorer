'use client';

import { useState, useEffect } from 'react';

export default function ModernHomePage() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentExample, setCurrentExample] = useState(0);

  const examples = [
    { input: "I want to earn 15% on my $10k ETH", output: "Found 3 strategies across Base & Optimism" },
    { input: "Safest way to earn on USDC", output: "Conservative lending on Aave: 6.2% APY" },
    { input: "Find arbitrage opportunities", output: "ETH price gap: 0.3% profit available" },
    { input: "Best yield farming for $50k", output: "Optimized portfolio: 18.7% projected APY" }
  ];

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentExample((prev) => (prev + 1) % examples.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <nav className="relative z-10 bg-white/5 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <span className="text-xl font-bold">🌟</span>
              </div>
              <span className="text-xl font-bold">Superchain Intent Layer</span>
            </div>
            
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="hover:text-blue-400 transition-colors">Features</a>
              <a href="#demo" className="hover:text-blue-400 transition-colors">Demo</a>
              <a href="https://github.com/serayd61/Superchain-token-explorer" className="hover:text-blue-400 transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </nav>

      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-blue-500/30 rounded-full px-6 py-2 mb-8">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">First Natural Language DeFi Interface</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-6 leading-tight">
            Tell Us What You Want,<br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">We'll Make It Happen</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            Transform complex DeFi operations into simple conversations. 
            No more navigating dozens of protocols — just say what you want to achieve.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <a href="/intent-test">
              <button className="group relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25">
                <span className="relative z-10">🚀 Try Intent Demo</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
              </button>
            </a>
            
            <button className="group bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105">
              <span>📊 View Analytics</span>
            </button>
          </div>

          <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-4xl mx-auto">
            <div className="mb-4">
              <span className="text-sm text-gray-400 uppercase tracking-wider">Live Example</span>
            </div>
            
            <div className="transition-all duration-500">
              <div className="mb-4">
                <div className="bg-white/5 rounded-lg p-4 mb-3">
                  <span className="text-blue-400">💬 User:</span>
                  <span className="ml-2 text-lg">"{examples[currentExample].input}"</span>
                </div>
                
                <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-lg p-4">
                  <span className="text-green-400">🧠 AI:</span>
                  <span className="ml-2 text-lg">{examples[currentExample].output}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-2 mt-6">
              {examples.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentExample(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentExample ? 'bg-blue-500 w-8' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-center mb-16">
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Why This Changes Everything
          </span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: "🧠",
              title: "AI-Powered Understanding",
              description: "Advanced language models understand your DeFi goals in plain English, no technical jargon required."
            },
            {
              icon: "🔗",
              title: "Cross-Chain Optimization",
              description: "Automatically finds the best opportunities across Base, Optimism, Arbitrum, and more."
            },
            {
              icon: "⚡",
              title: "Instant Strategy Generation",
              description: "Get personalized DeFi strategies in seconds, not hours of research."
            },
            {
              icon: "🛡️",
              title: "Built-in Risk Analysis",
              description: "Every recommendation includes comprehensive risk assessment and safety scores."
            },
            {
              icon: "📊",
              title: "Real-Time Data",
              description: "Live protocol data ensures you always get the most current opportunities."
            },
            {
              icon: "🎯",
              title: "Precision Matching",
              description: "Matches your exact risk tolerance, timeframe, and investment goals."
            }
          ].map((feature, index) => (
            <div
              key={index}
              className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105"
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
              <p className="text-gray-300 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="demo" className="relative z-10 bg-gradient-to-r from-blue-900/20 to-purple-900/20 backdrop-blur-sm border-y border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                See It In Action
              </span>
            </h2>
            <p className="text-xl text-gray-300">
              Try the world's first natural language DeFi interface
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-6">Just Tell Us What You Want</h3>
              <div className="space-y-4">
                {[
                  "💰 \"I want to earn 15% on my $10k ETH\"",
                  "🛡️ \"Safest way to earn on USDC with low risk\"",
                  "🔄 \"Find arbitrage opportunities over $500 profit\"",
                  "📈 \"Best yield farming strategy for my portfolio\""
                ].map((example, index) => (
                  <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors duration-300">
                    <span className="text-lg">{example}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <span className="text-sm text-gray-400">Intent Parser</span>
              </div>

              <a href="/intent-test">
                <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105">
                  🚀 Launch Interactive Demo
                </button>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { number: "7+", label: "Supported Networks" },
            { number: "50+", label: "DeFi Protocols" },
            { number: "95%", label: "Intent Accuracy" },
            { number: "∞", label: "Possibilities" }
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                {stat.number}
              </div>
              <div className="text-gray-300 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <footer className="relative z-10 bg-black/20 backdrop-blur-sm border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <span className="text-xl font-bold">🌟</span>
              </div>
              <span className="text-xl font-bold">Superchain Intent Layer</span>
            </div>
            
            <p className="text-gray-400 mb-6">
              Making DeFi accessible to everyone, one conversation at a time.
            </p>
            
            <div className="flex justify-center gap-6">
              <a href="https://github.com/serayd61/Superchain-token-explorer" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                GitHub
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Documentation
              </a>
              <a href="https://twitter.com/serayd61" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                Twitter
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
