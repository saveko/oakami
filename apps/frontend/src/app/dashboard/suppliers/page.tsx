'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Pagination } from '@/components/ui/Pagination';
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

const ITEMS_PER_PAGE = 6;

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [totalSuppliers, setTotalSuppliers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchSuppliers(currentPage);
  }, [currentPage]);

  const fetchSuppliers = async (page: number) => {
    setIsLoading(true);
    try {
      const skip = (page - 1) * ITEMS_PER_PAGE;
      const data = await api.listSuppliers({ limit: ITEMS_PER_PAGE, skip });
      setSuppliers(Array.isArray(data) ? data : data.data || []);
      // Assume API returns total count - if not, calculate from response
      setTotalSuppliers(Array.isArray(data) ? data.length : data.total || 0);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load suppliers');
    } finally {
      setIsLoading(false);
    }
  };

  const totalPages = Math.ceil(totalSuppliers / ITEMS_PER_PAGE) || 1;

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
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {suppliers.map((supplier) => (
              <Card key={supplier.id} padding="lg" className="hover:shadow-lg transition flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{supplier.name}</h3>
                    <p className="text-gray-600 text-sm">{supplier.email}</p>
                  </div>
                  <div className="text-right ml-4">
                    <div className={`text-2xl font-bold ${getRatingColor(supplier.rating)}`}>
                      ★ {supplier.rating.toFixed(1)}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm mb-4 flex-1">
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

                <Button variant="ghost" size="md" fullWidth>
                  View Details
                </Button>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      ) : (
        <Card padding="lg" className="text-center text-gray-600">
          <p>No suppliers found.</p>
        </Card>
      )}
    </div>
  );
}
