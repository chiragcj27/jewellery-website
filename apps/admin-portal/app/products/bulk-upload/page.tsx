'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

interface ValidationError {
  row: number;
  field: string;
  message: string;
  value?: unknown;
}

interface BulkUploadResult {
  success: boolean;
  message?: string;
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: ValidationError[];
  createdProducts?: string[];
}

export default function BulkUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<BulkUploadResult | null>(null);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file first');
      return;
    }

    setUploading(true);
    setResult(null);

    try {
      const response = await api.bulkUpload.uploadProducts(file);
      setResult(response);
      
      if (response.success) {
        // Clear file after successful upload
        setFile(null);
        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setResult({
        success: false,
        message: 'Failed to upload file. Please try again.',
        totalRows: 0,
        successCount: 0,
        errorCount: 1,
        errors: [{ row: 0, field: 'general', message: String(error) }],
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    setDownloadingTemplate(true);
    try {
      await api.bulkUpload.downloadTemplate();
    } catch (error) {
      console.error('Error downloading template:', error);
      alert('Failed to download template');
    } finally {
      setDownloadingTemplate(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/products" className="text-blue-600 hover:text-blue-800 mb-2 inline-block">
            ← Back to Products
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Bulk Upload Products</h1>
          <p className="text-gray-600 mt-2">
            Upload multiple products at once using an Excel file
          </p>
        </div>

        {/* Instructions Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>
          <div className="space-y-3 text-gray-700">
            <div className="flex items-start">
              <span className="font-semibold mr-2">1.</span>
              <div>
                <p className="font-medium">Download the Excel template</p>
                <p className="text-sm text-gray-600">
                  The template includes example data and a reference sheet with available categories and subcategories.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="font-semibold mr-2">2.</span>
              <div>
                <p className="font-medium">Fill in your product data</p>
                <p className="text-sm text-gray-600">
                  Required fields: name, category, subcategory, and price. Make sure category and subcategory names match exactly.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="font-semibold mr-2">3.</span>
              <div>
                <p className="font-medium">Handle images (3 options)</p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Option 1:</strong> In the <span className="font-mono bg-gray-100 px-1">images</span> column, provide comma-separated image URLs 
                  (upload images to S3 via Assets page first).
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Option 2:</strong> Put image filenames in the <span className="font-mono bg-gray-100 px-1">images</span> column 
                  (e.g., <span className="font-mono">image1.jpg,image2.jpg</span>) and create a ZIP file containing the Excel file + all image files, 
                  then upload the ZIP.
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Option 3:</strong> Leave images blank and add them later by editing each product.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="font-semibold mr-2">4.</span>
              <div>
                <p className="font-medium">Upload the completed file</p>
                <p className="text-sm text-gray-600">
                  The system will validate all rows before creating any products. Fix any errors and try again.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h3 className="font-medium text-blue-900 mb-2">Column Guide:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li><span className="font-mono bg-white px-1">name</span> - Product name (required)</li>
              <li><span className="font-mono bg-white px-1">category</span> - Category name or slug (required)</li>
              <li><span className="font-mono bg-white px-1">subcategory</span> - Subcategory name or slug (required)</li>
              <li><span className="font-mono bg-white px-1">price</span> - Product price (required, number)</li>
              <li><span className="font-mono bg-white px-1">description</span> - Detailed description (optional)</li>
              <li><span className="font-mono bg-white px-1">shortDescription</span> - Brief description (optional)</li>
              <li><span className="font-mono bg-white px-1">compareAtPrice</span> - Original price for discounts (optional)</li>
              <li><span className="font-mono bg-white px-1">sku</span> - Stock keeping unit (optional)</li>
              <li><span className="font-mono bg-white px-1">stock</span> - Stock quantity (optional, default: 0)</li>
              <li><span className="font-mono bg-white px-1">isActive</span> - true/false (optional, default: true)</li>
              <li><span className="font-mono bg-white px-1">isFeatured</span> - true/false (optional, default: false)</li>
              <li><span className="font-mono bg-white px-1">displayOrder</span> - Sort order (optional, default: 0)</li>
              <li><span className="font-mono bg-white px-1">images</span> - Comma-separated URLs (optional)</li>
              <li><span className="font-mono bg-white px-1">filterValues</span> - JSON object for filters (optional)</li>
            </ul>
          </div>
        </div>

        {/* Download Template Button */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Step 1: Download Template</h2>
          <button
            onClick={handleDownloadTemplate}
            disabled={downloadingTemplate}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
          >
            {downloadingTemplate ? 'Downloading...' : 'Download Excel Template'}
          </button>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Step 2: Upload Completed File</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Excel File
              </label>
              <input
                id="file-input"
                type="file"
                accept=".xlsx,.xls,.csv,.zip"
                onChange={handleFileChange}
                disabled={uploading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 file:font-medium hover:file:bg-blue-100 disabled:opacity-50"
              />
              {file && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: <span className="font-medium">{file.name}</span> ({(file.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>

            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {uploading ? 'Uploading...' : 'Upload and Create Products'}
            </button>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className={`p-4 rounded-md mb-4 ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <h3 className={`font-semibold text-lg ${result.success ? 'text-green-900' : 'text-red-900'}`}>
                {result.success ? 'Success!' : 'Upload Failed'}
              </h3>
              <p className={result.success ? 'text-green-700' : 'text-red-700'}>
                {result.message}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-600">Total Rows</p>
                <p className="text-2xl font-bold text-gray-900">{result.totalRows}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-md">
                <p className="text-sm text-green-600">Successful</p>
                <p className="text-2xl font-bold text-green-700">{result.successCount}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-md">
                <p className="text-sm text-red-600">Errors</p>
                <p className="text-2xl font-bold text-red-700">{result.errorCount}</p>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-3">Errors Details</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Row
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Field
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Error Message
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Value
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {result.errors.map((error, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {error.row}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {error.field}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {error.message}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {error.value !== undefined ? String(error.value) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {result.success && (
              <div className="mt-4">
                <Link
                  href="/products"
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  View Products
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
