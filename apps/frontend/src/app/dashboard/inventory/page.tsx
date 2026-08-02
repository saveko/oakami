'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

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
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const data = await api.listInventory({ limit: 100 });
      setItems(Array.isArray(data) ? data : data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load inventory');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading inventory...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
        <p className="text-gray-600 mt-2">Track and manage your stock</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {items.length > 0 ? (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Cost
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Expiry Date
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Supplier
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">
                    {item.name}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-900">
                    {item.quantity} {item.unit}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-900">
                    ${item.cost.toFixed(2)}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-900">
                    {new Date(item.expiryDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-900">
                    {item.supplier}
                  </td>
                  <td className="px-6 py-3 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      item.status === 'in_stock'
                        ? 'bg-green-100 text-green-800'
                        : item.status === 'low_stock'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.status === 'in_stock' ? 'In Stock' : item.status === 'low_stock' ? 'Low Stock' : 'Out of Stock'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center text-gray-600">
            No inventory items found.
          </div>
        )}
      </div>
    </div>
  );
}
