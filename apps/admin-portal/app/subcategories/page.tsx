'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface Subcategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  category: Category | string;
  isActive: boolean;
  displayOrder: number;
}

export default function SubcategoriesPage() {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    image: '',
    imageAssetId: '',
    isActive: true,
    displayOrder: 0,
  });
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCategories();
    fetchSubcategories();
  }, []);

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

  const fetchSubcategories = async () => {
    try {
      const result = await api.subcategories.getAll();
      if (result.success) {
        setSubcategories(result.data);
      }
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category) {
      alert('Please select a category');
      return;
    }

    try {
      const payload = {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        image: formData.image || undefined,
        imageAssetId: formData.imageAssetId || undefined,
        isActive: formData.isActive,
        displayOrder: formData.displayOrder,
      };
      const result = editingSubcategory
        ? await api.subcategories.update(editingSubcategory._id, payload)
        : await api.subcategories.create(payload);

      if (result.success) {
        await fetchSubcategories();
        resetForm();
      } else {
        alert(result.error || 'Failed to save subcategory');
      }
    } catch (error) {
      console.error('Error saving subcategory:', error);
      alert('Failed to save subcategory');
    }
  };

  const handleEdit = (subcategory: Subcategory) => {
    setEditingSubcategory(subcategory);
    const categoryId = typeof subcategory.category === 'object'
      ? subcategory.category._id
      : subcategory.category;
    setFormData({
      name: subcategory.name,
      category: categoryId,
      description: subcategory.description || '',
      image: subcategory.image || '',
      imageAssetId: '',
      isActive: subcategory.isActive,
      displayOrder: subcategory.displayOrder,
    });
    setImageError(null);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subcategory?')) return;

    try {
      const result = await api.subcategories.delete(id);
      if (result.success) {
        await fetchSubcategories();
      } else {
        alert(result.error || 'Failed to delete subcategory');
      }
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      alert('Failed to delete subcategory');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      description: '',
      image: '',
      imageAssetId: '',
      isActive: true,
      displayOrder: 0,
    });
    setEditingSubcategory(null);
    setShowForm(false);
    setImageError(null);
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
            <h1 className="text-3xl font-bold text-gray-900">Subcategories</h1>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {showForm ? 'Cancel' : '+ Add Subcategory'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingSubcategory ? 'Edit Subcategory' : 'New Subcategory'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subcategory Image
                </label>
                {/* Hidden file input */}
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleImageFile}
                  disabled={imageUploading}
                  className="hidden"
                />
                {/* Hover-to-upload image box */}
                <div
                  onClick={() => !imageUploading && imageInputRef.current?.click()}
                  className="group relative w-36 h-36 rounded-xl border-2 border-dashed border-gray-300 overflow-hidden cursor-pointer transition-all hover:border-blue-400 hover:shadow-md"
                  title={formData.image ? 'Click to change image' : 'Click to upload image'}
                >
                  {formData.image ? (
                    <>
                      <img
                        src={formData.image}
                        alt="Subcategory"
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
                      {imageUploading ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )}
                      <span className="text-xs font-medium text-center px-2">
                        {imageUploading ? 'Uploading…' : 'Click to upload'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Status / error messages */}
                {imageUploading && (
                  <p className="mt-1.5 text-xs text-blue-600 font-medium">Uploading image…</p>
                )}
                {imageError && (
                  <p className="mt-1.5 text-xs text-red-600">{imageError}</p>
                )}
                {formData.image && !imageUploading && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, image: '', imageAssetId: '' })}
                    className="mt-1.5 text-xs text-red-500 hover:text-red-700 font-medium"
                  >
                    Remove image
                  </button>
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
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingSubcategory ? 'Update' : 'Create'}
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
                  Category
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
              {subcategories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No subcategories found. Create your first subcategory!
                  </td>
                </tr>
              ) : (
                subcategories.map((subcategory) => {
                  const categoryName = typeof subcategory.category === 'object' 
                    ? subcategory.category.name 
                    : 'Unknown';
                  return (
                    <tr key={subcategory._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{subcategory.name}</div>
                        {subcategory.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {subcategory.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {categoryName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            subcategory.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {subcategory.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {subcategory.displayOrder}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(subcategory)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(subcategory._id)}
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
      </div>
    </div>
  );
}
