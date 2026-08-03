'use client';

import React, { useState } from 'react';
import { Table, type Column } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useWasteRecords, useCreateWasteRecord, useApproveWasteRecord, useRejectWasteRecord } from '@/lib/hooks/useWaste';

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
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    ingredientId: '',
    category: '',
    quantity: '',
    unit: 'kg',
    cost: '',
  });

  const rowsPerPage = 20;
  const skip = (currentPage - 1) * rowsPerPage;

  const { data: responseData, isLoading, error } = useWasteRecords({
    skip,
    take: rowsPerPage,
  });

  const createWaste = useCreateWasteRecord();
  const approveWaste = useApproveWasteRecord();
  const rejectWaste = useRejectWasteRecord();

  const records = responseData?.data || (Array.isArray(responseData) ? responseData : []);
  const totalRecords = responseData?.pagination?.total || records.length;
  const totalPages = Math.ceil(totalRecords / rowsPerPage);

  const statusConfig = {
    APPROVED: { label: 'Approved', variant: 'success' as const },
    REJECTED: { label: 'Rejected', variant: 'error' as const },
    PENDING: { label: 'Pending', variant: 'warning' as const },
  };

  const columns: Column<WasteRecord>[] = [
    {
      id: 'createdAt',
      label: 'Date',
      sortable: true,
      render: (value: string) => (
        <span className="text-gray-900 dark:text-gray-100">
          {new Date(value).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: 'ingredientId',
      label: 'Ingredient',
      sortable: true,
      render: (value: string) => (
        <span className="font-medium text-gray-900 dark:text-gray-100">{value}</span>
      ),
    },
    {
      id: 'quantity',
      label: 'Quantity',
      sortable: true,
      align: 'right' as const,
      render: (value: number, row: WasteRecord) => (
        <span className="text-gray-900 dark:text-gray-100">
          {value} {row.unit}
        </span>
      ),
    },
    {
      id: 'cost',
      label: 'Cost',
      sortable: true,
      align: 'right' as const,
      render: (value: number) => (
        <span className="text-gray-900 dark:text-gray-100">
          ${value.toFixed(2)}
        </span>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      sortable: true,
      render: (value: string) => {
        const config = statusConfig[value as keyof typeof statusConfig] || { label: value, variant: 'default' as const };
        return (
          <Badge variant="solid" size="sm">
            {config.label}
          </Badge>
        );
      },
    },
    {
      id: 'id',
      label: 'Actions',
      sortable: false,
      render: (_value: string, row: WasteRecord) => (
        <div className="flex gap-2">
          {row.status === 'PENDING' && (
            <>
              <Button
                size="sm"
                variant="secondary"
                disabled={approveWaste.isPending || rejectWaste.isPending}
                onClick={() => approveWaste.mutate(row.id)}
              >
                {approveWaste.isPending ? '...' : 'Approve'}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                disabled={approveWaste.isPending || rejectWaste.isPending}
                onClick={() => rejectWaste.mutate(row.id)}
              >
                {rejectWaste.isPending ? '...' : 'Reject'}
              </Button>
            </>
          )}
          {row.status !== 'PENDING' && (
            <span className="text-xs text-gray-500 dark:text-gray-400">No actions</span>
          )}
        </div>
      ),
    },
  ];

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string | string[]) => {
    setFormData((prev) => ({ ...prev, unit: value as string }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createWaste.mutateAsync({
        ingredientId: formData.ingredientId,
        category: formData.category,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        cost: parseFloat(formData.cost),
      });
      setFormData({ ingredientId: '', category: '', quantity: '', unit: 'kg', cost: '' });
      setShowForm(false);
    } catch {
      // Error is handled by the mutation
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Waste Records</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Track and manage food waste</p>
          </div>
          <Button
            size="md"
            variant="primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : 'New Record'}
          </Button>
        </div>
      </div>

      {createWaste.isError && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 rounded-lg text-red-800 dark:text-red-200" role="alert">
          <p className="font-semibold">Error creating record</p>
          <p className="text-sm">{createWaste.error?.message || 'Failed to create waste record'}</p>
        </div>
      )}

      {createWaste.isSuccess && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-900 rounded-lg text-green-800 dark:text-green-200" role="status">
          <p className="font-semibold">Success</p>
          <p className="text-sm">Waste record created successfully</p>
        </div>
      )}

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Create Waste Record</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleFormChange}
                placeholder="e.g., Produce"
                required
              />
              <Input
                label="Ingredient ID"
                name="ingredientId"
                value={formData.ingredientId}
                onChange={handleFormChange}
                placeholder="Ingredient ID"
                required
              />
              <Input
                label="Quantity"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleFormChange}
                placeholder="0.00"
                step="0.01"
                required
              />
              <Select
                label="Unit"
                value={formData.unit}
                onChange={handleSelectChange}
                options={[
                  { value: 'kg', label: 'kg' },
                  { value: 'g', label: 'g' },
                  { value: 'lb', label: 'lb' },
                  { value: 'oz', label: 'oz' },
                ]}
              />
              <Input
                label="Cost ($)"
                name="cost"
                type="number"
                value={formData.cost}
                onChange={handleFormChange}
                placeholder="0.00"
                step="0.01"
                required
              />
            </div>

            <Button
              type="submit"
              size="md"
              variant="primary"
              fullWidth
              disabled={createWaste.isPending}
            >
              {createWaste.isPending ? 'Creating...' : 'Create Record'}
            </Button>
          </form>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 rounded-lg text-red-800 dark:text-red-200" role="alert">
          <p className="font-semibold">Error loading records</p>
          <p className="text-sm">{error instanceof Error ? error.message : 'Failed to load waste records'}</p>
        </div>
      )}

      <div className="mb-6">
        <Table
          columns={columns}
          data={records}
          keyExtractor={(record) => record.id}
          isLoading={isLoading}
          rowsPerPage={rowsPerPage}
          currentPage={currentPage}
          emptyState={
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="text-4xl">🗑️</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">No waste records</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Create your first record to get started</p>
            </div>
          }
        />
      </div>

      {!isLoading && totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
