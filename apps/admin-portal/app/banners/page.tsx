'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';

interface Banner {
  _id: string;
  image: string;
  link?: string;
  title?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    link: '',
    title: '',
    imageFile: null as File | null,
    imagePreview: '',
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await api.banners.getAll();
      
      if (!result || result.error) {
        throw new Error(result?.error || 'Failed to fetch banners');
      }
      
      const data = Array.isArray(result) ? result : [];
      setBanners(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch banners');
      console.error('Error fetching banners:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        imageFile: file,
        imagePreview: URL.createObjectURL(file),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.imageFile) {
      setError('Please select an image');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setSuccessMessage(null);

      // Upload image first
      const uploadResult = await api.assets.upload(formData.imageFile);

      if (!uploadResult.success || !uploadResult.data?.url) {
        throw new Error(uploadResult.error || 'Failed to upload image');
      }

      // Create banner with uploaded image URL
      const result = await api.banners.create({
        image: uploadResult.data.url,
        link: formData.link || '',
        title: formData.title || '',
        isActive: true,
      });

      if (!result || result.error) {
        throw new Error(result?.error || 'Failed to create banner');
      }

      setSuccessMessage('Banner added successfully!');
      setShowAddForm(false);
      setFormData({
        link: '',
        title: '',
        imageFile: null,
        imagePreview: '',
      });
      
      // Refresh banners list
      await fetchBanners();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add banner');
      console.error('Error adding banner:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) {
      return;
    }

    try {
      setError(null);
      const result = await api.banners.delete(id);

      if (!result || result.error) {
        throw new Error(result?.error || 'Failed to delete banner');
      }

      setSuccessMessage('Banner deleted successfully!');
      await fetchBanners();
      
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete banner');
      console.error('Error deleting banner:', err);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      setError(null);
      const result = await api.banners.update(id, {
        isActive: !currentStatus,
      });

      if (!result || result.error) {
        throw new Error(result?.error || 'Failed to update banner');
      }

      setSuccessMessage('Banner status updated!');
      await fetchBanners();
      
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update banner');
      console.error('Error updating banner:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Loading banners...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center"
          >
            ← Back to Dashboard
          </Link>
          <div className="flex justify-between items-center mt-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Banners</h1>
              <p className="text-gray-600 mt-2">
                Manage homepage banner slideshow
              </p>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {showAddForm ? 'Cancel' : '+ Add Banner'}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
            <p className="font-medium">{successMessage}</p>
          </div>
        )}

        {/* Add Banner Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Add New Banner
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banner Image *
                </label>
                <div className="flex items-center gap-4">
                  <label className="cursor-pointer px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                    <span>Choose Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </label>
                  {formData.imageFile && (
                    <span className="text-sm text-gray-600">
                      {formData.imageFile.name}
                    </span>
                  )}
                </div>
                
                {formData.imagePreview && (
                  <div className="mt-4 relative w-full h-48 rounded-lg overflow-hidden">
                    <Image
                      src={formData.imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Link */}
              <div>
                <label
                  htmlFor="link"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Link (Optional)
                </label>
                <input
                  type="url"
                  id="link"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="e.g., /collections/new-arrivals"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-2 text-sm text-gray-500">
                  If provided, clicking the banner will navigate to this URL
                </p>
              </div>

              {/* Title */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Title (Optional)
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., New Collection"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-2 text-sm text-gray-500">
                  For accessibility and SEO
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={uploading || !formData.imageFile}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading...' : 'Add Banner'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Banners List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {banners.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">🖼️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No banners yet
              </h3>
              <p className="text-gray-600 mb-6">
                Add your first banner to get started
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Banner
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {banners.map((banner) => (
                <div
                  key={banner._id}
                  className="p-6 flex flex-col md:flex-row gap-6 items-start"
                >
                  {/* Banner Image */}
                  <div className="relative w-full md:w-64 h-40 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={banner.image}
                      alt={banner.title || 'Banner'}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Banner Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {banner.title || 'Untitled Banner'}
                        </h3>
                        {banner.link && (
                          <p className="text-sm text-gray-600 mt-1 truncate">
                            Link: {banner.link}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              banner.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {banner.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <span className="text-xs text-gray-500">
                            Order: {banner.displayOrder}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleToggleActive(banner._id, banner.isActive)}
                      className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      {banner.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDelete(banner._id)}
                      className="px-4 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Box */}
        {banners.length > 0 && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">
              💡 Tips
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Recommended image size: 1920x600 pixels for best quality</li>
              <li>• Active banners will be shown in the homepage slideshow</li>
              <li>• Banners auto-rotate every 10 seconds</li>
              <li>• Add a link to make the banner clickable</li>
              <li>• If no banners are active, default banners will be shown</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
