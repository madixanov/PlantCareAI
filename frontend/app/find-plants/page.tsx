'use client';

import { useState } from 'react';
import Link from 'next/link';
import { RoomConditions, PlantRecommendation, LightLevel, TemperatureLevel, PetType } from '@/types';
import { getPlantRecommendations } from '@/lib/strapi';

export default function FindPlantsPage() {
  // Room recommendation state
  const [roomConditions, setRoomConditions] = useState<RoomConditions>({
    lightLevel: 'medium',
    temperature: 'moderate',
    pets: ['none'],
    notes: ''
  });
  const [recommendations, setRecommendations] = useState<PlantRecommendation[]>([]);
  const [roomSummary, setRoomSummary] = useState('');
  const [recommendationLoading, setRecommendationLoading] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);

  // Room recommendation handlers
  const handlePetChange = (pet: PetType, checked: boolean) => {
    setRoomConditions(prev => {
      let newPets = [...prev.pets];
      
      if (pet === 'none') {
        newPets = checked ? ['none'] : [];
      } else {
        newPets = newPets.filter(p => p !== 'none');
        
        if (checked) {
          newPets.push(pet);
        } else {
          newPets = newPets.filter(p => p !== pet);
        }
        
        if (newPets.length === 0) {
          newPets = ['none'];
        }
      }
      
      return { ...prev, pets: newPets };
    });
  };

  const handleGenerateRecommendations = async () => {
    setRecommendationLoading(true);
    setShowRecommendations(false);
    
    try {
      const result = await getPlantRecommendations(roomConditions);
      setRecommendations(result.recommendations);
      setRoomSummary(result.roomSummary);
      setShowRecommendations(true);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      alert('Sorry, there was an error generating recommendations. Please try again.');
    } finally {
      setRecommendationLoading(false);
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

  const getLightEmoji = (level: LightLevel) => {
    switch (level) {
      case 'low': return '🌑';
      case 'medium': return '☁️';
      case 'bright': return '☀️';
    }
  };

  const getTempEmoji = (temp: TemperatureLevel) => {
    switch (temp) {
      case 'cold': return '❄️';
      case 'moderate': return '🌡️';
      case 'warm': return '🔥';
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
            Tell us about your space and get AI-powered personalized plant recommendations tailored to your environment
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
                    {getLightEmoji(roomConditions.lightLevel)} Light Level
                  </label>
                  <select
                    value={roomConditions.lightLevel}
                    onChange={(e) => setRoomConditions(prev => ({ ...prev, lightLevel: e.target.value as LightLevel }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-sm"
                  >
                    <option value="low">🌑 Low (North-facing)</option>
                    <option value="medium">☁️ Medium (East/West-facing)</option>
                    <option value="bright">☀️ Bright (South-facing)</option>
                  </select>
                </div>

                {/* Temperature */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    {getTempEmoji(roomConditions.temperature)} Temperature
                  </label>
                  <select
                    value={roomConditions.temperature}
                    onChange={(e) => setRoomConditions(prev => ({ ...prev, temperature: e.target.value as TemperatureLevel }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-sm"
                  >
                    <option value="cold">❄️ Cold {'(<18°C / <64°F)'}</option>
                    <option value="moderate">🌡️ Moderate (18–24°C / 64–75°F)</option>
                    <option value="warm">🔥 Warm {'(>24°C / >75°F)'}</option>
                  </select>
                </div>

                {/* Pets */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">🐾 Pets in Home</label>
                  <div className="space-y-3">
                    <label className="flex items-center p-3 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={roomConditions.pets.includes('cats')}
                        onChange={(e) => handlePetChange('cats', e.target.checked)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 mr-3"
                      />
                      <span className="text-sm text-gray-700 font-medium">🐱 Cats</span>
                    </label>
                    <label className="flex items-center p-3 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={roomConditions.pets.includes('dogs')}
                        onChange={(e) => handlePetChange('dogs', e.target.checked)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 mr-3"
                      />
                      <span className="text-sm text-gray-700 font-medium">🐶 Dogs</span>
                    </label>
                    <label className="flex items-center p-3 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={roomConditions.pets.includes('none')}
                        onChange={(e) => handlePetChange('none', e.target.checked)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 mr-3"
                      />
                      <span className="text-sm text-gray-700 font-medium">🚫 No pets</span>
                    </label>
                  </div>
                </div>

                {/* Optional Notes */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">📝 Additional Notes</label>
                  <textarea
                    value={roomConditions.notes}
                    onChange={(e) => setRoomConditions(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="e.g., bathroom with high humidity, office with AC..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none transition-all duration-200 text-sm"
                    rows={3}
                  />
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleGenerateRecommendations}
                  disabled={recommendationLoading}
                  className="btn-primary w-full text-lg py-4"
                >
                  {recommendationLoading ? (
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
              </div>
            </div>
          </div>

          {/* Recommendations Display */}
          <div className="lg:col-span-2">
            {!showRecommendations && !recommendationLoading && (
              <div className="card-glass p-16 text-center">
                <div className="relative w-32 h-32 mx-auto mb-8">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-200 to-teal-200 rounded-full blur-2xl opacity-50 animate-pulse"></div>
                  <div className="relative w-32 h-32 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center float-animation">
                    <span className="text-7xl">🌱</span>
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">Ready to Discover?</h3>
                <p className="text-lg text-gray-600 mb-10 max-w-md mx-auto leading-relaxed">
                  Fill out the room conditions and click "Generate Recommendations" to get personalized plant suggestions powered by AI.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <span className="badge badge-success text-sm px-4 py-2">🌑 Light Analysis</span>
                  <span className="badge badge-success text-sm px-4 py-2">🌡️ Temperature Match</span>
                  <span className="badge badge-success text-sm px-4 py-2">🐾 Pet Safety</span>
                </div>
              </div>
            )}

            {showRecommendations && (
              <div className="space-y-8">
                {/* Room Summary */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl shadow-xl border-2 border-emerald-200 p-8">
                  <div className="flex items-start">
                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mr-5 shadow-lg flex-shrink-0">
                      <span className="text-3xl">🏠</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-emerald-900 mb-3 text-xl">Your Room Analysis</h3>
                      <p className="text-emerald-800 leading-relaxed text-lg">{roomSummary}</p>
                    </div>
                  </div>
                </div>

                {/* Plant Recommendations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {recommendations.map((plant, index) => (
                    <div key={plant.id} className="card hover-lift fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                      <div className="p-8">
                      {/* Plant Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="text-lg font-bold text-gray-900">{plant.name}</h4>
                          <p className="text-sm text-gray-600 italic">{plant.species}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getDifficultyColor(plant.difficulty)}`}>
                          {plant.difficulty}
                        </span>
                      </div>

                      {/* Plant Image Placeholder */}
                      <div className="w-full h-36 bg-gradient-to-br from-green-100 via-green-200 to-emerald-200 rounded-xl mb-4 flex items-center justify-center shadow-inner">
                        <span className="text-5xl">🌿</span>
                      </div>

                      {/* Why it fits */}
                      <div className="mb-4">
                        <h5 className="font-semibold text-gray-900 mb-2 flex items-center text-sm">
                          <span className="mr-2">✨</span>
                          Why it's perfect for you
                        </h5>
                        <p className="text-sm text-gray-700 leading-relaxed">{plant.reason}</p>
                      </div>

                      {/* Care highlights */}
                      <div className="mb-4">
                        <h5 className="font-semibold text-gray-900 mb-2 flex items-center text-sm">
                          <span className="mr-2">🌱</span>
                          Care highlights
                        </h5>
                        <ul className="space-y-1.5">
                          {plant.careHighlights.map((highlight, idx) => (
                            <li key={idx} className="text-sm text-gray-600 flex items-start">
                              <span className="text-primary-600 mr-2 mt-0.5">•</span>
                              <span>{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Pet warning/safe */}
                      {!plant.petSafe && plant.petWarning && (
                        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3">
                          <p className="text-sm text-red-800 font-medium">{plant.petWarning}</p>
                        </div>
                      )}

                      {plant.petSafe && (
                        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-3">
                          <p className="text-sm text-green-800 font-medium flex items-center">
                            <span className="mr-2">✅</span>
                            Safe for cats and dogs
                          </p>
                        </div>
                      )}
                      </div>
                    </div>
                  ))}
                </div>

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