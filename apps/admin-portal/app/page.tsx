import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Admin Portal
          </h1>
          <p className="text-lg text-gray-600">
            Manage your jewellery categories, subcategories, and products
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/categories"
            className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="text-3xl mb-4">📁</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Categories
            </h2>
            <p className="text-gray-600">
              Manage product categories
            </p>
          </Link>

          <Link
            href="/subcategories"
            className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="text-3xl mb-4">📂</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Subcategories
            </h2>
            <p className="text-gray-600">
              Manage subcategories within categories
            </p>
          </Link>

          <Link
            href="/products"
            className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="text-3xl mb-4">💎</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Products
            </h2>
            <p className="text-gray-600">
              Manage your jewellery products
            </p>
          </Link>

          <Link
            href="/assets"
            className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="text-3xl mb-4">🖼️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Assets
            </h2>
            <p className="text-gray-600">
              Upload and manage images for products
            </p>
          </Link>

          <Link
            href="/banners"
            className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="text-3xl mb-4">🎨</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Banners
            </h2>
            <p className="text-gray-600">
              Manage homepage banner slideshow
            </p>
          </Link>

          <Link
            href="/settings"
            className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="text-3xl mb-4">⚙️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Settings
            </h2>
            <p className="text-gray-600">
              Manage site settings and pre-header
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
