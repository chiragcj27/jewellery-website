'use client';

import { useState, useEffect, useRef } from 'react';
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
  cardImage?: string;
  cardImageHover?: string;
  isActive: boolean;
  displayOrder: number;
  filters: Filter[];
}

type ImageField = 'image' | 'cardImage' | 'cardImageHover';

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
    cardImage: '',
    cardImageAssetId: '',
    cardImageHover: '',
    cardImageHoverAssetId: '',
    isActive: true,
    displayOrder: 0,
    filters: [] as Filter[],
  });

  const [uploadingField, setUploadingField] = useState<ImageField | null>(null);
  const [imageErrors, setImageErrors] = useState<Partial<Record<ImageField, string>>>({});

  const imageInputRef = useRef<HTMLInputElement>(null);
  const cardImageInputRef = useRef<HTMLInputElement>(null);
  const cardImageHoverInputRef = useRef<HTMLInputElement>(null);

  const inputRefMap: Record<ImageField, React.RefObject<HTMLInputElement | null>> = {
    image: imageInputRef,
    cardImage: cardImageInputRef,
    cardImageHover: cardImageHoverInputRef,
  };

  const assetIdKeyMap: Record<ImageField, 'imageAssetId' | 'cardImageAssetId' | 'cardImageHoverAssetId'> = {
    image: 'imageAssetId',
    cardImage: 'cardImageAssetId',
    cardImageHover: 'cardImageHoverAssetId',
  };

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
        cardImage: formData.cardImage || undefined,
        cardImageAssetId: formData.cardImageAssetId || undefined,
        cardImageHover: formData.cardImageHover || undefined,
        cardImageHoverAssetId: formData.cardImageHoverAssetId || undefined,
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
      cardImage: category.cardImage || '',
      cardImageAssetId: '',
      cardImageHover: category.cardImageHover || '',
      cardImageHoverAssetId: '',
      isActive: category.isActive,
      displayOrder: category.displayOrder,
      filters: category.filters || [],
    });
    setImageErrors({});
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
      cardImage: '',
      cardImageAssetId: '',
      cardImageHover: '',
      cardImageHoverAssetId: '',
      isActive: true,
      displayOrder: 0,
      filters: [],
    });
    setEditingCategory(null);
    setShowForm(false);
    setImageErrors({});
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

  const handleImageFile = async (field: ImageField, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/^image\/(jpeg|png|gif|webp)$/i.test(file.type)) {
      setImageErrors((prev) => ({ ...prev, [field]: 'Only JPEG, PNG, GIF, and WebP are allowed.' }));
      return;
    }
    setImageErrors((prev) => ({ ...prev, [field]: undefined }));
    setUploadingField(field);
    try {
      const result = await api.assets.upload(file);
      if (result.success && result.data) {
        setFormData((prev) => ({
          ...prev,
          [field]: result.data.url,
          [assetIdKeyMap[field]]: result.data.assetId,
        }));
      } else {
        setImageErrors((prev) => ({ ...prev, [field]: result.error || 'Upload failed' }));
      }
    } catch {
      setImageErrors((prev) => ({ ...prev, [field]: 'Upload failed' }));
    } finally {
      setUploadingField(null);
      e.target.value = '';
    }
  };

  const removeImage = (field: ImageField) => {
    setFormData((prev) => ({
      ...prev,
      [field]: '',
      [assetIdKeyMap[field]]: '',
    }));
  };

  /** Reusable image upload box */
  const ImageUploadBox = ({ field, label }: { field: ImageField; label: string }) => {
    const isUploading = uploadingField === field;
    const currentUrl = formData[field];
    const error = imageErrors[field];
    const ref = inputRefMap[field];

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
        {/* Hidden file input */}
        <input
          ref={ref}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={(e) => handleImageFile(field, e)}
          disabled={isUploading}
          className="hidden"
        />
        {/* Hover-to-upload image box */}
        <div
          onClick={() => !isUploading && ref.current?.click()}
          className="group relative w-36 h-36 rounded-xl border-2 border-dashed border-gray-300 overflow-hidden cursor-pointer transition-all hover:border-blue-400 hover:shadow-md"
          title={currentUrl ? 'Click to change image' : 'Click to upload image'}
        >
          {currentUrl ? (
            <>
              <img
                src={currentUrl}
                alt={label}
                className="w-full h-full object-cover"
              />
              {/* Hover overlay on existing image */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-white text-xs font-medium">Change Image</span>
              </div>
            </>
          ) : (
            /* Empty state */
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-400 group-hover:text-blue-500 transition-colors bg-gray-50 group-hover:bg-blue-50">
              {isUploading ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}
              <span className="text-xs font-medium text-center px-2">
                {isUploading ? 'Uploading…' : 'Click to upload'}
              </span>
            </div>
          )}
        </div>

        {/* Status / error messages */}
        {isUploading && (
          <p className="mt-1.5 text-xs text-blue-600 font-medium">Uploading image…</p>
        )}
        {error && (
          <p className="mt-1.5 text-xs text-red-600">{error}</p>
        )}
        {currentUrl && !isUploading && (
          <button
            type="button"
            onClick={() => removeImage(field)}
            className="mt-1.5 text-xs text-red-500 hover:text-red-700 font-medium"
          >
            Remove image
          </button>
        )}
      </div>
    );
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

              {/* Three image upload fields in a row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <ImageUploadBox field="image" label="Category Page Banner" />
                <ImageUploadBox field="cardImage" label="Card Image" />
                <ImageUploadBox field="cardImageHover" label="Card Image (Hover)" />
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
