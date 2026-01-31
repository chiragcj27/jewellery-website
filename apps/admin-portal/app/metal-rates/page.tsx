'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

interface MetalRate {
  _id: string;
  metalType: string;
  ratePerTenGrams: number;
  makingChargePerGram: number;
  gstPercentage: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function MetalRatesPage() {
  const [metalRates, setMetalRates] = useState<MetalRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRate, setEditingRate] = useState<MetalRate | null>(null);
  const [formData, setFormData] = useState({
    metalType: '',
    ratePerTenGrams: '',
    makingChargePerGram: '',
    gstPercentage: '3',
    isActive: true,
  });

  useEffect(() => {
    fetchMetalRates();
  }, []);

  const fetchMetalRates = async () => {
    try {
      const result = await api.metalRates.getAll();
      if (result.success) {
        setMetalRates(result.data);
      }
    } catch (error) {
      console.error('Error fetching metal rates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.metalType || !formData.ratePerTenGrams || !formData.makingChargePerGram) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const rateData = {
        metalType: formData.metalType.trim(),
        ratePerTenGrams: parseFloat(formData.ratePerTenGrams),
        makingChargePerGram: parseFloat(formData.makingChargePerGram),
        gstPercentage: parseFloat(formData.gstPercentage),
        isActive: formData.isActive,
      };

      const result = editingRate
        ? await api.metalRates.update(editingRate._id, rateData)
        : await api.metalRates.create(rateData);

      if (result.success) {
        await fetchMetalRates();
        resetForm();
      } else {
        alert(result.error || 'Failed to save metal rate');
      }
    } catch (error) {
      console.error('Error saving metal rate:', error);
      alert('Failed to save metal rate');
    }
  };

  const handleEdit = (rate: MetalRate) => {
    setEditingRate(rate);
    setFormData({
      metalType: rate.metalType,
      ratePerTenGrams: rate.ratePerTenGrams.toString(),
      makingChargePerGram: rate.makingChargePerGram.toString(),
      gstPercentage: rate.gstPercentage.toString(),
      isActive: rate.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this metal rate?')) return;

    try {
      const result = await api.metalRates.delete(id);
      if (result.success) {
        await fetchMetalRates();
      } else {
        alert(result.error || 'Failed to delete metal rate');
      }
    } catch (error) {
      console.error('Error deleting metal rate:', error);
      alert('Failed to delete metal rate');
    }
  };

  const resetForm = () => {
    setFormData({
      metalType: '',
      ratePerTenGrams: '',
      makingChargePerGram: '',
      gstPercentage: '3',
      isActive: true,
    });
    setEditingRate(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Link href="/" className="text-blue-600 hover:text-blue-800 mb-2 inline-block">
              ← Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Metal Rates Management</h1>
            <p className="text-gray-600 mt-1">
              Configure gold rates, making charges, and GST for different metal types
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {showForm ? 'Cancel' : '+ Add Metal Rate'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingRate ? 'Edit Metal Rate' : 'New Metal Rate'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Metal Type * (e.g., 22KT, 18KT, 20KT, 24KT, Silver, Platinum)
                </label>
                <input
                  type="text"
                  required
                  value={formData.metalType}
                  onChange={(e) => setFormData({ ...formData, metalType: e.target.value })}
                  placeholder="22KT"
                  disabled={!!editingRate}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
                {editingRate && (
                  <p className="text-xs text-gray-500 mt-1">Metal type cannot be changed after creation</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rate per 10 Grams * (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.ratePerTenGrams}
                    onChange={(e) => setFormData({ ...formData, ratePerTenGrams: e.target.value })}
                    placeholder="75000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Gold rate per 10 grams</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Making Charge per Gram * (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.makingChargePerGram}
                    onChange={(e) => setFormData({ ...formData, makingChargePerGram: e.target.value })}
                    placeholder="500"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Making charges per gram</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    GST Percentage * (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.gstPercentage}
                    onChange={(e) => setFormData({ ...formData, gstPercentage: e.target.value })}
                    placeholder="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">GST rate (typically 3%)</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h3 className="font-medium text-blue-900 mb-2">Price Calculation Formula:</h3>
                <p className="text-sm text-blue-800">
                  Final Price = (Rate per 10g ÷ 10 × Weight) + (Making Charge per gram × Weight) + GST
                </p>
                <p className="text-xs text-blue-700 mt-2">
                  Example: For a 5g product with 22KT at ₹75,000/10g, ₹500/g making, 3% GST:
                  <br />
                  Gold Cost = (75000 ÷ 10) × 5 = ₹37,500
                  <br />
                  Making = 500 × 5 = ₹2,500
                  <br />
                  Subtotal = ₹40,000
                  <br />
                  GST = 40000 × 0.03 = ₹1,200
                  <br />
                  <strong>Final Price = ₹41,200</strong>
                </p>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Active</span>
                </label>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingRate ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Metal Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rate per 10g
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Making Charge/g
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  GST %
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {metalRates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No metal rates found. Create your first metal rate!
                  </td>
                </tr>
              ) : (
                metalRates.map((rate) => (
                  <tr key={rate._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{rate.metalType}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">₹{rate.ratePerTenGrams.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">₹{rate.makingChargePerGram.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{rate.gstPercentage}%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          rate.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {rate.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(rate)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(rate._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
