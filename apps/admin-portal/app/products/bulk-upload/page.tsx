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

        {/* Important Things to Keep in Mind */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">⚠️ Important Things to Keep in Mind</h3>
              <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                <li><strong>Test first:</strong> Upload 1-2 test products before bulk uploading hundreds</li>
                <li><strong>Backup data:</strong> Keep a copy of your Excel file before uploading</li>
                <li><strong>Spelling matters:</strong> Category and subcategory names must match exactly (NOT case-sensitive: "Rings" = "rings")</li>
                <li><strong>Metal rates first:</strong> Configure metal rates in <Link href="/metal-rates" className="underline font-semibold">Metal Rates</Link> page before using dynamic pricing</li>
                <li><strong>Choose one pricing:</strong> Use either price OR (weightInGrams + metalType + useDynamicPricing=true), not both</li>
                <li><strong>Weight validation:</strong> Weight must be greater than 0 for dynamic pricing</li>
                <li><strong>Metal type IS case-sensitive:</strong> Must match exactly (e.g., "22KT" not "22kt" or "22 KT")</li>
                <li><strong>Image formats:</strong> Only JPG, PNG, GIF, WEBP are supported</li>
                <li><strong>File size:</strong> Keep Excel file under 10MB, ZIP under 50MB</li>
                <li><strong>All-or-nothing:</strong> If validation fails on any row, NO products will be created</li>
                <li><strong>Unique names:</strong> Product names should be unique within same category/subcategory</li>
                <li><strong>Boolean values:</strong> Use true/false, yes/no, or 1/0 for isActive and isFeatured</li>
                <li><strong>Decimal format:</strong> Use dot (.) for decimals, not comma (5.5 not 5,5)</li>
                <li><strong>ZIP structure:</strong> If using ZIP, include Excel file and images in root (not in subfolders)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Instructions Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Step-by-Step Instructions</h2>
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
                  Required fields: name, category, subcategory. Make sure category and subcategory names match exactly.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="font-semibold mr-2">3.</span>
              <div>
                <p className="font-medium">Choose pricing method</p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Option A - Fixed Pricing:</strong> Set <span className="font-mono bg-gray-100 px-1">price</span> field (e.g., 45000) and leave <span className="font-mono bg-gray-100 px-1">useDynamicPricing</span> as false.
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Option B - Dynamic Pricing:</strong> Set <span className="font-mono bg-gray-100 px-1">weightInGrams</span> (e.g., 5.5), 
                  <span className="font-mono bg-gray-100 px-1 ml-1">metalType</span> (e.g., "22KT"), and 
                  <span className="font-mono bg-gray-100 px-1 ml-1">useDynamicPricing</span> to true. Price will be calculated automatically!
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="font-semibold mr-2">4.</span>
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
              <span className="font-semibold mr-2">5.</span>
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
            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-blue-900 mb-1">Required Columns:</p>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li><span className="font-mono bg-white px-1">name</span> - Product name</li>
                  <li><span className="font-mono bg-white px-1">category</span> - Category name or slug</li>
                  <li><span className="font-mono bg-white px-1">subcategory</span> - Subcategory name or slug</li>
                </ul>
              </div>
              
              <div>
                <p className="text-sm font-semibold text-blue-900 mb-1">Pricing Options (choose one):</p>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li><span className="font-mono bg-white px-1">price</span> - Fixed price (required if not using dynamic pricing)</li>
                  <li><strong>OR</strong> for dynamic pricing:</li>
                  <li className="ml-4"><span className="font-mono bg-white px-1">weightInGrams</span> - Weight in grams (e.g., 5.5)</li>
                  <li className="ml-4"><span className="font-mono bg-white px-1">metalType</span> - Metal type (e.g., "22KT", "18KT")</li>
                  <li className="ml-4"><span className="font-mono bg-white px-1">useDynamicPricing</span> - Set to true</li>
                </ul>
              </div>

              <div>
                <p className="text-sm font-semibold text-blue-900 mb-1">Optional Columns:</p>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li><span className="font-mono bg-white px-1">description</span> - Detailed description</li>
                  <li><span className="font-mono bg-white px-1">shortDescription</span> - Brief description</li>
                  <li><span className="font-mono bg-white px-1">compareAtPrice</span> - Original price for discounts</li>
                  <li><span className="font-mono bg-white px-1">sku</span> - Stock keeping unit</li>
                  <li><span className="font-mono bg-white px-1">stock</span> - Stock quantity (default: 0)</li>
                  <li><span className="font-mono bg-white px-1">isActive</span> - true/false (default: true)</li>
                  <li><span className="font-mono bg-white px-1">isFeatured</span> - true/false (default: false)</li>
                  <li><span className="font-mono bg-white px-1">displayOrder</span> - Sort order (default: 0)</li>
                  <li><span className="font-mono bg-white px-1">images</span> - Comma-separated URLs</li>
                  <li><span className="font-mono bg-white px-1">filterValues</span> - JSON object for filters</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <h3 className="font-medium text-green-900 mb-2">💰 Dynamic Pricing Example:</h3>
            <p className="text-sm text-green-800 mb-2">
              For a 5.5g gold ring with 22KT metal (configured at ₹75,000/10g, ₹500/g making, 3% GST):
            </p>
            <div className="text-sm text-green-800 font-mono bg-white p-2 rounded">
              weightInGrams=5.5, metalType=22KT, useDynamicPricing=true
            </div>
            <p className="text-xs text-green-700 mt-2">
              Price will be calculated: (75000÷10)×5.5 + 500×5.5 + 3% GST = ₹45,320
            </p>
            <p className="text-xs text-green-700 mt-1">
              <strong>Important:</strong> Make sure metal rates are configured in <Link href="/metal-rates" className="underline">Metal Rates</Link> page first!
            </p>
          </div>

          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <h3 className="font-medium text-red-900 mb-2">❌ Common Mistakes to Avoid:</h3>
            <ul className="text-sm text-red-800 space-y-1">
              <li>• <strong>Typo in category/subcategory:</strong> "Rigns" instead of "Rings" (spelling must match, but case doesn't matter)</li>
              <li>• <strong>Metal type case mismatch:</strong> "22kt" or "22 KT" instead of "22KT" (metal type IS case-sensitive!)</li>
              <li>• <strong>Missing price:</strong> Forgot to set price when useDynamicPricing is false</li>
              <li>• <strong>Both pricing types:</strong> Setting both price AND dynamic pricing fields</li>
              <li>• <strong>Weight is zero:</strong> Setting weightInGrams to 0 for dynamic pricing</li>
              <li>• <strong>Category mismatch:</strong> Subcategory doesn't belong to the specified category</li>
              <li>• <strong>Metal rate not configured:</strong> Using metalType that doesn't exist in Metal Rates</li>
              <li>• <strong>Wrong decimal separator:</strong> Using comma (5,5) instead of dot (5.5)</li>
              <li>• <strong>Images in subfolder:</strong> ZIP file has images in /images/ folder instead of root</li>
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
