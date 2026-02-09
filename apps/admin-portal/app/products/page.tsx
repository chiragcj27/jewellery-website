'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

interface Filter {
  name: string;
  slug: string;
  type: 'select' | 'multiselect';
  options: string[];
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  filters?: Filter[];
}

interface Subcategory {
  _id: string;
  name: string;
  slug: string;
  category: Category | string;
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  images: string[];
  category: Category | string;
  subcategory: Subcategory | string;
  price?: number;
  compareAtPrice?: number;
  sku?: string;
  stock?: number;
  isActive: boolean;
  isFeatured: boolean;
  displayOrder: number;
  weightInGrams?: number;
  metalType?: string;
  useDynamicPricing: boolean;
}

interface MetalRate {
  _id: string;
  metalType: string;
  ratePerTenGrams: number;
  makingChargePerGram: number;
  gstPercentage: number;
  isActive: boolean;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [metalRates, setMetalRates] = useState<MetalRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    subcategory: '',
    description: '',
    shortDescription: '',
    images: [] as string[],
    imageAssetIds: [] as string[],
    price: '',
    compareAtPrice: '',
    sku: '',
    stock: '',
    isActive: true,
    isFeatured: false,
    displayOrder: 0,
    filterValues: {} as Record<string, string | string[]>,
    weightInGrams: '',
    metalType: '',
    useDynamicPricing: false,
  });
  const [imagesUploading, setImagesUploading] = useState(false);
  const [imagesError, setImagesError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 50;

  useEffect(() => {
    fetchCategories();
    fetchMetalRates();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page]);

  useEffect(() => {
    if (formData.category) {
      fetchSubcategories(formData.category);
    } else {
      setSubcategories([]);
      setFormData((prev) => ({ ...prev, subcategory: '', filterValues: {} }));
    }
  }, [formData.category]);

  const fetchCategories = async () => {
    try {
      const result = await api.categories.getAll();
      if (result.success) {
        setCategories(result.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchMetalRates = async () => {
    try {
      const result = await api.metalRates.getAll(true); // Only active rates
      if (result.success) {
        setMetalRates(result.data);
      }
    } catch (error) {
      console.error('Error fetching metal rates:', error);
    }
  };

  const fetchSubcategories = async (categoryId: string) => {
    try {
      const result = await api.subcategories.getAll(categoryId);
      if (result.success) {
        setSubcategories(result.data);
      }
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const result = await api.products.getAll({ page, limit });
      if (result.success) {
        setProducts(result.data);
        setTotalCount(result.totalCount ?? 0);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category || !formData.subcategory) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate pricing: either price OR (useDynamicPricing + weightInGrams + metalType)
    if (!formData.useDynamicPricing && !formData.price) {
      alert('Price is required when not using dynamic pricing');
      return;
    }

    if (formData.useDynamicPricing && (!formData.weightInGrams || !formData.metalType)) {
      alert('Weight and metal type are required for dynamic pricing');
      return;
    }

    try {
      const productData = {
        name: formData.name,
        category: formData.category,
        subcategory: formData.subcategory,
        description: formData.description || undefined,
        shortDescription: formData.shortDescription || undefined,
        images: formData.images,
        imageAssetIds: formData.imageAssetIds.length ? formData.imageAssetIds : undefined,
        price: formData.price ? parseFloat(formData.price) : undefined,
        compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : undefined,
        sku: formData.sku || undefined,
        stock: formData.stock ? parseInt(formData.stock, 10) : 0,
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        displayOrder: formData.displayOrder,
        filterValues: formData.filterValues,
        weightInGrams: formData.weightInGrams ? parseFloat(formData.weightInGrams) : undefined,
        metalType: formData.metalType || undefined,
        useDynamicPricing: formData.useDynamicPricing,
      };

      const result = editingProduct
        ? await api.products.update(editingProduct._id, productData)
        : await api.products.create(productData);

      if (result.success) {
        await fetchProducts();
        resetForm();
      } else {
        alert(result.error || 'Failed to save product');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    const categoryId = typeof product.category === 'object'
      ? product.category._id
      : product.category;
    const subcategoryId = typeof product.subcategory === 'object'
      ? product.subcategory._id
      : product.subcategory;

    setFormData({
      name: product.name,
      category: categoryId,
      subcategory: subcategoryId,
      description: product.description || '',
      shortDescription: product.shortDescription || '',
      images: product.images || [],
      imageAssetIds: [],
      price: product.price?.toString() || '',
      compareAtPrice: product.compareAtPrice?.toString() || '',
      sku: product.sku || '',
      stock: product.stock?.toString() || '',
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      displayOrder: product.displayOrder,
      filterValues: (product as any).filterValues || {},
      weightInGrams: product.weightInGrams?.toString() || '',
      metalType: product.metalType || '',
      useDynamicPricing: product.useDynamicPricing || false,
    });
    setImagesError(null);
    setShowForm(true);
    if (categoryId) {
      fetchSubcategories(categoryId);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const result = await api.products.delete(id);
      if (result.success) {
        await fetchProducts();
      } else {
        alert(result.error || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      subcategory: '',
      description: '',
      shortDescription: '',
      images: [],
      imageAssetIds: [],
      price: '',
      compareAtPrice: '',
      sku: '',
      stock: '',
      isActive: true,
      isFeatured: false,
      displayOrder: 0,
      filterValues: {},
      weightInGrams: '',
      metalType: '',
      useDynamicPricing: false,
    });
    setEditingProduct(null);
    setShowForm(false);
    setSubcategories([]);
    setImagesError(null);
  };

  const updateFilterValue = (filterSlug: string, value: string | string[]) => {
    setFormData({
      ...formData,
      filterValues: {
        ...formData.filterValues,
        [filterSlug]: value,
      },
    });
  };

  const toggleMultiselectOption = (filterSlug: string, option: string) => {
    const current = (formData.filterValues[filterSlug] || []) as string[];
    const newValue = current.includes(option)
      ? current.filter((o) => o !== option)
      : [...current, option];
    updateFilterValue(filterSlug, newValue);
  };

  const handleImageFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;
    const allowed = /^image\/(jpeg|png|gif|webp)$/i;
    const toUpload = files.filter((f) => allowed.test(f.type));
    if (toUpload.length !== files.length) {
      setImagesError('Only JPEG, PNG, GIF, and WebP are allowed.');
      return;
    }
    setImagesError(null);
    setImagesUploading(true);
    const newUrls: string[] = [];
    const newIds: string[] = [];
    for (const file of toUpload) {
      try {
        const result = await api.assets.upload(file);
        if (result.success && result.data) {
          newUrls.push(result.data.url);
          newIds.push(result.data.assetId);
        }
      } catch {
        setImagesError('Upload failed');
        setImagesUploading(false);
        e.target.value = '';
        return;
      }
    }
    setFormData({
      ...formData,
      images: [...formData.images, ...newUrls],
      imageAssetIds: [...formData.imageAssetIds, ...newIds],
    });
    setImagesUploading(false);
    e.target.value = '';
  };

  const removeProductImage = (index: number) => {
    const urls = formData.images.filter((_, i) => i !== index);
    const ids = formData.imageAssetIds.filter((_, i) => i !== index);
    setFormData({ ...formData, images: urls, imageAssetIds: ids });
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
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          </div>
          <div className="flex gap-2">
            <Link
              href="/products/bulk-upload"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Bulk Upload
            </Link>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {showForm ? 'Cancel' : '+ Add Product'}
            </button>
          </div>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingProduct ? 'Edit Product' : 'New Product'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value, subcategory: '' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subcategory *
                  </label>
                  <select
                    required
                    value={formData.subcategory}
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                    disabled={!formData.category}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    <option value="">Select a subcategory</option>
                    {subcategories.map((sub) => (
                      <option key={sub._id} value={sub._id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {formData.category && categories.find((c) => c._id === formData.category)?.filters && categories.find((c) => c._id === formData.category)!.filters!.length > 0 && (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Product Filters</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categories.find((c) => c._id === formData.category)!.filters!.map((filter) => (
                      <div key={filter.slug}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {filter.name}
                        </label>
                        {filter.type === 'select' ? (
                          <select
                            value={(formData.filterValues[filter.slug] as string) || ''}
                            onChange={(e) => updateFilterValue(filter.slug, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select {filter.name}</option>
                            {filter.options.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div className="space-y-2">
                            {filter.options.map((option) => (
                              <label key={option} className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={((formData.filterValues[filter.slug] || []) as string[]).includes(option)}
                                  onChange={() => toggleMultiselectOption(filter.slug, option)}
                                  className="mr-2"
                                />
                                <span className="text-sm text-gray-700">{option}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Short Description
                </label>
                <input
                  type="text"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                />
              </div>

              {/* Pricing Type Selection */}
              <div className="border-t border-b border-gray-200 py-4 my-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Pricing Configuration</h3>
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.useDynamicPricing}
                        onChange={(e) => setFormData({ ...formData, useDynamicPricing: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Use Weight-Based Dynamic Pricing
                      </span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1 ml-6">
                      Calculate price automatically based on weight and metal type
                    </p>
                  </div>

                  {formData.useDynamicPricing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50 border border-blue-200 rounded-md p-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Weight in Grams *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={formData.weightInGrams}
                          onChange={(e) => setFormData({ ...formData, weightInGrams: e.target.value })}
                          placeholder="5.5"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Metal Type *
                        </label>
                        <select
                          required
                          value={formData.metalType}
                          onChange={(e) => setFormData({ ...formData, metalType: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select metal type</option>
                          {metalRates.map((rate) => (
                            <option key={rate._id} value={rate.metalType}>
                              {rate.metalType} (₹{rate.ratePerTenGrams}/10g)
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-xs text-blue-700">
                          Price will be calculated automatically: (Gold Rate × Weight) + (Making Charges × Weight) + GST
                        </p>
                        {!metalRates.length && (
                          <p className="text-xs text-red-600 mt-1">
                            No metal rates configured. Please add metal rates in the <Link href="/metal-rates" className="underline">Metal Rates</Link> section.
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Price *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          required={!formData.useDynamicPricing}
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Compare At Price
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.compareAtPrice}
                          onChange={(e) => setFormData({ ...formData, compareAtPrice: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Stock
                        </label>
                        <input
                          type="number"
                          value={formData.stock}
                          onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SKU
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Images
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  multiple
                  onChange={handleImageFiles}
                  disabled={imagesUploading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700"
                />
                {imagesUploading && (
                  <p className="mt-1 text-sm text-gray-500">Uploading…</p>
                )}
                {imagesError && (
                  <p className="mt-1 text-sm text-red-600">{imagesError}</p>
                )}
                {formData.images.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.images.map((url, i) => (
                      <div key={i} className="relative group">
                        <img
                          src={url}
                          alt=""
                          className="h-16 w-16 object-cover rounded border"
                        />
                        <button
                          type="button"
                          onClick={() => removeProductImage(i)}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs leading-none opacity-0 group-hover:opacity-100 focus:opacity-100"
                          aria-label="Remove"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Active</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Featured</span>
                </label>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingProduct ? 'Update' : 'Create'}
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
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category / Subcategory
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
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
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No products found. Create your first product!
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const categoryName = typeof product.category === 'object' 
                    ? product.category.name 
                    : 'Unknown';
                  const subcategoryName = typeof product.subcategory === 'object' 
                    ? product.subcategory.name 
                    : 'Unknown';
                  return (
                    <tr key={product._id}>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        {product.shortDescription && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {product.shortDescription}
                          </div>
                        )}
                        {product.sku && (
                          <div className="text-xs text-gray-400">SKU: {product.sku}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{categoryName}</div>
                        <div className="text-xs text-gray-400">→ {subcategoryName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.useDynamicPricing ? (
                          <div>
                            <div className="font-medium text-blue-600">Dynamic Pricing</div>
                            <div className="text-xs text-gray-500">
                              {product.weightInGrams}g • {product.metalType}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="font-medium">${product.price?.toFixed(2) || '0.00'}</div>
                            {product.compareAtPrice && (
                              <div className="text-xs text-gray-400 line-through">
                                ${product.compareAtPrice.toFixed(2)}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.stock ?? 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              product.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {product.isActive ? 'Active' : 'Inactive'}
                          </span>
                          {product.isFeatured && (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              Featured
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalCount > limit && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, totalCount)} of {totalCount}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                disabled={page * limit >= totalCount}
                className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
