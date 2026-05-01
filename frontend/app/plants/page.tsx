'use client';

import Link from 'next/link';
import { getPlants } from '@/lib/strapi';
import PlantCard from '@/components/PlantCard';
import { useEffect, useState } from 'react';
import { Plant } from '@/types';

export default function PlantsPage() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            My Plants
          </h1>
          <p className="text-gray-600">
            Manage and track all your plants in one place
          </p>
        </div>

        <Link href="/plants/add" className="btn-primary">
          + Add Plant
        </Link>
      </div>

      {/* Plants */}
      {plants.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plants.map((plant) => (
            <PlantCard key={plant.documentId} plant={plant} />
          ))}
        </div>
      ) : (
        <div className="text-center p-12">
          <p>No plants yet 🌱</p>
        </div>
      )}
    </div>
  );
}

// Made with Bob
