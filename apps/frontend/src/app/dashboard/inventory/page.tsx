'use client';

import React, { useState } from 'react';
import { Table, type Column } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { Error as ErrorComponent } from '@/components/ui/Error';
import { Button } from '@/components/ui/Button';
import { useInventory } from '@/lib/hooks/useInventory';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  cost: number;
  expiryDate: string;
  supplier: string;
  status: string;
}

export default function InventoryPage() {
  const [currentPage, setCurrentPage] = useState(1);

  const rowsPerPage = 20;
  const skip = (currentPage - 1) * rowsPerPage;

  const { data: responseData, isLoading, error } = useInventory({
    skip,
    take: rowsPerPage,
  });

  const items = responseData?.data || (Array.isArray(responseData) ? responseData : []);
  const totalItems = responseData?.pagination?.total || items.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);

  const statusConfig = {
    in_stock: { label: 'In Stock', variant: 'success' as const },
    low_stock: { label: 'Low Stock', variant: 'warning' as const },
    out_of_stock: { label: 'Out of Stock', variant: 'error' as const },
  };

  const columns: Column<InventoryItem>[] = [
    {
      id: 'name',
      label: 'Item Name',
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
      render: (value: number, row: InventoryItem) => (
        <span className="text-gray-900 dark:text-gray-100">
          {value} {row.unit}
        </span>
      ),
    },
    {
      id: 'cost',
      label: 'Unit Cost',
      sortable: true,
      align: 'right' as const,
      render: (value: number) => (
        <span className="text-gray-900 dark:text-gray-100">
          ${value.toFixed(2)}
        </span>
      ),
    },
    {
      id: 'expiryDate',
      label: 'Expiry Date',
      sortable: true,
      render: (value: string) => (
        <span className="text-gray-600 dark:text-gray-400">
          {new Date(value).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: 'supplier',
      label: 'Supplier',
      sortable: false,
      render: (value: string) => (
        <span className="text-gray-600 dark:text-gray-400">{value || '—'}</span>
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
  ];


  if (error) {
    const errorMessage = typeof error === 'object' && error !== null && 'response' in error
      ? (error as any).response?.data?.message || 'An error occurred while loading your inventory.'
      : error instanceof Error ? error.message : 'An error occurred while loading your inventory.';

    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Inventory Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Track and manage your stock</p>
        </div>
        <ErrorComponent
          title="Failed to load inventory"
          message={errorMessage}
          action={{
            label: 'Retry',
            onClick: () => window.location.reload(),
          }}
        />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Inventory Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Track and manage your stock</p>
          </div>
          <Button size="md" variant="primary">
            Add Item
          </Button>
        </div>
      </div>

      <ErrorBoundary name="Inventory">
      <div className="mb-6">
        <Table
          columns={columns}
          data={items}
          keyExtractor={(item) => item.id}
          isLoading={isLoading}
          rowsPerPage={rowsPerPage}
          currentPage={currentPage}
          emptyState={
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="text-4xl">📦</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">No inventory items</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Start by adding your first inventory item to track your stock.</p>
            </div>
          }
        />
      </div>
      </ErrorBoundary>

      {!isLoading && totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <Loading variant="spinner" size="md" label="Loading inventory..." />
        </div>
      )}
    </div>
  );
}
