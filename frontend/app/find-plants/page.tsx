'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PlantRecommendation, RecommendRequest } from '@/types';

export default function FindPlantsPage() {
  // New API state structure
  const [conditions, setConditions] = useState<RecommendRequest>({
    light: 'medium',
    temperature: 22,
    humidity: 'medium',
    windowDirection: 'south',
    experienceLevel: 'beginner'
  });
  const [recommendations, setRecommendations] = useState<PlantRecommendation[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);

  // Handle form submission
  const handleGenerateRecommendations = async () => {
    setLoading(true);
    setError('');
    setShowRecommendations(false);
    
    try {
      const response = await fetch('/api/recommend-plants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(conditions),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to get recommendations');
      }

      const data = await response.json();
      setRecommendations(data.recommendations || []);
      setShowRecommendations(true);
    } catch (err) {
      console.error('Error getting recommendations:', err);
      setError(err instanceof Error ? err.message : 'Failed to get recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-700 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'hard': return 'text-red-700 bg-red-50 border-red-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getLightEmoji = (level: string) => {
    switch (level) {
      case 'low': return '🌑';
      case 'medium': return '☁️';
      case 'bright': return '☀️';
      default: return '💡';
    }
  };

  const getHumidityEmoji = (level: string) => {
    switch (level) {
      case 'low': return '🏜️';
      case 'medium': return '💧';
      case 'high': return '💦';
      default: return '💧';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl mb-6 shadow-xl float-animation">
            <span className="text-4xl">🔍</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Discover Your Perfect Plants
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Tell us about your space and get AI-powered personalized plant recommendations ranked from best to worst
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Room Conditions Form */}
          <div className="lg:col-span-1">
            <div className="card p-8 sticky top-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
                  <span className="text-xl">🏠</span>
                </div>
                <h3 className="font-bold text-gray-900 text-xl">Room Conditions</h3>
              </div>
              
              <div className="space-y-6">
                {/* Light Level */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    {getLightEmoji(conditions.light)} Light Level
                  </label>
                  <select
                    value={conditions.light}
                    onChange={(e) => setConditions(prev => ({ ...prev, light: e.target.value as any }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-sm"
                  >
                    <option value="low">🌑 Low Light</option>
                    <option value="medium">☁️ Medium Light</option>
                    <option value="bright">☀️ Bright Light</option>
                  </select>
                </div>

                {/* Temperature */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    🌡️ Temperature (°C)
                  </label>
                  <input
                    type="number"
                    value={conditions.temperature}
                    onChange={(e) => setConditions(prev => ({ ...prev, temperature: Number(e.target.value) }))}
                    min="0"
                    max="50"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">Typical room: 18-24°C</p>
                </div>

                {/* Humidity */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    {getHumidityEmoji(conditions.humidity)} Humidity
                  </label>
                  <select
                    value={conditions.humidity}
                    onChange={(e) => setConditions(prev => ({ ...prev, humidity: e.target.value as any }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-sm"
                  >
                    <option value="low">🏜️ Low Humidity</option>
                    <option value="medium">💧 Medium Humidity</option>
                    <option value="high">💦 High Humidity</option>
                  </select>
                </div>

                {/* Window Direction */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    🧭 Window Direction
                  </label>
                  <select
                    value={conditions.windowDirection}
                    onChange={(e) => setConditions(prev => ({ ...prev, windowDirection: e.target.value as any }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-sm"
                  >
                    <option value="north">⬆️ North</option>
                    <option value="south">⬇️ South</option>
                    <option value="east">➡️ East</option>
                    <option value="west">⬅️ West</option>
                    <option value="none">🚫 No Window</option>
                  </select>
                </div>

                {/* Experience Level */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    👤 Experience Level
                  </label>
                  <select
                    value={conditions.experienceLevel}
                    onChange={(e) => setConditions(prev => ({ ...prev, experienceLevel: e.target.value as any }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-sm"
                  >
                    <option value="beginner">🌱 Beginner</option>
                    <option value="intermediate">🌿 Intermediate</option>
                    <option value="expert">🌳 Expert</option>
                  </select>
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleGenerateRecommendations}
                  disabled={loading}
                  className="btn-primary w-full text-lg py-4"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Generate Recommendations
                    </span>
                  )}
                </button>

                {/* Error Display */}
                {error && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                    <p className="text-sm text-red-800 font-medium">{error}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recommendations Display */}
          <div className="lg:col-span-2">
            {!showRecommendations && !loading && (
              <div className="card-glass p-16 text-center">
                <div className="relative w-32 h-32 mx-auto mb-8">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-200 to-teal-200 rounded-full blur-2xl opacity-50 animate-pulse"></div>
                  <div className="relative w-32 h-32 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center float-animation">
                    <span className="text-7xl">🌱</span>
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">Ready to Discover?</h3>
                <p className="text-lg text-gray-600 mb-10 max-w-md mx-auto leading-relaxed">
                  Fill out the room conditions and click "Generate Recommendations" to get AI-powered plant suggestions ranked from best to worst.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <span className="badge badge-success text-sm px-4 py-2">🤖 AI-Powered</span>
                  <span className="badge badge-success text-sm px-4 py-2">🏆 Ranked Results</span>
                  <span className="badge badge-success text-sm px-4 py-2">💡 Expert Tips</span>
                </div>
              </div>
            )}

            {showRecommendations && recommendations.length > 0 && (
              <div className="space-y-6">
                {/* Plant Recommendations */}
                {recommendations.map((plant, index) => (
                  <div 
                    key={index} 
                    className={`card hover-lift fade-in ${plant.rank === 1 ? 'border-2 border-emerald-500 shadow-2xl' : ''}`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="p-8">
                      {/* Rank Badge */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          {plant.rank === 1 ? (
                            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg flex items-center space-x-2">
                              <span>🌟</span>
                              <span>Best Choice</span>
                            </div>
                          ) : (
                            <div className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-semibold text-sm">
                              #{plant.rank}
                            </div>
                          )}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getDifficultyColor(plant.difficulty)}`}>
                          {plant.difficulty}
                        </span>
                      </div>

                      {/* Plant Name */}
                      <h4 className="text-2xl font-bold text-gray-900 mb-3">{plant.name}</h4>

                      {/* Why it fits */}
                      <div className="mb-4">
                        <h5 className="font-semibold text-gray-900 mb-2 flex items-center text-sm">
                          <span className="mr-2">✨</span>
                          Why it's perfect for your room
                        </h5>
                        <p className="text-sm text-gray-700 leading-relaxed">{plant.reason}</p>
                      </div>

                      {/* Benefits */}
                      <div className="mb-4">
                        <h5 className="font-semibold text-gray-900 mb-2 flex items-center text-sm">
                          <span className="mr-2">🌟</span>
                          Benefits
                        </h5>
                        <ul className="space-y-1.5">
                          {plant.benefits.map((benefit, idx) => (
                            <li key={idx} className="text-sm text-gray-600 flex items-start">
                              <span className="text-emerald-600 mr-2 mt-0.5">•</span>
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Care Tips */}
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-2 flex items-center text-sm">
                          <span className="mr-2">💡</span>
                          Care Tips
                        </h5>
                        <ul className="space-y-1.5">
                          {plant.tips.map((tip, idx) => (
                            <li key={idx} className="text-sm text-gray-600 flex items-start">
                              <span className="text-teal-600 mr-2 mt-0.5">•</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
                  <button
                    onClick={() => setShowRecommendations(false)}
                    className="btn-secondary px-8 py-4 w-full sm:w-auto inline-flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Try Different Conditions
                  </button>
                  <Link
                    href="/plants"
                    className="btn-primary px-8 py-4 w-full sm:w-auto inline-flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    View My Plants
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Made with Bob