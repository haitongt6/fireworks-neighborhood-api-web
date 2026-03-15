/**
 * C 端 API 调用封装。
 * 默认请求 fireworks-api 服务（http://localhost:8080），可通过 .env 的 VITE_API_BASE 覆盖。
 */
export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

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

async function request<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  const json: ApiResult<T> = await res.json();
  if (json.code !== 200) {
    throw new Error(json.message || '请求失败');
  }
  return json.data;
}

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
