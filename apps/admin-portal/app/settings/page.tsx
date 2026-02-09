'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

interface SiteSettings {
  _id: string;
  preHeaderText: string;
  preHeaderLink: string;
  whatsappEnquiryNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    preHeaderText: '',
    preHeaderLink: '',
    whatsappEnquiryNumber: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await api.siteSettings.get();
      
      if (!result || result.error) {
        throw new Error(result?.error || 'Failed to fetch settings');
      }
      
      const data = result;
      setSettings(data);
      setFormData({
        preHeaderText: data.preHeaderText || '',
        preHeaderLink: data.preHeaderLink || '',
        whatsappEnquiryNumber: data.whatsappEnquiryNumber || '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch settings');
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      const result = await api.siteSettings.update(formData);

      if (!result || result.error) {
        throw new Error(result?.error || 'Failed to update settings');
      }

      const data = result;
      setSettings(data);
      setSuccessMessage('Settings updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings');
      console.error('Error updating settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Site Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage your website settings including pre-header banner
          </p>
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

        {/* Settings Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Pre-Header Banner
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Pre-Header Text */}
            <div>
              <label
                htmlFor="preHeaderText"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Pre-Header Text
              </label>
              <input
                type="text"
                id="preHeaderText"
                name="preHeaderText"
                value={formData.preHeaderText}
                onChange={handleInputChange}
                placeholder="e.g., ✨ Free shipping on orders over $150"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-2 text-sm text-gray-500">
                This text will appear in the pre-header banner at the top of the website. 
                If left empty, the default text will be shown.
              </p>
            </div>

            {/* WhatsApp Enquiry Number */}
            <div>
              <label
                htmlFor="whatsappEnquiryNumber"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                WhatsApp Number for Enquiries
              </label>
              <input
                type="text"
                id="whatsappEnquiryNumber"
                name="whatsappEnquiryNumber"
                value={formData.whatsappEnquiryNumber}
                onChange={handleInputChange}
                placeholder="e.g., 919876543210 (country code + number, no + or spaces)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-2 text-sm text-gray-500">
                Business users can send cart enquiries to this number via WhatsApp. Include country code.
              </p>
            </div>

            {/* Pre-Header Link */}
            <div>
              <label
                htmlFor="preHeaderLink"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Pre-Header Link (Optional)
              </label>
              <input
                type="url"
                id="preHeaderLink"
                name="preHeaderLink"
                value={formData.preHeaderLink}
                onChange={handleInputChange}
                placeholder="e.g., https://example.com/shipping-info"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-2 text-sm text-gray-500">
                If provided, the pre-header text will be clickable and link to this URL. 
                Leave empty if you don&apos;t want the text to be clickable.
              </p>
            </div>

            {/* Preview */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preview
              </label>
              <div className="bg-[#171717] text-white text-sm py-2.5 rounded-lg">
                <div className="px-4 text-center">
                  {formData.preHeaderLink ? (
                    <a
                      href={formData.preHeaderLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs md:text-sm font-light hover:underline"
                    >
                      {formData.preHeaderText || '✨ Free shipping on orders over $150'}
                    </a>
                  ) : (
                    <p className="text-xs md:text-sm font-light">
                      {formData.preHeaderText || '✨ Free shipping on orders over $150'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        </div>

        {/* Additional Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">
            💡 Tips
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Use emojis to make your pre-header more eye-catching</li>
            <li>• Keep the text short and concise for better mobile display</li>
            <li>• The link is optional - only add it if you want the text to be clickable</li>
            <li>• Changes will be reflected immediately on the website</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
