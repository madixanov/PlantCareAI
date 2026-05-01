'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CreatePlantInput } from '@/types';
import { createPlant } from '@/lib/api';

export default function AddPlantPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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

    try {
      const newPlant = await createPlant(formData);
      router.push(`/plants/${newPlant.id}`);
    } catch (error) {
      console.error('Error creating plant:', error);
      alert('Failed to create plant. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

          {/* Photo Upload Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">Photo Upload</p>
                <p className="text-sm text-blue-700">
                  Photo upload will be available after creating the plant. You can add photos when editing the plant details.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <Link href="/plants" className="btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Creating...' : 'Create Plant'}
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
