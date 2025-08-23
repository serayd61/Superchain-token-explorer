'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { askDeFiAI } from '../lib/github-ai';
import {
  MessageSquare,
  Send,
  Sparkles,
  TrendingUp,
  Zap,
  DollarSign,
  ArrowUpDown,
  Shield,
  Bot,
  User
} from 'lucide-react';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface QuickAction {
  label: string;
  query: string;
  icon: string;
  category: 'yield' | 'trade' | 'bridge' | 'analyze';
}

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "👋 Hi! I'm your DeFi AI assistant powered by GitHub Models. I can help you with yield farming, token analysis, bridging, and trading strategies across Base, Optimism, and other L2s. What would you like to explore?",
      role: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickActions: QuickAction[] = [
    {
      label: 'Find best yield opportunities',
      query: 'What are the best yield farming opportunities right now on Base and Optimism?',
      icon: '💰',
      category: 'yield'
    },
    {
      label: 'Analyze a token',
      query: 'Can you analyze USDC on Base chain and tell me about DeFi opportunities?',
      icon: '🔍',
      category: 'analyze'
    },
    {
      label: 'Best swap prices',
      query: 'Where can I get the best price to swap 1 ETH to USDC on Layer 2?',
      icon: '🔄',
      category: 'trade'
    },
    {
      label: 'Bridge assets',
      query: 'What\'s the cheapest way to bridge ETH from Ethereum to Base?',
      icon: '🌉',
      category: 'bridge'
    },
    {
      label: 'Risk assessment',
      query: 'What are the risks of using Aerodrome DEX on Base for yield farming?',
      icon: '⚠️',
      category: 'analyze'
    },
    {
      label: 'L2 comparison',
      query: 'Compare Base, Optimism, and Arbitrum for DeFi. Which is best for beginners?',
      icon: '📊',
      category: 'analyze'
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (messageContent: string = input) => {
    if (!messageContent.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageContent.trim(),
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await askDeFiAI(messageContent);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI Chat error:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "🤖 I'm having trouble connecting right now. Here's a general DeFi tip: Always start with small amounts and well-established protocols like Compound or Aave before exploring higher-yield opportunities. DYOR and never invest more than you can afford to lose!",
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: QuickAction) => {
    handleSend(action.query);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'yield': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'trade': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'bridge': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'analyze': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="h-[600px] flex flex-col">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                AI DeFi Assistant
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Powered by GitHub Models
                </Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Get instant DeFi advice, yield strategies, and L2 insights
              </p>
            </div>
          </div>
        </CardHeader>

        {/* Messages Area */}
        <CardContent className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user' 
                      ? 'bg-blue-500' 
                      : 'bg-gradient-to-r from-purple-500 to-blue-500'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className={`rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-muted'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-xs mt-1 opacity-70`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length <= 1 && (
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-3">Quick actions to get started:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(action)}
                    className="flex items-center gap-2 p-3 text-left rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-lg">{action.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{action.label}</p>
                    </div>
                    <Badge variant="secondary" className={getCategoryColor(action.category)}>
                      {action.category}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Ask about DeFi, yields, tokens, bridging..."
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background"
              disabled={isLoading}
            />
            <Button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="px-4"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Features Info */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <h4 className="font-medium">Yield Analysis</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Real-time APY tracking across 50+ DeFi protocols on 6 L2 networks
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-blue-500" />
            <h4 className="font-medium">Risk Assessment</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Smart contract audits, liquidity analysis, and safety scoring
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <ArrowUpDown className="w-4 h-4 text-purple-500" />
            <h4 className="font-medium">Multi-Chain</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Cross-chain strategies for Base, Optimism, Arbitrum, and more
          </p>
        </Card>
      </div>
    </div>
  );
}