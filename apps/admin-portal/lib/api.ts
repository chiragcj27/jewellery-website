// API base URL - adjust this based on your environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Filter interface
export interface Filter {
  name: string;
  slug: string;
  type: 'select' | 'multiselect';
  options: string[];
}

// Type definitions for API requests
export interface CategoryData {
  name: string;
  description?: string;
  image?: string;
  isActive?: boolean;
  displayOrder?: number;
  filters?: Filter[];
}

export interface SubcategoryData {
  name: string;
  category: string;
  description?: string;
  image?: string;
  isActive?: boolean;
  displayOrder?: number;
}

export interface ProductData {
  name: string;
  category: string;
  subcategory: string;
  description?: string;
  shortDescription?: string;
  images?: string[];
  imageAssetIds?: string[];
  price?: number;
  compareAtPrice?: number;
  sku?: string;
  stock?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  displayOrder?: number;
  filterValues?: Record<string, string | string[]>;
  metadata?: Record<string, unknown>;
  weightInGrams?: number;
  metalType?: string;
  wastagePercentage?: number;
  useDynamicPricing?: boolean;
}

export interface MetalRateData {
  metalType: string;
  ratePerTenGrams: number;
  makingChargePerGram: number;
  gstPercentage: number;
  isActive?: boolean;
}

export interface SiteSettingsData {
  preHeaderText?: string;
  preHeaderLink?: string;
  whatsappEnquiryNumber?: string;
}

export interface BannerData {
  image: string;
  link?: string;
  title?: string;
  isActive?: boolean;
  displayOrder?: number;
}

export const api = {
  assets: {
    upload: (file: File) => {
      const form = new FormData();
      form.append('file', file);
      return fetch(`${API_BASE_URL}/api/assets/upload`, {
        method: 'POST',
        body: form,
      }).then((res) => res.json());
    },
    getAll: (limit = 50, skip = 0) => {
      return fetch(`${API_BASE_URL}/api/assets?limit=${limit}&skip=${skip}`)
        .then((res) => res.json());
    },
    delete: (id: string) => {
      return fetch(`${API_BASE_URL}/api/assets/${id}`, {
        method: 'DELETE',
      }).then((res) => res.json());
    },
  },
  categories: {
    getAll: () => fetch(`${API_BASE_URL}/api/categories`).then(res => res.json()),
    getById: (id: string) => fetch(`${API_BASE_URL}/api/categories/${id}`).then(res => res.json()),
    create: (data: CategoryData & { imageAssetId?: string }) => fetch(`${API_BASE_URL}/api/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(res => res.json()),
    update: (id: string, data: CategoryData & { imageAssetId?: string }) => fetch(`${API_BASE_URL}/api/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(res => res.json()),
    delete: (id: string) => fetch(`${API_BASE_URL}/api/categories/${id}`, {
      method: 'DELETE',
    }).then(res => res.json()),
  },
  subcategories: {
    getAll: (categoryId?: string) => {
      const url = categoryId 
        ? `${API_BASE_URL}/api/subcategories?categoryId=${categoryId}`
        : `${API_BASE_URL}/api/subcategories`;
      return fetch(url).then(res => res.json());
    },
    getById: (id: string) => fetch(`${API_BASE_URL}/api/subcategories/${id}`).then(res => res.json()),
    create: (data: SubcategoryData & { imageAssetId?: string }) => fetch(`${API_BASE_URL}/api/subcategories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(res => res.json()),
    update: (id: string, data: SubcategoryData & { imageAssetId?: string }) => fetch(`${API_BASE_URL}/api/subcategories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(res => res.json()),
    delete: (id: string) => fetch(`${API_BASE_URL}/api/subcategories/${id}`, {
      method: 'DELETE',
    }).then(res => res.json()),
  },
  products: {
    getAll: (opts?: { categoryId?: string; subcategoryId?: string; page?: number; limit?: number }) => {
      const params = new URLSearchParams();
      if (opts?.categoryId) params.append('categoryId', opts.categoryId);
      if (opts?.subcategoryId) params.append('subcategoryId', opts.subcategoryId);
      if (opts?.page) params.append('page', String(opts.page));
      if (opts?.limit) params.append('limit', String(opts.limit));
      const query = params.toString();
      const url = query ? `${API_BASE_URL}/api/products?${query}` : `${API_BASE_URL}/api/products`;
      return fetch(url).then(res => res.json());
    },
    getById: (id: string) => fetch(`${API_BASE_URL}/api/products/${id}`).then(res => res.json()),
    create: (data: ProductData) => fetch(`${API_BASE_URL}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(res => res.json()),
    update: (id: string, data: ProductData) => fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(res => res.json()),
    delete: (id: string) => fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: 'DELETE',
    }).then(res => res.json()),
  },
  bulkUpload: {
    uploadProducts: (file: File) => {
      const form = new FormData();
      form.append('file', file);
      return fetch(`${API_BASE_URL}/api/bulk-upload/products`, {
        method: 'POST',
        body: form,
      }).then((res) => res.json());
    },
    downloadTemplate: () => {
      return fetch(`${API_BASE_URL}/api/bulk-upload/template`)
        .then((res) => {
          if (!res.ok) throw new Error('Failed to download template');
          return res.blob();
        })
        .then((blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'product_upload_template.xlsx';
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        });
    },
  },
  wholesalers: {
    getAll: (status?: 'pending' | 'approved' | 'rejected') => {
      const url = status
        ? `${API_BASE_URL}/api/wholesalers?status=${status}`
        : `${API_BASE_URL}/api/wholesalers`;
      return fetch(url).then(res => res.json());
    },
    approve: (id: string) =>
      fetch(`${API_BASE_URL}/api/wholesalers/${id}/approve`, {
        method: 'PATCH',
      }).then(res => res.json()),
    reject: (id: string, reason?: string) =>
      fetch(`${API_BASE_URL}/api/wholesalers/${id}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason || '' }),
      }).then(res => res.json()),
  },
  customers: {
    getAll: () =>
      fetch(`${API_BASE_URL}/api/customers`).then(res => res.json()),
  },
  orders: {
    getAll: (status?: string) => {
      const url = status
        ? `${API_BASE_URL}/api/orders?status=${status}`
        : `${API_BASE_URL}/api/orders`;
      return fetch(url).then((res) => res.json());
    },
    getById: (id: string) =>
      fetch(`${API_BASE_URL}/api/orders/${id}`).then((res) => res.json()),
    updateStatus: (id: string, status: string) =>
      fetch(`${API_BASE_URL}/api/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      }).then((res) => res.json()),
  },
  metalRates: {
    getAll: (active?: boolean) => {
      const url = active !== undefined 
        ? `${API_BASE_URL}/api/metal-rates?active=${active}`
        : `${API_BASE_URL}/api/metal-rates`;
      return fetch(url).then(res => res.json());
    },
    getById: (id: string) => fetch(`${API_BASE_URL}/api/metal-rates/${id}`).then(res => res.json()),
    getByType: (metalType: string) => fetch(`${API_BASE_URL}/api/metal-rates/type/${metalType}`).then(res => res.json()),
    create: (data: MetalRateData) => fetch(`${API_BASE_URL}/api/metal-rates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(res => res.json()),
    update: (id: string, data: Partial<MetalRateData>) => fetch(`${API_BASE_URL}/api/metal-rates/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(res => res.json()),
    delete: (id: string) => fetch(`${API_BASE_URL}/api/metal-rates/${id}`, {
      method: 'DELETE',
    }).then(res => res.json()),
  },
  siteSettings: {
    get: () => fetch(`${API_BASE_URL}/api/site-settings`).then(res => res.json()),
    update: (data: SiteSettingsData) => fetch(`${API_BASE_URL}/api/site-settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(res => res.json()),
  },
  banners: {
    getAll: (active?: boolean) => {
      const url = active !== undefined 
        ? `${API_BASE_URL}/api/banners?active=${active}`
        : `${API_BASE_URL}/api/banners`;
      return fetch(url).then(res => res.json());
    },
    getById: (id: string) => fetch(`${API_BASE_URL}/api/banners/${id}`).then(res => res.json()),
    create: (data: BannerData) => fetch(`${API_BASE_URL}/api/banners`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(res => res.json()),
    update: (id: string, data: Partial<BannerData>) => fetch(`${API_BASE_URL}/api/banners/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(res => res.json()),
    delete: (id: string) => fetch(`${API_BASE_URL}/api/banners/${id}`, {
      method: 'DELETE',
    }).then(res => res.json()),
  },
};
