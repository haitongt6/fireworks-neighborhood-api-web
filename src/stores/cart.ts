import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  fetchCartList,
  cartAdd,
  cartUpdate,
  cartRemove,
  cartClear,
} from '@/lib/api';
import type { CartItemVO } from '@/lib/api';

/** 前端扩展：每条购物车项增加 selected 状态 */
export interface CartItem extends CartItemVO {
  selected: boolean;
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([]);
  const loading = ref(false);
  const initialLoaded = ref(false);

  // ─── computed ───────────────────────────────────────

  const totalQuantity = computed(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0),
  );

  const selectedItems = computed(() => items.value.filter((i) => i.selected && !i.invalid));

  const allSelected = computed(
    () =>
      items.value.filter((i) => !i.invalid).length > 0 &&
      items.value.filter((i) => !i.invalid).every((i) => i.selected),
  );

  // ─── 加载购物车列表 ──────────────────────────────────

  async function loadCart() {
    loading.value = true;
    try {
      const list = await fetchCartList();
      items.value = list.map((vo) => ({ ...vo, selected: !vo.invalid }));
      initialLoaded.value = true;
    } finally {
      loading.value = false;
    }
  }

  // ─── 加购（加购后刷新列表）──────────────────────────

  async function addItem(
    productId: number,
    quantity = 1,
  ): Promise<void> {
    await cartAdd(productId, quantity);
    // 加购成功后刷新列表，保证本地与服务端一致
    await loadCart();
  }

  // ─── 修改数量 ────────────────────────────────────────

  async function updateQuantity(productId: number, newQuantity: number) {
    if (newQuantity < 1) return;
    // 乐观更新 UI
    const item = items.value.find((i) => i.productId === productId);
    if (item) {
      item.quantity = newQuantity;
    }
    try {
      await cartUpdate(productId, newQuantity);
    } catch (e) {
      // 回滚：重新加载
      await loadCart();
      throw e;
    }
  }

  // ─── 删除单项 ────────────────────────────────────────

  async function removeItem(productId: number) {
    // 乐观更新 UI
    items.value = items.value.filter((i) => i.productId !== productId);
    try {
      await cartRemove(productId);
    } catch (e) {
      await loadCart();
      throw e;
    }
  }

  // ─── 删除选中项 ──────────────────────────────────────

  async function removeSelected() {
    const toRemove = items.value.filter((i) => i.selected).map((i) => i.productId);
    // 乐观更新 UI
    items.value = items.value.filter((i) => !i.selected);
    try {
      await Promise.all(toRemove.map((id) => cartRemove(id)));
    } catch (e) {
      await loadCart();
      throw e;
    }
  }

  // ─── 清空 ────────────────────────────────────────────

  async function clearCart() {
    items.value = [];
    try {
      await cartClear();
    } catch (e) {
      await loadCart();
      throw e;
    }
  }

  // ─── 选中状态（纯本地）───────────────────────────────

  function toggleSelect(productId: number) {
    const item = items.value.find((i) => i.productId === productId);
    if (item && !item.invalid) {
      item.selected = !item.selected;
    }
  }

  function toggleSelectAll() {
    const validItems = items.value.filter((i) => !i.invalid);
    const next = !allSelected.value;
    validItems.forEach((i) => (i.selected = next));
  }

  return {
    items,
    loading,
    initialLoaded,
    totalQuantity,
    selectedItems,
    allSelected,
    loadCart,
    addItem,
    updateQuantity,
    removeItem,
    removeSelected,
    clearCart,
    toggleSelect,
    toggleSelectAll,
  };
});
