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

/** 接口返回 code !== 200（且非 401 已单独处理）时抛出，携带业务码供页面分支展示 */
export class ApiError extends Error {
  readonly code: number;

  constructor(code: number, message: string) {
    super(message);
    this.code = code;
    this.name = 'ApiError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** 与后端 {@code OrderConfirmApiCode} 一致 */
export const ORDER_CONFIRM_CART_EMPTY = 4001;
export const ORDER_CONFIRM_SELECTION_NOT_IN_CART = 4002;

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

/**
 * 使用 XMLHttpRequest 而非 fetch，以便 Chrome DevTools → Network 中对请求使用「Replay XHR」做接口调试。
 * （fetch 发起的请求在多数版本 Chrome 中不提供该重放入口。）
 */
function requestTextViaXhr(path: string, options?: RequestInit): Promise<string> {
  const mergedHeaders: Record<string, string> = {
    ...(options?.headers as Record<string, string>),
  };
  const token = localStorage.getItem('token');
  if (token) {
    mergedHeaders['Authorization'] = `Bearer ${token}`;
  }
  const method = (options?.method ?? 'GET').toUpperCase();
  const body = options?.body;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, `${API_BASE}${path}`, true);
    for (const [key, value] of Object.entries(mergedHeaders)) {
      if (value != null && value !== '') {
        xhr.setRequestHeader(key, value);
      }
    }
    xhr.onload = () => {
      resolve(xhr.responseText);
    };
    xhr.onerror = () => {
      reject(new Error('网络错误'));
    };
    xhr.send(body == null ? undefined : (body as XMLHttpRequestBodyInit));
  });
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const text = await requestTextViaXhr(path, options);
  let json: ApiResult<T>;
  try {
    json = JSON.parse(text) as ApiResult<T>;
  } catch {
    throw new Error('响应不是合法 JSON');
  }

  if (json.code === 401) {
    localStorage.removeItem('token');
    const currentPath = window.location.pathname;
    if (currentPath !== '/login') {
      window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
    }
    throw new Error('登录已过期，请重新登录');
  }

  if (json.code !== 200) {
    throw new ApiError(json.code, json.message || '请求失败');
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

// --------------- 订单类型 ---------------

export interface OrderItemVO {
  productId: number;
  productTitle: string;
  productImage: string | null;
  productPrice: number;
  quantity: number;
  totalAmount: number;
  /** 确认页：相对购物车价格快照是否有变动 */
  priceChanged?: boolean | null;
  /** 确认页：加入购物车时的单价 */
  previousPrice?: number | null;
}

/** 确认页问题类型，与后端 OrderConfirmIssueVO.issueType 一致 */
export type OrderConfirmIssueType =
  | 'INSUFFICIENT_STOCK'
  | 'EXCEED_LIMIT'
  | 'PRICE_CHANGED'
  | 'PRODUCT_OFFLINE';

export interface OrderConfirmIssueVO {
  issueType: OrderConfirmIssueType;
  productId: number;
  productTitle: string | null;
  productImage: string | null;
  message: string | null;
  cartQuantity: number | null;
  availableQuantity: number | null;
  limitPerUser: number | null;
  previousPrice: number | null;
  currentPrice: number | null;
}

export interface OrderConfirmVO {
  submitToken: string;
  sourceType: number;
  itemCount: number;
  totalAmount: number;
  items: OrderItemVO[];
  /** 后端确认页异常列表；旧接口可能无此字段 */
  issues?: OrderConfirmIssueVO[];
}

export interface OrderSubmitResult {
  orderId: number;
  orderNo: string;
  payOrderNo: string;
  orderStatus: number;
  payStatus: number;
  expireTime: string;
  payAmount: number;
}

export interface OrderListItem {
  id: number;
  orderNo: string;
  userId: number;
  orderStatus: number;
  payStatus: number;
  sourceType: number;
  totalAmount: number;
  payAmount: number;
  itemCount: number;
  expireTime: string | null;
  payTime: string | null;
  createTime: string;
}

export interface OrderDetail extends OrderListItem {
  receiverName: string;
  receiverPhone: string;
  receiverProvince: string;
  receiverCity: string;
  receiverDistrict: string;
  receiverDetailAddress: string;
  remark: string | null;
  cancelTime: string | null;
  cancelReason: string | null;
  items: OrderItemVO[];
}

export interface OrderPageResult {
  list: OrderListItem[];
  total: number;
}

export interface OrderSubmitParam {
  submitToken: string;
  sourceType: number;
  items: { productId: number; quantity: number }[];
  receiverName: string;
  receiverPhone: string;
  receiverProvince: string;
  receiverCity: string;
  receiverDistrict: string;
  receiverDetailAddress: string;
  remark?: string;
}

// --------------- 订单 API ---------------

export function fetchOrderConfirm(productIds?: number[]): Promise<OrderConfirmVO> {
  const q = new URLSearchParams();
  if (productIds && productIds.length > 0) {
    q.set('productIds', productIds.join(','));
  }
  const qs = q.toString();
  return request<OrderConfirmVO>(`/api/order/confirm${qs ? '?' + qs : ''}`);
}

export function submitOrder(param: OrderSubmitParam): Promise<OrderSubmitResult> {
  return post<OrderSubmitResult>('/api/order/submit', param);
}

export function fetchOrderList(params?: {
  orderStatus?: number;
  pageNum?: number;
  pageSize?: number;
}): Promise<OrderPageResult> {
  const q = new URLSearchParams();
  if (params?.orderStatus !== undefined) q.set('orderStatus', String(params.orderStatus));
  if (params?.pageNum) q.set('pageNum', String(params.pageNum));
  if (params?.pageSize) q.set('pageSize', String(params.pageSize));
  const qs = q.toString();
  return request<OrderPageResult>(`/api/order/list${qs ? '?' + qs : ''}`);
}

export function fetchOrderDetail(orderNo: string): Promise<OrderDetail> {
  return request<OrderDetail>(`/api/order/detail?orderNo=${encodeURIComponent(orderNo)}`);
}

export function cancelOrder(orderNo: string): Promise<void> {
  return post<void>('/api/order/cancel', { orderNo });
}

export function mockPay(orderNo: string, requestNo: string): Promise<void> {
  return post<void>('/api/pay/mock', { orderNo, requestNo });
}
