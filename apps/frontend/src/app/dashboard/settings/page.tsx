'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { Card } from '@/components/ui/Card';
import ReportSchedulePanel from '@/components/ReportSchedulePanel';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    timezone: 'UTC',
    currency: 'USD',
    lowStockThreshold: 50,
    expiringItemsDays: 7,
    emailNotifications: true,
    pushNotifications: false,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      // In a real app, you'd fetch organization settings from the API
      // For now, we'll just load the default state
    } catch (err: any) {
      setError('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      // In a real app, you'd save these settings via the API
      // For now, we'll just show a success message
      setSuccess('Settings saved successfully!');

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account and preferences</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          {success}
        </div>
      )}

      <div className="max-w-2xl">
        {/* Profile Section */}
        <Card padding="lg" className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile</h2>
          <div className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={user?.email || ''}
              disabled
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                type="text"
                value={user?.firstName || ''}
                disabled
              />
              <Input
                label="Last Name"
                type="text"
                value={user?.lastName || ''}
                disabled
              />
            </div>
            <Input
              label="Role"
              type="text"
              value={user?.role || ''}
              disabled
            />
          </div>
        </Card>

        {/* Preferences Section */}
        <Card padding="lg" className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Timezone"
                value={formData.timezone}
                onChange={(val) =>
                  setFormData((prev) => ({ ...prev, timezone: val as string }))
                }
                options={[
                  { value: 'UTC', label: 'UTC' },
                  { value: 'EST', label: 'Eastern Time' },
                  { value: 'CST', label: 'Central Time' },
                  { value: 'MST', label: 'Mountain Time' },
                  { value: 'PST', label: 'Pacific Time' },
                ]}
              />

              <Select
                label="Currency"
                value={formData.currency}
                onChange={(val) =>
                  setFormData((prev) => ({ ...prev, currency: val as string }))
                }
                options={[
                  { value: 'USD', label: 'USD ($)' },
                  { value: 'EUR', label: 'EUR (€)' },
                  { value: 'GBP', label: 'GBP (£)' },
                  { value: 'CAD', label: 'CAD (C$)' },
                ]}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Low Stock Threshold (kg)"
                type="number"
                name="lowStockThreshold"
                value={formData.lowStockThreshold.toString()}
                onChange={handleChange}
              />

              <Input
                label="Expiring Items Alert (days)"
                type="number"
                name="expiringItemsDays"
                value={formData.expiringItemsDays.toString()}
                onChange={handleChange}
              />
            </div>

            {/* Notifications */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">Notifications</h3>
              <div className="space-y-3">
                <Switch
                  id="emailNotifications"
                  label="Email Notifications"
                  checked={formData.emailNotifications}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, emailNotifications: e.target.checked }))
                  }
                />

                <Switch
                  id="pushNotifications"
                  label="Push Notifications"
                  checked={formData.pushNotifications}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, pushNotifications: e.target.checked }))
                  }
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              disabled={isLoading}
              isLoading={isLoading}
            >
              Save Settings
            </Button>
          </form>
        </Card>

        {/* Report Schedules */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <ReportSchedulePanel />
        </div>

        {/* Danger Zone */}
        <Card padding="lg" className="border-l-4 border-l-red-600 bg-red-50">
          <h2 className="text-lg font-semibold text-red-900 mb-4">Danger Zone</h2>
          <p className="text-red-700 text-sm mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <Button variant="destructive" size="md">
            Delete Account
          </Button>
        </Card>
      </div>
    </div>
  );
}
