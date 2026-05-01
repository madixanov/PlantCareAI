import Link from 'next/link';
import { getPlants } from '@/lib/api';
import PlantCard from '@/components/PlantCard';

export default async function PlantsPage() {
  const plants = await getPlants();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Plants</h1>
          <p className="text-gray-600">
            Manage and track all your plants in one place
          </p>
        </div>
        <Link href="/plants/add" className="btn-primary">
          + Add Plant
        </Link>
      </div>

      {/* Plants Grid */}
      {plants.length > 0 ? (
        <>
          <div className="mb-4 text-sm text-gray-600">
            Showing {plants.length} {plants.length === 1 ? 'plant' : 'plants'}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plants.map((plant) => (
              <PlantCard key={plant.id} plant={plant} />
            ))}
          </div>
        </>
      ) : (
        <div className="card p-16 text-center">
          <div className="text-8xl mb-6">🌱</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            No plants yet
          </h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Start building your plant collection! Add your first plant to begin tracking its care and getting AI-powered recommendations.
          </p>
          <Link href="/plants/add" className="btn-primary inline-block">
            Add Your First Plant
          </Link>
        </div>
      )}
    </div>
  );
}

// Made with Bob
