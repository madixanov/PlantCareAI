'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Plant, CareLog, CreateCareLogInput, CareType } from '@/types';
import { getPlantById, getCareLogs, createCareLog, deletePlant, askAI } from '@/lib/api';

export default function PlantDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [plant, setPlant] = useState<Plant | null>(null);
  const [careLogs, setCareLogs] = useState<CareLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCareForm, setShowCareForm] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Care form state
  const [careType, setCareType] = useState<CareType>('watering');
  const [careNotes, setCareNotes] = useState('');
  const [careDate, setCareDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadPlantData();
  }, [params.id]);

  const loadPlantData = async () => {
    try {
      const [plantData, careLogsData] = await Promise.all([
        getPlantById(params.id),
        getCareLogs(params.id),
      ]);
      setPlant(plantData);
      setCareLogs(careLogsData);
    } catch (error) {
      console.error('Error loading plant data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCareLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plant) return;

    try {
      const input: CreateCareLogInput = {
        careType,
        notes: careNotes,
        date: new Date(careDate).toISOString(),
        plant: plant.id,
      };

      const newLog = await createCareLog(input);
      setCareLogs([newLog, ...careLogs]);
      setShowCareForm(false);
      setCareNotes('');
      setCareDate(new Date().toISOString().split('T')[0]);
    } catch (error) {
      console.error('Error adding care log:', error);
    }
  };

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim() || !plant) return;

    setAiLoading(true);
    try {
      const response = await askAI(plant.id.toString(), aiQuestion);
      setAiResponse(response);
    } catch (error) {
      console.error('Error asking AI:', error);
      setAiResponse('Sorry, there was an error processing your question.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!plant) return;
    if (!confirm(`Are you sure you want to delete ${plant.name}?`)) return;

    try {
      await deletePlant(plant.id.toString());
      router.push('/plants');
    } catch (error) {
      console.error('Error deleting plant:', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
        </div>
      </div>
    );
  }

  if (!plant) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card p-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Plant not found</h2>
          <Link href="/plants" className="btn-primary inline-block">
            Back to Plants
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCareTypeIcon = (type: CareType) => {
    const icons = {
      watering: '💧',
      fertilizing: '🌿',
      pruning: '✂️',
      repotting: '🪴',
      other: '📝',
    };
    return icons[type];
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Link href="/plants" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Plants
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Plant Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Plant Header */}
          <div className="card p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{plant.name}</h1>
                <p className="text-lg text-gray-600 italic">{plant.species}</p>
              </div>
              <button onClick={handleDelete} className="btn-danger">
                Delete
              </button>
            </div>

            {/* Plant Image */}
            <div className="relative h-64 bg-gray-100 rounded-lg overflow-hidden mb-4">
              {plant.photo ? (
                <Image
                  src={plant.photo}
                  alt={plant.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
                  <span className="text-8xl">🌱</span>
                </div>
              )}
            </div>

            {/* Plant Details */}
            <div className="grid grid-cols-2 gap-4">
              {plant.location && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Location</p>
                  <p className="font-medium text-gray-900">{plant.location}</p>
                </div>
              )}
              {plant.acquiredDate && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Acquired</p>
                  <p className="font-medium text-gray-900">
                    {new Date(plant.acquiredDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>

            {plant.notes && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Notes</p>
                <p className="text-gray-900">{plant.notes}</p>
              </div>
            )}
          </div>

          {/* AI Chat Section */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">AI Plant Assistant</h2>
              <button
                onClick={() => setShowAIChat(!showAIChat)}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                {showAIChat ? 'Hide' : 'Show'}
              </button>
            </div>

            {showAIChat && (
              <div className="space-y-4">
                <form onSubmit={handleAskAI} className="space-y-4">
                  <div>
                    <label className="label">Ask about your plant</label>
                    <textarea
                      value={aiQuestion}
                      onChange={(e) => setAiQuestion(e.target.value)}
                      placeholder="e.g., Why are the leaves turning yellow?"
                      className="input-field resize-none"
                      rows={3}
                      required
                    />
                  </div>
                  <button type="submit" disabled={aiLoading} className="btn-primary w-full">
                    {aiLoading ? 'Thinking...' : 'Ask AI'}
                  </button>
                </form>

                {aiResponse && (
                  <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <span className="text-2xl mr-3">🤖</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-primary-900 mb-2">AI Response:</p>
                        <p className="text-gray-800 whitespace-pre-line">{aiResponse}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Care Timeline */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Care History</h2>
              <button
                onClick={() => setShowCareForm(!showCareForm)}
                className="btn-primary"
              >
                {showCareForm ? 'Cancel' : '+ Log Care'}
              </button>
            </div>

            {/* Care Form */}
            {showCareForm && (
              <form onSubmit={handleAddCareLog} className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
                <div>
                  <label className="label">Care Type</label>
                  <select
                    value={careType}
                    onChange={(e) => setCareType(e.target.value as CareType)}
                    className="input-field"
                  >
                    <option value="watering">💧 Watering</option>
                    <option value="fertilizing">🌿 Fertilizing</option>
                    <option value="pruning">✂️ Pruning</option>
                    <option value="repotting">🪴 Repotting</option>
                    <option value="other">📝 Other</option>
                  </select>
                </div>

                <div>
                  <label className="label">Date</label>
                  <input
                    type="date"
                    value={careDate}
                    onChange={(e) => setCareDate(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="label">Notes (optional)</label>
                  <textarea
                    value={careNotes}
                    onChange={(e) => setCareNotes(e.target.value)}
                    placeholder="Add any additional notes..."
                    className="input-field resize-none"
                    rows={3}
                  />
                </div>

                <button type="submit" className="btn-primary w-full">
                  Save Care Log
                </button>
              </form>
            )}

            {/* Timeline */}
            {careLogs.length > 0 ? (
              <div className="space-y-4">
                {careLogs.map((log) => (
                  <div key={log.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-3xl">{getCareTypeIcon(log.careType)}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 capitalize">{log.careType}</h3>
                        <span className="text-sm text-gray-500">{formatDate(log.date)}</span>
                      </div>
                      {log.notes && <p className="text-gray-600 text-sm">{log.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No care logs yet. Start tracking your plant care!</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Quick Actions */}
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => setShowCareForm(true)}
                className="w-full btn-secondary text-left flex items-center"
              >
                <span className="mr-2">💧</span>
                Log Watering
              </button>
              <button
                onClick={() => setShowAIChat(true)}
                className="w-full btn-secondary text-left flex items-center"
              >
                <span className="mr-2">🤖</span>
                Ask AI Assistant
              </button>
              <Link href="/plants" className="block w-full btn-secondary text-center">
                View All Plants
              </Link>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Care Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Care Logs</span>
                <span className="font-semibold text-gray-900">{careLogs.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Last Watered</span>
                <span className="font-semibold text-gray-900">
                  {careLogs.find(log => log.careType === 'watering')
                    ? new Date(careLogs.find(log => log.careType === 'watering')!.date).toLocaleDateString()
                    : 'Never'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
