'use client';

import Link from 'next/link';
import { getPlants } from '@/lib/strapi';
import PlantCard from '@/components/PlantCard';
import { useEffect, useState } from 'react';
import { Plant } from '@/types';

export default function PlantsPage() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getPlants();
        console.log('PLANTS:', data);
        setPlants(data);
      } catch (e) {
        console.error('FAILED TO LOAD PLANTS:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredPlants = plants.filter(plant =>
    plant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plant.species.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plant.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your garden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
                <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  My Garden
                </span>
              </h1>
              <p className="text-lg text-gray-600">
                {plants.length === 0
                  ? 'Start your plant collection journey'
                  : `${plants.length} ${plants.length === 1 ? 'plant' : 'plants'} growing strong`
                }
              </p>
            </div>

            <Link href="/plants/add" className="btn-primary text-lg px-8 py-4 inline-flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Plant
            </Link>
          </div>

          {/* Search Bar */}
          {plants.length > 0 && (
            <div className="relative max-w-xl">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search plants by name, species, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all duration-200 placeholder:text-gray-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Plants Grid */}
        {plants.length > 0 ? (
          <>
            {filteredPlants.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPlants.map((plant, index) => (
                  <div key={plant.documentId} className="fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                    <PlantCard plant={plant} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="card-glass p-16 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-6xl">🔍</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No plants found</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  We couldn't find any plants matching "{searchQuery}"
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="btn-secondary inline-flex items-center"
                >
                  Clear Search
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="card-glass p-16 md:p-24 text-center">
            <div className="max-w-2xl mx-auto">
              {/* Animated Plant Icon */}
              <div className="relative w-32 h-32 mx-auto mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-200 to-teal-200 rounded-full blur-2xl opacity-50 animate-pulse"></div>
                <div className="relative w-32 h-32 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center float-animation">
                  <span className="text-7xl">🌱</span>
                </div>
              </div>

              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Your Garden Awaits
              </h3>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Begin your plant care journey by adding your first plant. Track growth, get AI-powered care tips, and watch your garden flourish.
              </p>

              {/* Feature Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-100">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">📸</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Track Growth</h4>
                  <p className="text-sm text-gray-600">Upload photos and monitor your plant's progress</p>
                </div>

                <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-100">
                  <div className="w-12 h-12 bg-gradient-to-br from-violet-400 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">🤖</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">AI Assistant</h4>
                  <p className="text-sm text-gray-600">Get personalized care recommendations</p>
                </div>

                <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-100">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">📊</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Care Logs</h4>
                  <p className="text-sm text-gray-600">Record watering, fertilizing, and more</p>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/plants/add" className="btn-primary text-lg px-8 py-4 w-full sm:w-auto">
                  <span className="flex items-center justify-center">
                    <span className="mr-2">🌱</span>
                    Add Your First Plant
                  </span>
                </Link>
                <Link href="/find-plants" className="btn-secondary text-lg px-8 py-4 w-full sm:w-auto">
                  <span className="flex items-center justify-center">
                    <span className="mr-2">🔍</span>
                    Discover Plants
                  </span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Made with Bob
