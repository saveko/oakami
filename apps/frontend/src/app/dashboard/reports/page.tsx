'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Report {
  id: string;
  type: string;
  frequency: string;
  generatedAt: string;
  status: string;
  summary: string;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'daily',
    frequency: 'once',
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const data = await api.listReports({ limit: 50 });
      setReports(Array.isArray(data) ? data : data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load reports');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.listReports();
      setFormData({ type: 'daily', frequency: 'once' });
      setShowForm(false);
      fetchReports();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create report');
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading reports...</div>
      </div>
    );
  }

  const getReportIcon = (type: string) => {
    const icons: Record<string, string> = {
      daily: '📊',
      weekly: '📈',
      monthly: '📉',
      yearly: '🎯',
    };
    return icons[type] || '📄';
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-2">View and manage waste reports</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition"
        >
          {showForm ? 'Cancel' : 'Generate Report'}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Generate New Report</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Report Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frequency
                </label>
                <select
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="once">Once</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              Generate
            </button>
          </form>
        </div>
      )}

      {/* Reports Grid */}
      {reports.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <div key={report.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
              <div className="flex items-start justify-between mb-4">
                <span className="text-4xl">{getReportIcon(report.type)}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  report.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : report.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {report.status}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 capitalize">
                {report.type} Report
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {report.summary}
              </p>
              <p className="text-gray-500 text-xs">
                Generated: {new Date(report.generatedAt).toLocaleDateString()}
              </p>
              <button className="mt-4 w-full px-4 py-2 border border-sky-500 text-sky-500 rounded-lg hover:bg-sky-50 transition">
                View
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-600">
          No reports found. Generate your first report to get started.
        </div>
      )}
    </div>
  );
}
