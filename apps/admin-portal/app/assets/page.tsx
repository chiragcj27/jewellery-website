'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

interface Asset {
  _id: string;
  url: string;
  fileName?: string;
  originalFilename?: string;
  mimeType: string;
  size: number;
  s3Key?: string;
  key?: string;
  refType?: string;
  refId?: string;
  createdAt: string;
}

export default function AssetsPage() {
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const result = await api.assets.getAll(100, 0);
      if (result.success && result.data) {
        setAssets(result.data);
      }
    } catch (err) {
      console.error('Failed to fetch assets:', err);
      setError('Failed to load assets');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFiles(files);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      setError('Please select at least one file');
      return;
    }

    setUploading(true);
    setError(null);
    const newAssets: Asset[] = [];

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          setError(`${file.name} is not an image file`);
          continue;
        }

        const result = await api.assets.upload(file);
        
        if (result.success && result.data) {
          newAssets.push({
            _id: result.data.assetId,
            url: result.data.url,
            fileName: file.name,
            originalFilename: file.name,
            mimeType: file.type,
            size: file.size,
            key: result.data.key,
            createdAt: new Date().toISOString(),
          });
        } else {
          setError(`Failed to upload ${file.name}: ${result.error || 'Unknown error'}`);
        }
      }

      setAssets([...newAssets, ...assets]);
      setSelectedFiles(null);
      
      // Clear file input
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (err) {
      setError(`Upload failed: ${err}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (assetId: string) => {
    try {
      const result = await api.assets.delete(assetId);
      
      if (result.success) {
        setAssets(assets.filter(a => a._id !== assetId));
        setDeleteConfirm(null);
      } else {
        alert(result.error || 'Failed to delete asset');
      }
    } catch (err) {
      alert(`Failed to delete: ${err}`);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('URL copied to clipboard!');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getFileName = (asset: Asset): string => {
    return asset.fileName || asset.originalFilename || 'Unknown';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-2 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Assets Manager</h1>
          <p className="text-gray-600 mt-2">
            Upload and manage images for products, categories, and other content
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Upload Images</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Image Files
              </label>
              <input
                id="file-input"
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                multiple
                onChange={handleFileSelect}
                disabled={uploading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 file:font-medium hover:file:bg-blue-100 disabled:opacity-50"
              />
              <p className="mt-2 text-sm text-gray-500">
                Supported formats: JPEG, PNG, GIF, WebP. You can select multiple files.
              </p>
              {selectedFiles && selectedFiles.length > 0 && (
                <p className="mt-2 text-sm text-gray-700">
                  Selected: <span className="font-medium">{selectedFiles.length} file(s)</span>
                </p>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!selectedFiles || selectedFiles.length === 0 || uploading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {uploading ? 'Uploading...' : 'Upload Images'}
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-blue-900 mb-2">Using Images in Bulk Upload</h3>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Upload your images here</li>
            <li>Click the "Copy URL" button for each image</li>
            <li>Paste the URLs in your Excel file's "images" column</li>
            <li>Separate multiple URLs with commas</li>
          </ol>
        </div>

        {/* Assets Grid */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-gray-500">Loading assets...</div>
          </div>
        ) : assets.length > 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">All Images ({assets.length})</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assets.map((asset) => (
                <div key={asset._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="aspect-square bg-gray-100 rounded-md mb-3 overflow-hidden relative group">
                    <img
                      src={asset.url}
                      alt={getFileName(asset)}
                      className="w-full h-full object-cover"
                    />
                    {/* Delete button overlay */}
                    {deleteConfirm === asset._id ? (
                      <div className="absolute inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center gap-2">
                        <p className="text-white text-sm font-medium">Delete this image?</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDelete(asset._id)}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                          >
                            Yes, Delete
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(asset._id)}
                        className="absolute top-2 right-2 w-8 h-8 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 flex items-center justify-center"
                        title="Delete image"
                      >
                        ×
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-900 truncate" title={getFileName(asset)}>
                      {getFileName(asset)}
                    </p>
                    
                    <p className="text-xs text-gray-500">
                      {formatFileSize(asset.size)} • {asset.mimeType.split('/')[1].toUpperCase()}
                    </p>
                    
                    {asset.refType && (
                      <p className="text-xs text-orange-600 font-medium">
                        In use by {asset.refType}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={asset.url}
                        readOnly
                        className="flex-1 text-xs px-2 py-1 bg-gray-50 border border-gray-300 rounded"
                      />
                      <button
                        onClick={() => copyToClipboard(asset.url)}
                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No images uploaded yet</h3>
            <p className="text-gray-600">
              Upload some images to get started. They'll appear here and you can copy their URLs.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
