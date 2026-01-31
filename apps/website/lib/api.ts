// API base URL - adjust this based on your environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const api = {
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
  },
  metalRates: {
    getAll: (active?: boolean) => {
      const url = active !== undefined 
        ? `${API_BASE_URL}/api/metal-rates?active=${active}`
        : `${API_BASE_URL}/api/metal-rates`;
      return fetch(url).then(res => res.json());
    },
    getByType: (metalType: string) => fetch(`${API_BASE_URL}/api/metal-rates/type/${metalType}`).then(res => res.json()),
  },
  categories: {
    getAll: () => fetch(`${API_BASE_URL}/api/categories`).then(res => res.json()),
    getById: (id: string) => fetch(`${API_BASE_URL}/api/categories/${id}`).then(res => res.json()),
  },
  subcategories: {
    getAll: (categoryId?: string) => {
      const url = categoryId 
        ? `${API_BASE_URL}/api/subcategories?categoryId=${categoryId}`
        : `${API_BASE_URL}/api/subcategories`;
      return fetch(url).then(res => res.json());
    },
    getById: (id: string) => fetch(`${API_BASE_URL}/api/subcategories/${id}`).then(res => res.json()),
  },
  banners: {
    getAll: (active?: boolean) => {
      const url = active !== undefined 
        ? `${API_BASE_URL}/api/banners?active=${active}`
        : `${API_BASE_URL}/api/banners`;
      return fetch(url).then(res => res.json());
    },
  },
  siteSettings: {
    get: () => fetch(`${API_BASE_URL}/api/site-settings`).then(res => res.json()),
  },
};
