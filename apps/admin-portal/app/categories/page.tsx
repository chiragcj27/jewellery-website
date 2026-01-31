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
  description?: string;
  image?: string;
  isActive: boolean;
  displayOrder: number;
  filters: Filter[];
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    imageAssetId: '',
    isActive: true,
    displayOrder: 0,
    filters: [] as Filter[],
  });
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const result = await api.categories.getAll();
      if (result.success) {
        setCategories(result.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        image: formData.image || undefined,
        imageAssetId: formData.imageAssetId || undefined,
        isActive: formData.isActive,
        displayOrder: formData.displayOrder,
        filters: formData.filters,
      };
      const result = editingCategory
        ? await api.categories.update(editingCategory._id, payload)
        : await api.categories.create(payload);

      if (result.success) {
        await fetchCategories();
        resetForm();
      } else {
        alert(result.error || 'Failed to save category');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Failed to save category');
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      image: category.image || '',
      imageAssetId: '',
      isActive: category.isActive,
      displayOrder: category.displayOrder,
      filters: category.filters || [],
    });
    setImageError(null);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const result = await api.categories.delete(id);
      if (result.success) {
        await fetchCategories();
      } else {
        alert(result.error || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      image: '',
      imageAssetId: '',
      isActive: true,
      displayOrder: 0,
      filters: [],
    });
    setEditingCategory(null);
    setShowForm(false);
    setImageError(null);
  };

  const addFilter = () => {
    setFormData({
      ...formData,
      filters: [
        ...formData.filters,
        { name: '', slug: '', type: 'select', options: [] },
      ],
    });
  };

  const updateFilter = (index: number, field: keyof Filter, value: string | string[]) => {
    const newFilters = [...formData.filters];
    if (field === 'name') {
      newFilters[index].name = value as string;
      newFilters[index].slug = (value as string).toLowerCase().replace(/\s+/g, '-');
    } else {
      (newFilters[index][field] as typeof value) = value;
    }
    setFormData({ ...formData, filters: newFilters });
  };

  const removeFilter = (index: number) => {
    const newFilters = formData.filters.filter((_, i) => i !== index);
    setFormData({ ...formData, filters: newFilters });
  };

  const addFilterOption = (filterIndex: number, option: string) => {
    if (!option.trim()) return;
    const newFilters = [...formData.filters];
    if (!newFilters[filterIndex].options.includes(option.trim())) {
      newFilters[filterIndex].options.push(option.trim());
      setFormData({ ...formData, filters: newFilters });
    }
  };

  const removeFilterOption = (filterIndex: number, optionIndex: number) => {
    const newFilters = [...formData.filters];
    newFilters[filterIndex].options = newFilters[filterIndex].options.filter(
      (_, i) => i !== optionIndex
    );
    setFormData({ ...formData, filters: newFilters });
  };

  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/^image\/(jpeg|png|gif|webp)$/i.test(file.type)) {
      setImageError('Only JPEG, PNG, GIF, and WebP are allowed.');
      return;
    }
    setImageError(null);
    setImageUploading(true);
    try {
      const result = await api.assets.upload(file);
      if (result.success && result.data) {
        setFormData({
          ...formData,
          image: result.data.url,
          imageAssetId: result.data.assetId,
        });
      } else {
        setImageError(result.error || 'Upload failed');
      }
    } catch {
      setImageError('Upload failed');
    } finally {
      setImageUploading(false);
      e.target.value = '';
    }
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
            <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {showForm ? 'Cancel' : '+ Add Category'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingCategory ? 'Edit Category' : 'New Category'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleImageFile}
                  disabled={imageUploading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700"
                />
                {imageUploading && (
                  <p className="mt-1 text-sm text-gray-500">Uploading…</p>
                )}
                {imageError && (
                  <p className="mt-1 text-sm text-red-600">{imageError}</p>
                )}
                {formData.image && (
                  <div className="mt-2 flex items-center gap-2">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="h-16 w-16 object-cover rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image: '', imageAssetId: '' })}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
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
                <div className="flex items-center pt-6">
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
              </div>

              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-medium text-gray-900">Product Filters</h3>
                  <button
                    type="button"
                    onClick={addFilter}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                  >
                    + Add Filter
                  </button>
                </div>
                {formData.filters.length === 0 ? (
                  <p className="text-sm text-gray-500">No filters added yet.</p>
                ) : (
                  <div className="space-y-4">
                    {formData.filters.map((filter, index) => (
                      <div key={index} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="text-sm font-medium text-gray-700">Filter {index + 1}</h4>
                          <button
                            type="button"
                            onClick={() => removeFilter(index)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Filter Name
                            </label>
                            <input
                              type="text"
                              value={filter.name}
                              onChange={(e) => updateFilter(index, 'name', e.target.value)}
                              placeholder="e.g., Metal Type"
                              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Filter Type
                            </label>
                            <select
                              value={filter.type}
                              onChange={(e) => updateFilter(index, 'type', e.target.value)}
                              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="select">Single Select</option>
                              <option value="multiselect">Multi Select</option>
                            </select>
                          </div>
                        </div>
                        <div className="mt-3">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Filter Options
                          </label>
                          <div className="flex gap-2 mb-2">
                            <input
                              type="text"
                              placeholder="Add option"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  const input = e.target as HTMLInputElement;
                                  addFilterOption(index, input.value);
                                  input.value = '';
                                }
                              }}
                              className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                                addFilterOption(index, input.value);
                                input.value = '';
                              }}
                              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                            >
                              Add
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {filter.options.map((option, optionIndex) => (
                              <span
                                key={optionIndex}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                              >
                                {option}
                                <button
                                  type="button"
                                  onClick={() => removeFilterOption(index, optionIndex)}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingCategory ? 'Update' : 'Create'}
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
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No categories found. Create your first category!
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{category.name}</div>
                      {category.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {category.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {category.slug}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          category.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {category.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {category.displayOrder}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(category)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(category._id)}
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
