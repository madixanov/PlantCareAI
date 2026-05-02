'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Plant } from '@/types';

interface PlantCardProps {
  plant: Plant;
}

export default function PlantCard({ plant }: PlantCardProps) {

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysOwned = (dateString?: string) => {
    if (!dateString) return null;
    const acquired = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - acquired.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysOwned = getDaysOwned(plant.acquiredDate);

  return (
    <Link href={`/plants/${plant.documentId}`}>
      <div className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100">
        {/* Plant Image */}
        <div className="relative h-64 overflow-hidden bg-gradient-to-br from-emerald-100 via-teal-100 to-cyan-100">
          {plant.photo ? (
            <>
              <Image
                src={plant.photo}
                alt={plant.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-200 via-teal-200 to-cyan-200 relative overflow-hidden">
              {/* Animated Background */}
              <div className="absolute inset-0 opacity-30">
                <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
              </div>
              <span className="text-7xl relative z-10 group-hover:scale-110 transition-transform duration-500">🌱</span>
            </div>
          )}
          
          {/* Days Badge */}
          {daysOwned !== null && (
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg border border-white/20">
              <span className="text-xs font-bold text-emerald-600">{daysOwned} days</span>
            </div>
          )}
        </div>

        {/* Plant Info */}
        <div className="p-6">
          {/* Name & Species */}
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors duration-300 line-clamp-1">
              {plant.name}
            </h3>
            <p className="text-sm text-gray-500 italic line-clamp-1">{plant.species}</p>
          </div>

          {/* Details */}
          <div className="space-y-2.5">
            {/* Location */}
            {plant.location && (
              <div className="flex items-center text-sm text-gray-600 group/item hover:text-emerald-600 transition-colors">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center mr-3 group-hover/item:bg-emerald-100 transition-colors">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="truncate font-medium">{plant.location}</span>
              </div>
            )}

            {/* Acquired Date */}
            <div className="flex items-center text-sm text-gray-600 group/item hover:text-emerald-600 transition-colors">
              <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center mr-3 group-hover/item:bg-teal-100 transition-colors">
                <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="font-medium">Added {formatDate(plant.acquiredDate)}</span>
            </div>
          </div>

          {/* View Details Button */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-emerald-600 font-semibold text-sm group-hover:text-emerald-700">
              <span>View Details</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Hover Glow Effect */}
        <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 rounded-3xl shadow-2xl shadow-emerald-500/20"></div>
        </div>
      </div>
    </Link>
  );
}

// Made with Bob
