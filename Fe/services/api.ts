export type ApiProductImage = {
  url: string;
  isPrimary: number;
  order: number;
};

export type ApiProduct = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  oldPrice: number | null;
  isNew: number;
  isFeatured: number;
  category: string;
  brand: string | null;
  images: ApiProductImage[];
};

export type ApiVariant = {
  id: number;
  productId: number;
  colorId: number;
  color: string;
  hex: string | null;
  sizeId: number;
  size: string;
  sku: string;
  price: number;
  stock: number;
};

export type ApiUser = {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
};

// Override this for Android Emulator or a physical device.
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (__DEV__ ? 'http://localhost:7000' : 'https://your-api-domain.example.com');

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(body?.message || `API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function getApiProducts() {
  return request<ApiProduct[]>('/api/products');
}

export function getApiProductVariants(productId: number) {
  return request<ApiVariant[]>(`/api/products/${productId}/variants`);
}

export function checkApiHealth() {
  return request<{ ok: boolean; database: string }>('/health');
}

export function registerApiUser(name: string, phone: string, password: string) {
  return request<{ success: boolean; data: ApiUser }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, phone, password }),
  });
}

export function loginApiUser(phone: string, password: string) {
  return request<{ success: boolean; data: ApiUser }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ phone, password }),
  });
}