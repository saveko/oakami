'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  rating: number;
  wastePercentage: number;
  totalPurchases: number;
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    setIsLoading(true);
    try {
      const data = await api.listSuppliers({ limit: 100 });
      setSuppliers(Array.isArray(data) ? data : data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load suppliers');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading suppliers...</div>
      </div>
    );
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Suppliers</h1>
        <p className="text-gray-600 mt-2">Manage and monitor supplier performance</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      {suppliers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {suppliers.map((supplier) => (
            <div
              key={supplier.id}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{supplier.name}</h3>
                  <p className="text-gray-600 text-sm">{supplier.email}</p>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${getRatingColor(supplier.rating)}`}>
                    ★ {supplier.rating.toFixed(1)}
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="text-gray-900 font-medium">{supplier.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Waste %:</span>
                  <span className="text-gray-900 font-medium">{supplier.wastePercentage.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Purchases:</span>
                  <span className="text-gray-900 font-medium">${supplier.totalPurchases.toFixed(2)}</span>
                </div>
              </div>

              <button className="w-full px-4 py-2 border border-sky-500 text-sky-500 rounded-lg hover:bg-sky-50 transition">
                View Details
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-600">
          No suppliers found.
        </div>
      )}
    </div>
  );
}
