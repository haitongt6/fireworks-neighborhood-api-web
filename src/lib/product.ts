import type { Product } from '@/lib/data';
import type { ApiProductListItem, ApiProductDetail } from '@/lib/api';
import { API_BASE } from '@/lib/api';

/** 相对路径转为可访问地址：将 /api/file/xxx 统一转为 /file/xxx，走 vite /file 代理 */
function toFullUrl(url: string | undefined): string {
  if (!url || !url.trim()) return '';
  let u = url.trim();
  if (u.startsWith('/api/file/')) {
    u = u.replace(/^\/api\/file\//, '/file/');
  }
  if (u.startsWith('/file/')) {
    u = API_BASE.replace(/\/$/, '') + u;
  }
  return u;
}

/** 从 images 字段取第一张图（逗号分隔或单个 URL），相对路径转为 API 绝对地址 */
function firstImage(images: string | undefined): string {
  if (!images || !images.trim()) return 'https://picsum.photos/seed/placeholder/400/400';
  const first = images.split(',')[0]?.trim();
  if (!first) return 'https://picsum.photos/seed/placeholder/400/400';
  return toFullUrl(first) || 'https://picsum.photos/seed/placeholder/400/400';
}

export function apiProductToProduct(item: ApiProductListItem): Product {
  return {
    id: String(item.id),
    name: item.title || '',
    price: Number(item.price) || 0,
    originalPrice: Number(item.price) || 0,
    sales: item.stock ?? 0,
    image: firstImage(item.images),
    category: item.categoryName || '',
  };
}

export function apiDetailToProduct(detail: ApiProductDetail): Product {
  return {
    id: String(detail.id),
    name: detail.title || '',
    price: Number(detail.price) || 0,
    originalPrice: Number(detail.price) || 0,
    sales: detail.stock ?? 0,
    image: firstImage(detail.images),
    category: detail.categoryName || '',
  };
}

/** 商品详情页展示数据：主图视频（可选）、主图列表、详情图列表 */
export interface ProductDetailView extends Product {
  /** 数字类型的商品 ID，供购物车 API 使用 */
  numericId: number;
  /** 当前库存 */
  stock: number;
  mainVideo: string | null;
  mainImages: string[];
  detailPics: string[];
}

export function apiDetailToProductDetailView(detail: ApiProductDetail): ProductDetailView {
  const base = apiDetailToProduct(detail);
  const mainImages = parseMediaList(detail.images);
  const detailPics = parseMediaList(detail.detailPics);
  const mainVideo = detail.mainVideo?.trim() ? toFullUrl(detail.mainVideo) : null;

  return {
    ...base,
    numericId: detail.id,
    stock: detail.stock ?? 0,
    mainVideo,
    mainImages,
    detailPics,
  };
}

function parseMediaList(s: string | undefined): string[] {
  if (!s || !s.trim()) return [];
  return s
    .split(',')
    .map((x) => toFullUrl(x.trim()))
    .filter(Boolean);
}
