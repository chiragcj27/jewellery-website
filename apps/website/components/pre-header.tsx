'use client';

import { useEffect, useState } from 'react';

interface SiteSettings {
  preHeaderText: string;
  preHeaderLink?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function PreHeader() {
  const [settings, setSettings] = useState<SiteSettings>({
    preHeaderText: '✨ Free shipping on orders over $150',
    preHeaderLink: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/site-settings`);
        if (response.ok) {
          const data = await response.json();
          setSettings({
            preHeaderText: data.preHeaderText || '✨ Free shipping on orders over $150',
            preHeaderLink: data.preHeaderLink || '',
          });
        }
      } catch (error) {
        console.error('Error fetching site settings:', error);
        // Keep default values if fetch fails
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Show default text while loading
  const displayText = loading ? '✨ Free shipping on orders over $150' : settings.preHeaderText;
  const hasLink = !loading && settings.preHeaderLink && settings.preHeaderLink.trim() !== '';

  return (
    <div className="bg-[#171717] text-white text-sm py-2.5">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center">
          {hasLink ? (
            <a
              href={settings.preHeaderLink}
              className="text-xs md:text-sm font-light hover:underline transition-all"
              target="_blank"
              rel="noopener noreferrer"
            >
              {displayText}
            </a>
          ) : (
            <p className="text-xs md:text-sm font-light">
              {displayText}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}