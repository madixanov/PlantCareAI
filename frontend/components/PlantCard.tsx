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

  console.log('PLANT CARD PHOTO:', plant.photo);

  return (
    <Link href={`/plants/${plant.documentId}`}>
      <div className="card hover:shadow-lg transition-shadow duration-200 cursor-pointer group">
        {/* Plant Image */}
        <div className="relative h-48 bg-gray-100 overflow-hidden">
          {plant.photo ? (
            <Image
              src={plant.photo}
              alt={plant.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
              <span className="text-6xl">🌱</span>
            </div>
          )}
        </div>

        {/* Plant Info */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
            {plant.name}
          </h3>
          <p className="text-sm text-gray-600 mb-3 italic">{plant.species}</p>

          {/* Location */}
          {plant.location && (
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <svg
                className="w-4 h-4 mr-1.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="truncate">{plant.location}</span>
            </div>
          )}

          {/* Acquired Date */}
          <div className="flex items-center text-sm text-gray-500">
            <svg
              className="w-4 h-4 mr-1.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>Added {formatDate(plant.acquiredDate)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Made with Bob
