'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface ReportSchedule {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  time: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  recipientEmails: string[];
  nextRunAt: string;
  lastRunAt?: string;
}

export default function ReportSchedulePanel() {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    enabled: true,
    frequency: 'DAILY' as 'DAILY' | 'WEEKLY' | 'MONTHLY',
    time: '09:00',
    dayOfWeek: 0,
    dayOfMonth: 1,
    recipientEmails: '',
  });

  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ['reportSchedules'],
    queryFn: () => api.listReportSchedules(),
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return api.createReportSchedule({
        ...data,
        recipientEmails: data.recipientEmails.split(',').map((e: string) => e.trim()),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reportSchedules'] });
      setIsCreating(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return api.updateReportSchedule(id, {
        ...data,
        recipientEmails: Array.isArray(data.recipientEmails)
          ? data.recipientEmails
          : data.recipientEmails.split(',').map((e: string) => e.trim()),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reportSchedules'] });
      setEditingId(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteReportSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reportSchedules'] });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      enabled: true,
      frequency: 'DAILY',
      time: '09:00',
      dayOfWeek: 0,
      dayOfMonth: 1,
      recipientEmails: '',
    });
  };

  const handleEdit = (schedule: ReportSchedule) => {
    setEditingId(schedule.id);
    setFormData({
      name: schedule.name,
      description: schedule.description || '',
      enabled: schedule.enabled,
      frequency: schedule.frequency,
      time: schedule.time,
      dayOfWeek: schedule.dayOfWeek || 0,
      dayOfMonth: schedule.dayOfMonth || 1,
      recipientEmails: schedule.recipientEmails.join(', '),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const getNextRunDisplay = (nextRunAt: string) => {
    const date = new Date(nextRunAt);
    return date.toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Report Schedules</h2>
        {!isCreating && !editingId && (
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition"
          >
            + New Schedule
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-gray-500">Loading schedules...</div>
      ) : (
        <>
          {/* Form */}
          {(isCreating || editingId) && (
            <form
              onSubmit={handleSubmit}
              className="bg-white p-6 rounded-lg border border-gray-200 space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Schedule Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Frequency
                  </label>
                  <select
                    value={formData.frequency}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        frequency: e.target.value as 'DAILY' | 'WEEKLY' | 'MONTHLY',
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time (24h format)
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>

                {formData.frequency === 'WEEKLY' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Day of Week
                    </label>
                    <select
                      value={formData.dayOfWeek}
                      onChange={(e) =>
                        setFormData({ ...formData, dayOfWeek: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="0">Sunday</option>
                      <option value="1">Monday</option>
                      <option value="2">Tuesday</option>
                      <option value="3">Wednesday</option>
                      <option value="4">Thursday</option>
                      <option value="5">Friday</option>
                      <option value="6">Saturday</option>
                    </select>
                  </div>
                )}

                {formData.frequency === 'MONTHLY' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Day of Month
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={formData.dayOfMonth}
                      onChange={(e) =>
                        setFormData({ ...formData, dayOfMonth: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                )}

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recipient Emails (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.recipientEmails}
                    onChange={(e) => setFormData({ ...formData, recipientEmails: e.target.value })}
                    placeholder="user@example.com, another@example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows={2}
                  />
                </div>

                <div className="md:col-span-2 flex items-center">
                  <input
                    type="checkbox"
                    id="enabled"
                    checked={formData.enabled}
                    onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                    className="h-4 w-4 text-sky-600"
                  />
                  <label htmlFor="enabled" className="ml-2 text-sm font-medium text-gray-700">
                    Enable this schedule
                  </label>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition disabled:opacity-50"
                >
                  {editingId ? 'Update Schedule' : 'Create Schedule'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingId(null);
                    resetForm();
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Schedules List */}
          <div className="space-y-3">
            {schedules.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No schedules configured yet. Create one to start sending automated reports.
              </div>
            ) : (
              schedules.map((schedule: ReportSchedule) => (
                <div
                  key={schedule.id}
                  className="bg-white p-4 rounded-lg border border-gray-200 flex items-start justify-between hover:shadow-md transition"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{schedule.name}</h3>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          schedule.enabled
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {schedule.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                      <span className="px-2 py-1 text-xs bg-sky-100 text-sky-800 rounded-full">
                        {schedule.frequency}
                      </span>
                    </div>
                    {schedule.description && (
                      <p className="text-sm text-gray-600 mt-1">{schedule.description}</p>
                    )}
                    <div className="text-xs text-gray-500 mt-2">
                      <p>Time: {schedule.time}</p>
                      <p>Recipients: {schedule.recipientEmails.join(', ')}</p>
                      <p>Next run: {getNextRunDisplay(schedule.nextRunAt)}</p>
                      {schedule.lastRunAt && (
                        <p>Last run: {new Date(schedule.lastRunAt).toLocaleString()}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    {!editingId && (
                      <>
                        <button
                          onClick={() => handleEdit(schedule)}
                          className="px-3 py-1 text-sm bg-sky-100 text-sky-700 rounded hover:bg-sky-200 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteMutation.mutate(schedule.id)}
                          disabled={deleteMutation.isPending}
                          className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
