'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import GenerateReportForm from '@/components/GenerateReportForm';
import { api } from '@/lib/api';
import { ErrorBoundary } from '@/components/ErrorBoundary';

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

  const handleSubmit = async (_formData: { type: string; frequency: string }) => {
    try {
      await api.listReports();
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
        <Button
          onClick={() => setShowForm(!showForm)}
          variant="primary"
          size="md"
        >
          {showForm ? 'Cancel' : 'Generate Report'}
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      {showForm && (
        <Card padding="lg" className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Generate New Report</h2>
          <GenerateReportForm onSubmit={handleSubmit} isLoading={isLoading} />
        </Card>
      )}

      {/* Reports Grid */}
      <ErrorBoundary name="Reports">
      {reports.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <Card key={report.id} padding="lg" className="hover:shadow-lg transition flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <span className="text-4xl">{getReportIcon(report.type)}</span>
                <Badge
                  variant="solid"
                  color={
                    report.status === 'completed'
                      ? 'green'
                      : report.status === 'pending'
                      ? 'yellow'
                      : 'red'
                  }
                  size="sm"
                >
                  {report.status}
                </Badge>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 capitalize">
                {report.type} Report
              </h3>
              <p className="text-gray-600 text-sm mb-4 flex-1">
                {report.summary}
              </p>
              <p className="text-gray-500 text-xs mb-4">
                Generated: {new Date(report.generatedAt).toLocaleDateString()}
              </p>
              <Button variant="ghost" size="md" fullWidth>
                View
              </Button>
            </Card>
          ))}
        </div>
      ) : (
        <Card padding="lg" className="text-center text-gray-600">
          <p>No reports found. Generate your first report to get started.</p>
        </Card>
      )}
      </ErrorBoundary>
    </div>
  );
}
