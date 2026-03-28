'use client';

import { useState, useEffect, useCallback } from 'react';
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
  sizeLength?: string;
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
  makingChargesPercentage?: number;
  useDynamicPricing: boolean;
  hasStone: boolean;
  stoneName?: string;
  stoneWeight?: number;
  stoneValue?: number;
  filterValues: Record<string, string | string[]>;
}

interface MetalRate {
  _id: string;
  metalType: string;
  ratePerTenGrams: number;
  makingChargesPercentage: number;
  gstPercentage: number;
  isActive: boolean;
}

function visiblePageItems(page: number, totalPages: number): (number | '…')[] {
  if (totalPages <= 1) return [1];
  const delta = 2;
  const range: number[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) {
      range.push(i);
    }
  }
  const out: (number | '…')[] = [];
  let prev: number | undefined;
  for (const i of range) {
    if (prev !== undefined && i - prev > 1) out.push('…');
    out.push(i);
    prev = i;
  }
  return out;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [metalRates, setMetalRates] = useState<MetalRate[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    subcategory: '',
    description: '',
    sizeLength: '',
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
    makingChargesPercentage: '',
    useDynamicPricing: false,
    hasStone: false,
    stoneName: '',
    stoneWeight: '',
    stoneValue: '',
  });
  const [imagesUploading, setImagesUploading] = useState(false);
  const [imagesError, setImagesError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(24);
  const [listCategoryFilter, setListCategoryFilter] = useState('');
  const [listSubcategoryFilter, setListSubcategoryFilter] = useState('');
  const [filterSubcategories, setFilterSubcategories] = useState<Subcategory[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [listLoading, setListLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
    fetchMetalRates();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput.trim()), 320);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    if (!listCategoryFilter) {
      setFilterSubcategories([]);
      setListSubcategoryFilter('');
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const result = await api.subcategories.getAll(listCategoryFilter);
        if (cancelled || !result.success) return;
        const subs = result.data as Subcategory[];
        setFilterSubcategories(subs);
        setListSubcategoryFilter((prev) => {
          if (prev && subs.some((s) => s._id === prev)) return prev;
          return '';
        });
      } catch (error) {
        if (!cancelled) console.error('Error fetching filter subcategories:', error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [listCategoryFilter]);

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

  const fetchProductList = useCallback(async () => {
    setListLoading(true);
    try {
      const result = await api.products.getAll({
        page,
        limit: pageSize,
        categoryId: listCategoryFilter || undefined,
        subcategoryId: listSubcategoryFilter || undefined,
        search: debouncedSearch || undefined,
      });
      if (result.success) {
        setProducts(result.data);
        setTotalCount(result.totalCount ?? 0);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setListLoading(false);
    }
  }, [page, pageSize, listCategoryFilter, listSubcategoryFilter, debouncedSearch]);

  useEffect(() => {
    void fetchProductList();
  }, [fetchProductList]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      alert('Product name is required');
      return;
    }
    if (!formData.sku?.trim()) {
      alert('SKU is required (used for product URL)');
      return;
    }
    if (!formData.category || !formData.subcategory) {
      alert('Please select category and subcategory');
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
        sizeLength: formData.sizeLength || undefined,
        images: formData.images,
        imageAssetIds: formData.imageAssetIds.length ? formData.imageAssetIds : undefined,
        price: formData.price ? parseFloat(formData.price) : undefined,
        compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : undefined,
        sku: formData.sku.trim(),
        stock: formData.stock ? parseInt(formData.stock, 10) : 0,
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        displayOrder: formData.displayOrder,
        filterValues: formData.filterValues,
        weightInGrams: formData.weightInGrams ? parseFloat(formData.weightInGrams) : undefined,
        metalType: formData.metalType || undefined,
        makingChargesPercentage: formData.makingChargesPercentage ? parseFloat(formData.makingChargesPercentage) : undefined,
        useDynamicPricing: formData.useDynamicPricing,
        hasStone: formData.hasStone,
        stoneName: formData.hasStone && formData.stoneName ? formData.stoneName : undefined,
        stoneWeight: formData.hasStone && formData.stoneWeight ? parseFloat(formData.stoneWeight) : undefined,
        stoneValue: formData.hasStone && formData.stoneValue ? parseFloat(formData.stoneValue) : undefined,
      };

      const result = editingProduct
        ? await api.products.update(editingProduct._id, productData)
        : await api.products.create(productData);

      if (result.success) {
        await fetchProductList();
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
      sizeLength: product.sizeLength || '',
      images: product.images || [],
      imageAssetIds: [],
      price: product.price?.toString() || '',
      compareAtPrice: product.compareAtPrice?.toString() || '',
      sku: product.sku || '',
      stock: product.stock?.toString() || '',
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      displayOrder: product.displayOrder,
      filterValues: (product as Product).filterValues || {},
      weightInGrams: product.weightInGrams?.toString() || '',
      metalType: product.metalType || '',
      makingChargesPercentage: product.makingChargesPercentage?.toString() || '',
      useDynamicPricing: product.useDynamicPricing || false,
      hasStone: product.hasStone || false,
      stoneName: product.stoneName || '',
      stoneWeight: product.stoneWeight?.toString() || '',
      stoneValue: product.stoneValue?.toString() || '',
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
        await fetchProductList();
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
      sizeLength: '',
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
      makingChargesPercentage: '',
      useDynamicPricing: false,
      hasStone: false,
      stoneName: '',
      stoneWeight: '',
      stoneValue: '',
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

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const pageItems = visiblePageItems(page, totalPages);
  const hasActiveFilters = Boolean(
    listCategoryFilter || listSubcategoryFilter || debouncedSearch
  );

  const clearListFilters = () => {
    setListCategoryFilter('');
    setListSubcategoryFilter('');
    setSearchInput('');
    setDebouncedSearch('');
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-100 to-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-8">
          <div>
            <Link
              href="/"
              className="text-sm font-medium text-amber-800/90 hover:text-amber-950 mb-1 inline-flex items-center gap-1"
            >
              <span aria-hidden>←</span> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-stone-900">Products</h1>
            <p className="mt-1 text-sm text-stone-600">
              Browse, filter, and manage your catalogue
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/products/bulk-upload"
              className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold rounded-lg bg-emerald-700 text-white shadow-sm hover:bg-emerald-800 transition-colors"
            >
              Bulk upload
            </Link>
            <button
              type="button"
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold rounded-lg bg-amber-700 text-white shadow-sm hover:bg-amber-800 transition-colors"
            >
              {showForm ? 'Close form' : '+ Add product'}
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
                  Size / Length
                </label>
                <input
                  type="text"
                  value={formData.sizeLength}
                  onChange={(e) => setFormData({ ...formData, sizeLength: e.target.value })}
                  placeholder="e.g. 7 inches, 18 cm"
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
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Making Charges % (Override)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.makingChargesPercentage}
                          onChange={(e) => setFormData({ ...formData, makingChargesPercentage: e.target.value })}
                          placeholder="e.g. 15"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-xs text-blue-700">
                          Price: Gold value + (Gold value × Making %) + GST. Gold value = Weight × (Rate per 10g ÷ 10)
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

              {/* Stone Configuration */}
              <div className="border-t border-b border-gray-200 py-4 my-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Stone Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.hasStone}
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          setFormData({
                            ...formData,
                            hasStone: isChecked,
                            ...(isChecked ? {} : { stoneName: '', stoneWeight: '', stoneValue: '' })
                          });
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Product contains stone(s)
                      </span>
                    </label>
                  </div>

                  {formData.hasStone && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-purple-50 border border-purple-200 rounded-md p-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Stone Name
                        </label>
                        <input
                          type="text"
                          required={formData.hasStone}
                          value={formData.stoneName}
                          onChange={(e) => setFormData({ ...formData, stoneName: e.target.value })}
                          placeholder="e.g. Diamond, Ruby, Emerald"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Stone Weight (Carats)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          required={formData.hasStone}
                          value={formData.stoneWeight}
                          onChange={(e) => setFormData({ ...formData, stoneWeight: e.target.value })}
                          placeholder="e.g. 0.5"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Stone Value (₹ per carat)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          required={formData.hasStone}
                          value={formData.stoneValue}
                          onChange={(e) => setFormData({ ...formData, stoneValue: e.target.value })}
                          placeholder="e.g. 50000"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <p className="text-xs text-purple-700">
                          If dynamic pricing is used, the stone value (weight × value per carat) will be added to the final calculated price along with GST.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SKU <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="Unique product identifier (used for URL)"
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
                  <div className="mt-3 space-y-4">
                    <div className="flex flex-wrap gap-4">
                      {formData.images.map((url, i) => (
                        <div key={i} className="relative group flex flex-col items-center">
                          <div className="w-40 h-40 sm:w-52 sm:h-52 rounded-lg border-2 border-gray-200 overflow-hidden bg-gray-50 shadow-sm">
                            <img
                              src={url}
                              alt=""
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeProductImage(i)}
                            className="mt-2 px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                            aria-label="Remove image"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
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

        <section className="mb-6 rounded-2xl border border-stone-200/80 bg-white/90 backdrop-blur shadow-sm p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex-1 min-w-0 space-y-3">
              <label htmlFor="product-search" className="sr-only">
                Search products
              </label>
              <div className="relative">
                <span
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                  aria-hidden
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </span>
                <input
                  id="product-search"
                  type="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search by name, SKU, or description…"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-600/40 focus:border-amber-700/50"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-stone-500 mb-1.5">
                    Category
                  </label>
                  <select
                    value={listCategoryFilter}
                    onChange={(e) => {
                      setListCategoryFilter(e.target.value);
                      setListSubcategoryFilter('');
                      setPage(1);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-600/40"
                  >
                    <option value="">All categories</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-stone-500 mb-1.5">
                    Subcategory
                  </label>
                  <select
                    value={listSubcategoryFilter}
                    onChange={(e) => {
                      setListSubcategoryFilter(e.target.value);
                      setPage(1);
                    }}
                    disabled={!listCategoryFilter}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-600/40 disabled:bg-stone-100 disabled:text-stone-400"
                  >
                    <option value="">All subcategories</option>
                    {filterSubcategories.map((sub) => (
                      <option key={sub._id} value={sub._id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 lg:flex-col xl:flex-row xl:items-end">
              <div className="sm:w-40">
                <label className="block text-xs font-semibold uppercase tracking-wide text-stone-500 mb-1.5">
                  Per page
                </label>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-600/40"
                >
                  {[12, 24, 48, 96].map((n) => (
                    <option key={n} value={n}>
                      {n} items
                    </option>
                  ))}
                </select>
              </div>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearListFilters}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-stone-300 text-stone-700 bg-white hover:bg-stone-50 transition-colors"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-stone-600 border-t border-stone-100 pt-3">
            {listLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                Loading products…
              </span>
            ) : (
              <>
                <span>
                  Showing{' '}
                  <strong className="text-stone-900">
                    {totalCount === 0 ? 0 : (page - 1) * pageSize + 1}
                    –
                    {Math.min(page * pageSize, totalCount)}
                  </strong>{' '}
                  of <strong className="text-stone-900">{totalCount}</strong>
                </span>
                {hasActiveFilters && (
                  <span className="text-amber-900/80">Filtered results</span>
                )}
              </>
            )}
          </div>
        </section>

        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 min-h-[200px]">
          {listLoading && products.length === 0 ? (
            Array.from({ length: Math.min(pageSize, 8) }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-stone-200 bg-white overflow-hidden animate-pulse"
              >
                <div className="aspect-square bg-stone-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-stone-200 rounded w-3/4" />
                  <div className="h-3 bg-stone-100 rounded w-1/2" />
                  <div className="h-8 bg-stone-100 rounded mt-4" />
                </div>
              </div>
            ))
          ) : products.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-dashed border-stone-300 bg-white/80 p-14 text-center">
              <p className="text-stone-700 font-medium">
                {hasActiveFilters ? 'No products match your filters.' : 'No products yet.'}
              </p>
              <p className="mt-2 text-sm text-stone-500">
                {hasActiveFilters
                  ? 'Try adjusting search or category, or add a new product.'
                  : 'Create your first product to see it in the catalogue.'}
              </p>
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={clearListFilters}
                  className="mt-6 px-4 py-2 rounded-lg text-sm font-semibold bg-amber-700 text-white hover:bg-amber-800"
                >
                  Clear filters
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="mt-6 px-4 py-2 rounded-lg text-sm font-semibold bg-amber-700 text-white hover:bg-amber-800"
                >
                  Add product
                </button>
              )}
            </div>
          ) : (
            products.map((product) => {
              const categoryName = typeof product.category === 'object'
                ? product.category.name
                : 'Unknown';
              const subcategoryName = typeof product.subcategory === 'object'
                ? product.subcategory.name
                : 'Unknown';
              const firstImage = product.images?.[0];
              return (
                <div
                  key={product._id}
                  className={`group bg-white rounded-2xl border overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-all duration-200 ${
                    listLoading ? 'opacity-60 pointer-events-none' : ''
                  } border-stone-200/90 ring-1 ring-black/[0.03]`}
                >
                  <div className="aspect-square bg-gradient-to-b from-stone-50 to-stone-100/80 flex items-center justify-center overflow-hidden">
                    {firstImage ? (
                      <img
                        src={firstImage}
                        alt=""
                        className="w-full h-full object-contain group-hover:scale-[1.02] transition-transform duration-300"
                        title={product.name}
                      />
                    ) : (
                      <span className="text-stone-400 text-sm">No image</span>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-semibold text-stone-900 truncate" title={product.name}>
                      {product.name}
                    </h3>
                    {(product.description || product.sizeLength) && (
                      <p className="text-sm text-stone-600 mt-0.5 line-clamp-2">
                        {[product.sizeLength, product.description].filter(Boolean).join(' · ')}
                      </p>
                    )}
                    <div className="mt-2 text-xs text-stone-500">
                      <span className="text-amber-900/70">{categoryName}</span>
                      <span className="mx-1 text-stone-300">→</span>
                      <span>{subcategoryName}</span>
                    </div>
                    {product.sku && (
                      <div className="text-xs text-stone-400 mt-0.5 font-mono">SKU: {product.sku}</div>
                    )}
                    <div className="mt-3 flex items-center justify-between gap-2">
                      {product.useDynamicPricing ? (
                        <span className="text-sm font-semibold text-amber-800">
                          Dynamic · {product.weightInGrams}g
                        </span>
                      ) : (
                        <span className="text-sm font-semibold text-stone-900">
                          ${product.price?.toFixed(2) ?? '0.00'}
                        </span>
                      )}
                      <span className="text-sm text-stone-500">Stock: {product.stock ?? 0}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          product.isActive
                            ? 'bg-emerald-100 text-emerald-900'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {product.isFeatured && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-amber-100 text-amber-900">
                          Featured
                        </span>
                      )}
                      {product.images?.length > 1 && (
                        <span className="px-2 py-0.5 text-xs text-stone-500">
                          +{product.images.length - 1} img
                        </span>
                      )}
                    </div>
                    <div className="mt-4 flex gap-2 pt-3 border-t border-stone-100">
                      <button
                        type="button"
                        onClick={() => handleEdit(product)}
                        className="flex-1 py-2 text-sm font-semibold text-amber-900 bg-amber-50 rounded-xl hover:bg-amber-100/90"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(product._id)}
                        className="py-2 px-3 text-sm font-semibold text-red-700 bg-red-50 rounded-xl hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {totalPages > 1 && (
          <nav
            className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-between rounded-2xl border border-stone-200 bg-white/90 px-4 py-4 shadow-sm"
            aria-label="Pagination"
          >
            <p className="text-sm text-stone-600 order-2 sm:order-1">
              Page <strong className="text-stone-900">{page}</strong> of{' '}
              <strong className="text-stone-900">{totalPages}</strong>
            </p>
            <div className="flex flex-wrap items-center justify-center gap-1 order-1 sm:order-2">
              <button
                type="button"
                onClick={() => setPage(1)}
                disabled={page <= 1}
                className="px-2.5 py-1.5 text-sm font-medium rounded-lg border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                First
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-2.5 py-1.5 text-sm font-medium rounded-lg border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Prev
              </button>
              <div className="hidden sm:flex items-center gap-1 px-1">
                {pageItems.map((item, idx) =>
                  item === '…' ? (
                    <span key={`e${idx}`} className="px-2 text-stone-400">
                      …
                    </span>
                  ) : (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setPage(item)}
                      className={`min-w-[2.25rem] px-2 py-1.5 text-sm font-semibold rounded-lg ${
                        page === item
                          ? 'bg-amber-700 text-white shadow-sm'
                          : 'border border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}
              </div>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-2.5 py-1.5 text-sm font-medium rounded-lg border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
              <button
                type="button"
                onClick={() => setPage(totalPages)}
                disabled={page >= totalPages}
                className="px-2.5 py-1.5 text-sm font-medium rounded-lg border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Last
              </button>
            </div>
          </nav>
        )}
      </div>
    </div>
  );
}
