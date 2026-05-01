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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Link href="/plants" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Plants
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Plant</h1>
        <p className="text-gray-600">
          Fill in the details about your new plant to start tracking its care
        </p>
      </div>

      {/* Form */}
      <div className="card p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Plant Name */}
          <div>
            <label htmlFor="name" className="label">
              Plant Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., My Monstera"
              className="input-field"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Give your plant a unique name to identify it
            </p>
          </div>

          {/* Species */}
          <div>
            <label htmlFor="species" className="label">
              Species <span className="text-red-500">*</span>
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
            <p className="text-sm text-gray-500 mt-1">
              Scientific or common name of the plant species
            </p>
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="label">
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., Living Room - East Window"
              className="input-field"
            />
            <p className="text-sm text-gray-500 mt-1">
              Where is this plant located in your home?
            </p>
          </div>

          {/* Acquired Date */}
          <div>
            <label htmlFor="acquiredDate" className="label">
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
            <p className="text-sm text-gray-500 mt-1">
              When did you get this plant?
            </p>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="label">
              Care Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="e.g., Needs bright indirect light, water when top 2 inches of soil are dry..."
              className="input-field resize-none"
              rows={5}
            />
            <p className="text-sm text-gray-500 mt-1">
              Add any care instructions or special notes about this plant
            </p>
          </div>

          {/* Photo Upload */}
          <div>
            <label className="label">
              Plant Photo (Optional)
            </label>
            <ImageUpload
              onImageSelect={handleImageSelect}
              preview={imagePreview}
              onClear={handleClearImage}
              disabled={loading}
              maxSizeMB={5}
            />
            <p className="text-sm text-gray-500 mt-2">
              Upload a photo of your plant. Supported formats: JPG, JPEG, PNG, WEBP (max 5MB)
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <Link href="/plants" className="btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {imageFile ? 'Uploading & Creating...' : 'Creating...'}
                </span>
              ) : (
                'Create Plant'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Tips Section */}
      <div className="mt-8 card p-6">
        <h3 className="font-semibold text-gray-900 mb-4">💡 Tips for Success</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start">
            <span className="text-primary-600 mr-2">•</span>
            <span>Use descriptive names to easily identify your plants</span>
          </li>
          <li className="flex items-start">
            <span className="text-primary-600 mr-2">•</span>
            <span>Include the scientific name for more accurate AI recommendations</span>
          </li>
          <li className="flex items-start">
            <span className="text-primary-600 mr-2">•</span>
            <span>Note the location to track light conditions and environment</span>
          </li>
          <li className="flex items-start">
            <span className="text-primary-600 mr-2">•</span>
            <span>Add detailed care notes to help the AI provide better advice</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

// Made with Bob
