import Link from 'next/link';
import { getPlants } from '@/lib/strapi';
import PlantCard from '@/components/PlantCard';

export default async function HomePage() {
  const plants = await getPlants();
  const recentPlants = plants.slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 md:p-12 mb-8 text-white">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Welcome to Plant Care System
        </h1>
        <p className="text-xl md:text-2xl text-primary-100 mb-6">
          Manage your plants with AI-powered care recommendations
        </p>
        <div className="flex flex-wrap gap-4">
          <Link href="/plants/add" className="bg-white text-primary-700 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors">
            Add Your First Plant
          </Link>
          <Link href="/find-plants" className="bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-400 transition-colors">
            Find Plants for Your Room
          </Link>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Plants</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{plants.length}</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🌱</span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Species</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {new Set(plants.map(p => p.species)).size}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🌿</span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Locations</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {new Set(plants.map(p => p.location).filter(Boolean)).size}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📍</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Plants Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Recent Plants</h2>
          <Link href="/plants" className="text-primary-600 hover:text-primary-700 font-medium">
            View All →
          </Link>
        </div>

        {recentPlants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentPlants.map((plant) => (
              <PlantCard key={plant.id} plant={plant} />
            ))}
          </div>
        ) : (
          <div className="card p-12 text-center">
            <div className="text-6xl mb-4">🌱</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No plants yet</h3>
            <p className="text-gray-600 mb-6">Start your plant collection by adding your first plant</p>
            <Link href="/plants/add" className="btn-primary inline-block">
              Add Plant
            </Link>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <span className="text-2xl">🌿</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Plant Recommendations</h3>
          <p className="text-gray-600 mb-4">
            Find the perfect plants for your room based on light, temperature, and pet safety using AI.
          </p>
          <Link href="/find-plants" className="text-primary-600 hover:text-primary-700 font-medium">
            Find Plants →
          </Link>
        </div>

        <div className="card p-6">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
            <span className="text-2xl">🤖</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Contextual AI Care Assistant</h3>
          <p className="text-gray-600 mb-4">
            Get personalized care advice and health analysis for each plant in your collection.
          </p>
          <Link href="/plants" className="text-primary-600 hover:text-primary-700 font-medium">
            View My Plants →
          </Link>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
