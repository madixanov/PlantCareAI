'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CreatePlantInput } from '@/types';
import { createPlantWithImage } from '@/lib/strapi';
import ImageUpload from '@/components/ImageUpload';

export default function AddPlantPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreatePlantInput>({
    name: '',
    species: '',
    location: '',
    notes: '',
    acquiredDate: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setUploadProgress(0);

    try {
      // Create plant with image if provided
      const newPlant = await createPlantWithImage(formData, imageFile || undefined);
      router.push(`/plants/${newPlant.documentId}`);
    } catch (error) {
      console.error('Error creating plant:', error);
      alert(error instanceof Error ? error.message : 'Failed to create plant. Please try again.');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageSelect = (file: File) => {
    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/50 py-8 md:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link href="/plants" className="inline-flex items-center text-gray-600 hover:text-emerald-600 mb-8 group transition-colors">
          <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-medium">Back to My Garden</span>
        </Link>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl mb-4 shadow-lg">
            <span className="text-3xl">🌱</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Add New Plant
            </span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Welcome a new member to your garden. Fill in the details to start tracking its growth journey.
          </p>
        </div>

        {/* Form Card */}
        <div className="card p-8 md:p-10 mb-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Photo Upload - Featured */}
            <div>
              <label className="label text-base mb-3 flex items-center">
                <span className="text-2xl mr-2">📸</span>
                Plant Photo
                <span className="ml-2 text-xs font-normal text-gray-500">(Optional)</span>
              </label>
              <ImageUpload
                onImageSelect={handleImageSelect}
                preview={imagePreview}
                onClear={handleClearImage}
                disabled={loading}
                maxSizeMB={5}
              />
              <p className="text-sm text-gray-500 mt-3">
                Upload a beautiful photo of your plant. Supported: JPG, PNG, WEBP (max 5MB)
              </p>
            </div>

            <div className="border-t border-gray-200 pt-8"></div>

            {/* Plant Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Plant Name */}
              <div className="md:col-span-2">
                <label htmlFor="name" className="label text-base mb-3 flex items-center">
                  <span className="text-xl mr-2">🏷️</span>
                  Plant Name
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Sunny the Monstera"
                  className="input-field text-lg"
                  required
                />
                <p className="text-sm text-gray-500 mt-2">
                  Give your plant a memorable name
                </p>
              </div>

              {/* Species */}
              <div className="md:col-span-2">
                <label htmlFor="species" className="label text-base mb-3 flex items-center">
                  <span className="text-xl mr-2">🌿</span>
                  Species
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  id="species"
                  name="species"
                  value={formData.species}
                  onChange={handleChange}
                  placeholder="e.g., Monstera deliciosa"
                  className="input-field"
                  required
                />
                <p className="text-sm text-gray-500 mt-2">
                  Scientific or common name for accurate AI recommendations
                </p>
              </div>

              {/* Location */}
              <div>
                <label htmlFor="location" className="label text-base mb-3 flex items-center">
                  <span className="text-xl mr-2">📍</span>
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., Living Room"
                  className="input-field"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Where in your home?
                </p>
              </div>

              {/* Acquired Date */}
              <div>
                <label htmlFor="acquiredDate" className="label text-base mb-3 flex items-center">
                  <span className="text-xl mr-2">📅</span>
                  Acquired Date
                </label>
                <input
                  type="date"
                  id="acquiredDate"
                  name="acquiredDate"
                  value={formData.acquiredDate}
                  onChange={handleChange}
                  className="input-field"
                />
                <p className="text-sm text-gray-500 mt-2">
                  When did you get it?
                </p>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="label text-base mb-3 flex items-center">
                <span className="text-xl mr-2">📝</span>
                Care Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Add any special care instructions, observations, or notes about your plant..."
                className="input-field resize-none"
                rows={5}
              />
              <p className="text-sm text-gray-500 mt-2">
                Help the AI provide better care advice with detailed notes
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-6 border-t border-gray-200">
              <Link href="/plants" className="btn-secondary w-full sm:w-auto text-center">
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {imageFile ? 'Uploading & Creating...' : 'Creating...'}
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <span className="mr-2">✨</span>
                    Create Plant
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Tips Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card-glass p-6">
            <div className="flex items-start space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-xl">💡</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Pro Tips</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="text-emerald-600 mr-2 mt-0.5">•</span>
                    <span>Use descriptive names for easy identification</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-600 mr-2 mt-0.5">•</span>
                    <span>Include scientific names for better AI insights</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-600 mr-2 mt-0.5">•</span>
                    <span>Track location for light condition monitoring</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="card-glass p-6">
            <div className="flex items-start space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-400 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-xl">🤖</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">AI Features</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="text-violet-600 mr-2 mt-0.5">•</span>
                    <span>Get personalized care recommendations</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-violet-600 mr-2 mt-0.5">•</span>
                    <span>Analyze plant health from photos</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-violet-600 mr-2 mt-0.5">•</span>
                    <span>Ask questions about your plant anytime</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
