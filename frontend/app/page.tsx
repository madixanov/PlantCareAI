import Link from 'next/link';
import { getPlants } from '@/lib/strapi';
import PlantCard from '@/components/PlantCard';

export default async function HomePage() {
  const plants = await getPlants();
  const recentPlants = plants.slice(0, 3);

  return (
    <div className="relative">
      {/* Hero Section - Immersive */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 pt-16 pb-24 md:pt-24 md:pb-32">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-green-400/20 to-emerald-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg mb-8 border border-emerald-100">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-sm font-semibold text-emerald-700">AI-Powered Plant Care</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Nurture Your Plants
              </span>
              <br />
              <span className="text-gray-900">With Intelligence</span>
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto">
              Transform your plant care journey with AI-powered insights, personalized recommendations, and beautiful plant management.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
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

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">✨</span>
                <span>AI-Powered</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">📱</span>
                <span>Mobile First</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🌿</span>
                <span>Plant Expert</span>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white" fillOpacity="0.5"/>
            <path d="M0 120L60 112.5C120 105 240 90 360 82.5C480 75 600 75 720 78.75C840 82.5 960 90 1080 93.75C1200 97.5 1320 97.5 1380 97.5L1440 97.5V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-8 hover-lift">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg float-animation">
                <span className="text-3xl">🌱</span>
              </div>
            </div>
            <p className="text-gray-600 text-sm font-semibold mb-2">Total Plants</p>
            <p className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{plants.length}</p>
            <p className="text-sm text-gray-500 mt-2">Growing strong</p>
          </div>

          <div className="card p-8 hover-lift" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg float-animation" style={{ animationDelay: '0.5s' }}>
                <span className="text-3xl">🌿</span>
              </div>
            </div>
            <p className="text-gray-600 text-sm font-semibold mb-2">Unique Species</p>
            <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {new Set(plants.map(p => p.species)).size}
            </p>
            <p className="text-sm text-gray-500 mt-2">Diverse collection</p>
          </div>

          <div className="card p-8 hover-lift" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg float-animation" style={{ animationDelay: '1s' }}>
                <span className="text-3xl">📍</span>
              </div>
            </div>
            <p className="text-gray-600 text-sm font-semibold mb-2">Locations</p>
            <p className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              {new Set(plants.map(p => p.location).filter(Boolean)).size}
            </p>
            <p className="text-sm text-gray-500 mt-2">Around your home</p>
          </div>
        </div>
      </section>

      {/* Recent Plants Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Your Garden</h2>
            <p className="text-gray-600">Recently added plants</p>
          </div>
          <Link href="/plants" className="btn-ghost flex items-center space-x-2 group">
            <span>View All</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {recentPlants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentPlants.map((plant, index) => (
              <div key={plant.id} className="fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <PlantCard plant={plant} />
              </div>
            ))}
          </div>
        ) : (
          <div className="card-glass p-16 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-6 float-animation">
              <span className="text-6xl">🌱</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Start Your Plant Journey</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">Begin your collection by adding your first plant and unlock AI-powered care insights</p>
            <Link href="/plants/add" className="btn-primary inline-flex items-center">
              <span className="mr-2">🌱</span>
              Add Your First Plant
            </Link>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="bg-gradient-to-br from-gray-50 to-emerald-50/30 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Powered by AI</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the future of plant care with intelligent features designed for plant lovers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card p-8 hover-lift group">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <span className="text-4xl">🔍</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Smart Plant Discovery</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Find the perfect plants for your space based on light conditions, temperature, and pet safety using advanced AI analysis.
              </p>
              <Link href="/find-plants" className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-semibold group">
                Discover Plants
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className="card p-8 hover-lift group">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-400 to-purple-500 rounded-3xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <span className="text-4xl">🤖</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">AI Care Assistant</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Get personalized care advice, health diagnostics, and expert recommendations tailored to each plant in your collection.
              </p>
              <Link href="/plants" className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-semibold group">
                View My Plants
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Made with Bob
