// API base URL - adjust this based on your environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const AUTH_STORAGE_KEY = 'zivara-auth';

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as { token?: string };
    return data?.token ?? null;
  } catch {
    return null;
  }
}

export function getAuthToken(): string | null {
  return getStoredToken();
}

export interface AuthUser {
  _id: string;
  email: string;
  name: string;
  role: 'customer' | 'wholesaler';
  businessName?: string;
  gstNo?: string;
  firmName?: string;
  city?: string;
  visitingCardImage?: string;
  mobNumber?: string;
  gstCertificateFiles?: string[];
  approvalStatus?: 'pending' | 'approved' | 'rejected';
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as { user?: AuthUser };
    return data?.user ?? null;
  } catch {
    return null;
  }
}

export function setAuthStorage(token: string, user: AuthUser): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token, user }));
}

export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  const data = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
  data.token = token;
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
}

export function clearAuthToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export const api = {
  auth: {
    registerCustomer: (body: { email: string; password: string; name: string }) =>
      fetch(`${API_BASE_URL}/api/auth/register/customer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }).then((res) => res.json()),

    registerWholesaler: (body: {
      email: string;
      password: string;
      name: string;
      firmName: string;
      city: string;
      visitingCardImage: string;
      mobNumber: string;
      gstCertificateFiles: string[];
      businessName?: string;
      gstNo?: string;
    }) =>
      fetch(`${API_BASE_URL}/api/auth/register/wholesaler`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }).then((res) => res.json()),

    login: (body: { email: string; password: string }) =>
      fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }).then((res) => res.json()),

    me: (token: string) =>
      fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => res.json()),
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
  orders: {
    create: (body: { items: Array<{
      id: string; title: string; image: string; price: number; mrp: number;
      quantity: number; sku: string; weightInGrams?: number; metalType?: string; wastagePercentage?: number;
    }>; wastageIncluded: boolean }, token: string) =>
      fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      }).then((res) => res.json()),
  },
  assets: {
    upload: (file: File) => {
      const form = new FormData();
      form.append('file', file);
      return fetch(`${API_BASE_URL}/api/assets/upload`, {
        method: 'POST',
        body: form,
      }).then((res) => res.json());
    },
  },
};
