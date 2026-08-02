'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface WasteRecord {
  id: string;
  ingredientId: string;
  quantity: number;
  unit: string;
  cost: number;
  status: string;
  createdAt: string;
}

export default function WastePage() {
  const [records, setRecords] = useState<WasteRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    ingredientId: '',
    category: '',
    quantity: '',
    unit: 'kg',
    cost: '',
  });

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setIsLoading(true);
    try {
      const data = await api.listWasteRecords({ limit: 50 });
      setRecords(Array.isArray(data) ? data : data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load waste records');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createWasteRecord({
        ingredientId: formData.ingredientId,
        category: formData.category,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        cost: parseFloat(formData.cost),
      });
      setFormData({
        ingredientId: '',
        category: '',
        quantity: '',
        unit: 'kg',
        cost: '',
      });
      setShowForm(false);
      fetchRecords();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create waste record');
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading waste records...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Waste Records</h1>
          <p className="text-gray-600 mt-2">Track and manage food waste</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition"
        >
          {showForm ? 'Cancel' : 'New Record'}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Create Waste Record</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleFormChange}
                  placeholder="e.g., Produce"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ingredient ID
                </label>
                <input
                  type="text"
                  name="ingredientId"
                  value={formData.ingredientId}
                  onChange={handleFormChange}
                  placeholder="Ingredient ID"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleFormChange}
                  placeholder="0.00"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit
                </label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="kg">kg</option>
                  <option value="g">g</option>
                  <option value="lb">lb</option>
                  <option value="oz">oz</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cost ($)
                </label>
                <input
                  type="number"
                  name="cost"
                  value={formData.cost}
                  onChange={handleFormChange}
                  placeholder="0.00"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              Create Record
            </button>
          </form>
        </div>
      )}

      {/* Records Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {records.length > 0 ? (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Ingredient
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Cost
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm text-gray-900">
                    {new Date(record.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-900">
                    {record.ingredientId}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-900">
                    {record.quantity} {record.unit}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-900">
                    ${record.cost.toFixed(2)}
                  </td>
                  <td className="px-6 py-3 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      record.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : record.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center text-gray-600">
            No waste records found. Create your first record to get started.
          </div>
        )}
      </div>
    </div>
  );
}
