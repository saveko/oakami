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

interface ApprovalState {
  [recordId: string]: boolean;
}

export default function WastePage() {
  const [records, setRecords] = useState<WasteRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [approvalStates, setApprovalStates] = useState<ApprovalState>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
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
    setFormSubmitting(true);
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
      setSuccessMessage('Waste record created successfully');
      setTimeout(() => setSuccessMessage(null), 5000);
      fetchRecords();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create waste record');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleApprove = async (recordId: string) => {
    setApprovalStates((prev) => ({ ...prev, [recordId]: true }));
    try {
      await api.approveWasteRecord(recordId);
      setSuccessMessage('Waste record approved');
      setTimeout(() => setSuccessMessage(null), 5000);
      fetchRecords();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to approve waste record');
      setApprovalStates((prev) => ({ ...prev, [recordId]: false }));
    }
  };

  const handleReject = async (recordId: string) => {
    setApprovalStates((prev) => ({ ...prev, [recordId]: true }));
    try {
      await api.rejectWasteRecord(recordId);
      setSuccessMessage('Waste record rejected');
      setTimeout(() => setSuccessMessage(null), 5000);
      fetchRecords();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reject waste record');
      setApprovalStates((prev) => ({ ...prev, [recordId]: false }));
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
      <div className="flex justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Waste Records</h1>
          <p className="text-gray-600 mt-2">Track and manage food waste</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
          aria-label={showForm ? 'Cancel and close form' : 'Create new waste record'}
        >
          {showForm ? 'Cancel' : 'New Record'}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800" role="alert">
          <p className="font-semibold">Error</p>
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800" role="status">
          <p className="font-semibold">Success</p>
          {successMessage}
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Create Waste Record</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="waste-category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span aria-label="required" className="text-red-600">*</span>
                </label>
                <input
                  id="waste-category"
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleFormChange}
                  placeholder="e.g., Produce"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-500"
                  required
                  aria-required="true"
                  aria-label="Enter category for waste record"
                />
              </div>

              <div>
                <label htmlFor="waste-ingredientid" className="block text-sm font-medium text-gray-700 mb-2">
                  Ingredient ID <span aria-label="required" className="text-red-600">*</span>
                </label>
                <input
                  id="waste-ingredientid"
                  type="text"
                  name="ingredientId"
                  value={formData.ingredientId}
                  onChange={handleFormChange}
                  placeholder="Ingredient ID"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-500"
                  required
                  aria-required="true"
                  aria-label="Enter ingredient ID"
                />
              </div>

              <div>
                <label htmlFor="waste-quantity" className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity <span aria-label="required" className="text-red-600">*</span>
                </label>
                <input
                  id="waste-quantity"
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleFormChange}
                  placeholder="0.00"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-500"
                  required
                  aria-required="true"
                  aria-label="Enter quantity in units"
                />
              </div>

              <div>
                <label htmlFor="waste-unit" className="block text-sm font-medium text-gray-700 mb-2">
                  Unit
                </label>
                <select
                  id="waste-unit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-500"
                  aria-label="Select unit of measurement"
                >
                  <option value="kg">kg</option>
                  <option value="g">g</option>
                  <option value="lb">lb</option>
                  <option value="oz">oz</option>
                </select>
              </div>

              <div>
                <label htmlFor="waste-cost" className="block text-sm font-medium text-gray-700 mb-2">
                  Cost ($) <span aria-label="required" className="text-red-600">*</span>
                </label>
                <input
                  id="waste-cost"
                  type="number"
                  name="cost"
                  value={formData.cost}
                  onChange={handleFormChange}
                  placeholder="0.00"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-500"
                  required
                  aria-required="true"
                  aria-label="Enter cost in dollars"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={formSubmitting}
              className="w-full bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
              aria-busy={formSubmitting}
              aria-label="Submit waste record form"
            >
              {formSubmitting ? 'Creating...' : 'Create Record'}
            </button>
          </form>
        </div>
      )}

      {/* Records Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        {records.length > 0 ? (
          <table className="w-full" role="grid">
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
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Actions
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
                      record.status === 'APPROVED'
                        ? 'bg-green-100 text-green-800'
                        : record.status === 'REJECTED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm">
                    {record.status === 'PENDING' ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(record.id)}
                          disabled={approvalStates[record.id]}
                          className="px-3 py-2 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500"
                          aria-label={`Approve waste record ${record.ingredientId}`}
                          aria-busy={approvalStates[record.id]}
                        >
                          {approvalStates[record.id] ? '✓' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleReject(record.id)}
                          disabled={approvalStates[record.id]}
                          className="px-3 py-2 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
                          aria-label={`Reject waste record ${record.ingredientId}`}
                          aria-busy={approvalStates[record.id]}
                        >
                          {approvalStates[record.id] ? '✗' : 'Reject'}
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-500 text-xs">No actions</span>
                    )}
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
