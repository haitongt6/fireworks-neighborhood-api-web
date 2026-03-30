export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  /** 销量（已售件数） */
  sales: number;
  /** 可售库存 */
  stock: number;
  image: string;
  category: string;
}
