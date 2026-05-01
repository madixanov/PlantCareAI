'use client';

import { useState } from 'react';
import Link from 'next/link';
import { RoomConditions, PlantRecommendation, LightLevel, TemperatureLevel, PetType } from '@/types';
import { getPlantRecommendations } from '@/lib/api';

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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl mb-4 shadow-lg">
            <span className="text-3xl">🌿</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Find Plants for Your Room</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Tell us about your room conditions and get AI-powered personalized plant recommendations
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Room Conditions Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 sticky top-8">
              <h3 className="font-bold text-gray-900 mb-6 text-lg">Room Conditions</h3>
              
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
                  className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl disabled:hover:shadow-lg"
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
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-12 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-5xl">🌱</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Ready to Find Your Perfect Plants?</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                  Fill out the room conditions form and click "Generate Recommendations" to get personalized plant suggestions for your space.
                </p>
                <div className="flex flex-wrap justify-center gap-3 text-sm">
                  <span className="bg-gray-100 px-4 py-2 rounded-full font-medium text-gray-700 border border-gray-200">🌑 Light conditions</span>
                  <span className="bg-gray-100 px-4 py-2 rounded-full font-medium text-gray-700 border border-gray-200">🌡️ Temperature</span>
                  <span className="bg-gray-100 px-4 py-2 rounded-full font-medium text-gray-700 border border-gray-200">🐾 Pet safety</span>
                </div>
              </div>
            )}

            {showRecommendations && (
              <div className="space-y-6">
                {/* Room Summary */}
                <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl shadow-lg border-2 border-primary-200 p-6">
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center mr-4 shadow-md flex-shrink-0">
                      <span className="text-2xl">🏠</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-primary-900 mb-2 text-lg">Your Room Analysis</h3>
                      <p className="text-primary-800 leading-relaxed">{roomSummary}</p>
                    </div>
                  </div>
                </div>

                {/* Plant Recommendations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {recommendations.map((plant) => (
                    <div key={plant.id} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
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
                  ))}
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
                  <button
                    onClick={() => setShowRecommendations(false)}
                    className="px-8 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-md hover:shadow-lg inline-flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Try Different Conditions
                  </button>
                  <Link
                    href="/plants"
                    className="px-8 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-md hover:shadow-lg inline-flex items-center"
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