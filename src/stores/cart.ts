import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Product } from '@/lib/data';

export interface CartItem extends Product {
  cartId: string;
  quantity: number;
  selected: boolean;
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([]);

  const totalQuantity = computed(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0)
  );

  const selectedItems = computed(() => items.value.filter((i) => i.selected));

  const allSelected = computed(
    () => items.value.length > 0 && items.value.every((i) => i.selected)
  );

  function addItem(product: Product, quantity = 1) {
    const existing = items.value.find((i) => i.id === product.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      items.value.push({
        ...product,
        cartId: `c${Date.now()}`,
        quantity,
        selected: true,
      });
    }
  }

  function toggleSelect(cartId: string) {
    const item = items.value.find((i) => i.cartId === cartId);
    if (item) {
      item.selected = !item.selected;
    }
  }

  function toggleSelectAll() {
    const next = !allSelected.value;
    items.value.forEach((i) => (i.selected = next));
  }

  function updateQuantity(cartId: string, delta: number) {
    const item = items.value.find((i) => i.cartId === cartId);
    if (item) {
      item.quantity = Math.max(1, item.quantity + delta);
    }
  }

  function removeItem(cartId: string) {
    items.value = items.value.filter((i) => i.cartId !== cartId);
  }

  function removeSelected() {
    items.value = items.value.filter((i) => !i.selected);
  }

  return {
    items,
    totalQuantity,
    selectedItems,
    allSelected,
    addItem,
    toggleSelect,
    toggleSelectAll,
    updateQuantity,
    removeItem,
    removeSelected,
  };
});
