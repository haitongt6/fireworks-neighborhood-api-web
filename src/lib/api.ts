/**
 * C 端 API 调用封装。
 * 开发环境通过 Vite 代理（VITE_API_BASE 为空），生产环境可通过 .env 覆盖。
 */
export const API_BASE = import.meta.env.VITE_API_BASE ?? '';

export interface ApiResult<T> {
  code: number;
  message: string;
  data: T;
}

export interface ApiCategory {
  id: number;
  name: string;
  sort: number;
  status: number;
}

export interface ApiProductListItem {
  id: number;
  title: string;
  subTitle?: string;
  categoryId: number;
  categoryName: string;
  images: string;
  price: number;
  stock: number;
  status: number;
}

export interface ApiProductDetail {
  id: number;
  title: string;
  subTitle?: string;
  categoryId: number;
  categoryName: string;
  images: string;
  mainVideo?: string;
  detailPics?: string;
  price: number;
  stock: number;
  status: number;
}

export interface ApiPageResult<T> {
  list: T[];
  total: number;
}

export interface MemberInfo {
  id: number;
  phone: string;
  nickname: string;
  avatar: string | null;
  status: number;
}

export interface MemberLoginResult {
  token: string;
  tokenHead: string;
  member: MemberInfo;
}

// --------------- 购物车类型 ---------------

export interface CartItemVO {
  id: number | null;
  productId: number;
  quantity: number;
  priceSnapshot: number;
  titleSnapshot: string;
  imageSnapshot: string | null;
  productStatus: number;
  productStock: number;
  limitPerUser: number | null;
  invalid: boolean;
}

export interface CartAddResultVO {
  totalQuantity: number;
  snapshotChanged: boolean;
  snapshotChangeMessage: string | null;
  oldPrice: number | null;
  currentPrice: number;
}

// --------------- 通用请求方法 ---------------

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    ...(options?.headers as Record<string, string>),
  };

  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const json: ApiResult<T> = await res.json();

  if (json.code === 401) {
    localStorage.removeItem('token');
    const currentPath = window.location.pathname;
    if (currentPath !== '/login') {
      window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
    }
    throw new Error('登录已过期，请重新登录');
  }

  if (json.code !== 200) {
    throw new Error(json.message || '请求失败');
  }
  return json.data;
}

async function post<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body != null ? JSON.stringify(body) : undefined,
  });
}

// --------------- 认证相关 ---------------

export function sendVerifyCode(phone: string): Promise<void> {
  return post<void>(`/api/sms/sendVerifyCode?phone=${encodeURIComponent(phone)}`);
}

export function loginByPhone(phone: string, verifyCode: string): Promise<MemberLoginResult> {
  return post<MemberLoginResult>('/api/member/loginByPhone', { phone, verifyCode });
}

export function getMemberInfo(): Promise<MemberInfo> {
  return request<MemberInfo>('/api/member/info');
}

export function logout(): Promise<void> {
  return post<void>('/api/member/logout');
}

// --------------- 商品 / 分类 ---------------

export async function fetchCategoryList(): Promise<ApiCategory[]> {
  const data = await request<ApiCategory[]>('/api/category/list');
  return Array.isArray(data) ? data : [];
}

export async function fetchProductList(params?: {
  pageNum?: number;
  pageSize?: number;
  categoryId?: number;
}): Promise<{ list: ApiProductListItem[]; total: number }> {
  const q = new URLSearchParams();
  if (params?.pageNum) q.set('pageNum', String(params.pageNum));
  if (params?.pageSize) q.set('pageSize', String(params.pageSize));
  if (params?.categoryId) q.set('categoryId', String(params.categoryId));
  const query = q.toString();
  const path = `/api/product/list${query ? `?${query}` : ''}`;
  const data = await request<ApiPageResult<ApiProductListItem>>(path);
  return {
    list: data?.list ?? [],
    total: data?.total ?? 0,
  };
}

export async function fetchProductDetail(id: string | number): Promise<ApiProductDetail | null> {
  try {
    return await request<ApiProductDetail>(`/api/product/${id}`);
  } catch {
    return null;
  }
}

// --------------- 购物车 ---------------

export function fetchCartList(): Promise<CartItemVO[]> {
  return request<CartItemVO[]>('/api/cart/list');
}

export function cartAdd(productId: number, quantity: number): Promise<void> {
  return post<void>('/api/cart/add', { productId: Number(productId), quantity: Number(quantity) });
}

export function cartUpdate(productId: number, quantity: number): Promise<void> {
  return post<void>('/api/cart/update', { productId: Number(productId), quantity: Number(quantity) });
}

export function cartRemove(productId: number): Promise<void> {
  return post<void>('/api/cart/remove', { productId: Number(productId) });
}

export function cartClear(): Promise<void> {
  return post<void>('/api/cart/clear');
}
