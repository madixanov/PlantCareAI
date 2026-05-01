'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AIAssistantPage() {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI plant care assistant. Ask me anything about plant care, and I\'ll help you keep your plants healthy and thriving! 🌱',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    // Add user message
    const userMessage = { role: 'user' as const, content: question };
    setMessages(prev => [...prev, userMessage]);
    setQuestion('');
    setIsLoading(true);

    // Simulate AI response (UI only - no actual AI logic)
    setTimeout(() => {
      const aiResponse = {
        role: 'assistant' as const,
        content: `Thank you for your question! This is a placeholder response. In the full implementation, this would connect to the AI backend to provide personalized plant care advice based on your specific plants and their care history.\n\nFor now, here are some general tips:\n\n• Most houseplants prefer bright, indirect light\n• Water when the top inch of soil feels dry\n• Ensure proper drainage to prevent root rot\n• Fertilize during the growing season (spring/summer)\n\nTo get specific advice for your plants, please visit the individual plant detail pages where you can ask questions about specific plants in your collection.`,
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const quickQuestions = [
    'How often should I water my plants?',
    'What are signs of overwatering?',
    'How much light do houseplants need?',
    'When should I fertilize my plants?',
    'How do I prevent pests?',
  ];

  const handleQuickQuestion = (q: string) => {
    setQuestion(q);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Plant Assistant</h1>
        <p className="text-gray-600">
          Get expert advice on plant care powered by AI
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chat Area */}
        <div className="lg:col-span-2">
          <div className="card flex flex-col h-[600px]">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.role === 'user'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex items-center mb-2">
                        <span className="text-2xl mr-2">🤖</span>
                        <span className="font-semibold text-sm">AI Assistant</span>
                      </div>
                    )}
                    <p className="whitespace-pre-line text-sm">{message.content}</p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Form */}
            <div className="border-t border-gray-200 p-4">
              <form onSubmit={handleSubmit} className="flex space-x-2">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask about plant care..."
                  className="flex-1 input-field"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !question.trim()}
                  className="btn-primary"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Questions */}
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Questions</h3>
            <div className="space-y-2">
              {quickQuestions.map((q, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickQuestion(q)}
                  className="w-full text-left text-sm text-gray-700 hover:text-primary-600 hover:bg-primary-50 p-3 rounded-lg transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Info Card */}
          <div className="card p-6">
            <div className="flex items-start mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-xl">💡</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Pro Tip</h3>
                <p className="text-sm text-gray-600">
                  For more accurate advice, ask questions about specific plants from your collection on their detail pages.
                </p>
              </div>
            </div>
            <Link href="/plants" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View My Plants →
            </Link>
          </div>

          {/* Features */}
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-4">AI Features</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">✓</span>
                <span>Context-aware responses based on your plants</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">✓</span>
                <span>Care history analysis</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">✓</span>
                <span>Species-specific recommendations</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">✓</span>
                <span>Problem diagnosis and solutions</span>
              </li>
            </ul>
          </div>

          {/* Note */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-yellow-900 mb-1">Demo Mode</p>
                <p className="text-sm text-yellow-700">
                  This is a UI demonstration. Full AI integration will be available in the complete implementation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
