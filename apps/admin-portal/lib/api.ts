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
  price: number;
  compareAtPrice?: number;
  sku?: string;
  stock?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  displayOrder?: number;
  filterValues?: Record<string, string | string[]>;
  metadata?: Record<string, unknown>;
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
    getAll: (categoryId?: string, subcategoryId?: string) => {
      const params = new URLSearchParams();
      if (categoryId) params.append('categoryId', categoryId);
      if (subcategoryId) params.append('subcategoryId', subcategoryId);
      const query = params.toString();
      const url = query 
        ? `${API_BASE_URL}/api/products?${query}`
        : `${API_BASE_URL}/api/products`;
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
};
