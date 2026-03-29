<template>
  <div class="min-h-screen bg-gray-50 pb-32">
    <Navbar />

    <!-- 快照变动 Toast -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-3"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-3"
    >
      <div v-if="snapshotToast" class="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-amber-50 border border-amber-300 text-amber-800 rounded-2xl shadow-lg px-6 py-4 max-w-md w-full mx-4 flex items-start gap-3">
        <AlertTriangle class="w-5 h-5 mt-0.5 shrink-0 text-amber-500" />
        <div class="flex-1">
          <p class="font-bold text-sm mb-0.5">商品信息已更新</p>
          <p class="text-xs leading-relaxed">{{ snapshotToast }}</p>
        </div>
        <button @click="snapshotToast = null" class="text-amber-400 hover:text-amber-600 transition-colors">
          <X class="w-4 h-4" />
        </button>
      </div>
    </Transition>

    <!-- 错误 Toast -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-3"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-3"
    >
      <div v-if="errorToast" class="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-red-50 border border-red-200 text-red-700 rounded-2xl shadow-lg px-6 py-4 max-w-md w-full mx-4 flex items-center gap-3">
        <XCircle class="w-5 h-5 shrink-0 text-red-500" />
        <p class="text-sm font-medium flex-1">{{ errorToast }}</p>
        <button @click="errorToast = null" class="text-red-400 hover:text-red-600">
          <X class="w-4 h-4" />
        </button>
      </div>
    </Transition>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex items-end justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900">购物车</h1>
        <span class="text-sm text-gray-500 font-medium">共 {{ cartStore.items.length }} 件商品</span>
      </div>

      <!-- 加载中 -->
      <div v-if="cartStore.loading && !cartStore.initialLoaded" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 flex flex-col items-center gap-4">
        <div class="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p class="text-gray-400 text-sm font-medium">加载购物车中...</p>
      </div>

      <!-- 空购物车 -->
      <div v-else-if="cartStore.items.length === 0" class="bg-white rounded-2xl shadow-sm p-16 flex flex-col items-center justify-center border border-gray-100">
        <div class="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center mb-6">
          <ShoppingCart class="w-12 h-12 text-gray-300" />
        </div>
        <p class="text-gray-500 text-lg mb-6 font-medium">购物车竟然是空的</p>
        <RouterLink to="/" class="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-full font-bold transition-colors shadow-lg shadow-emerald-500/30">去逛逛</RouterLink>
      </div>

      <!-- 购物车列表 -->
      <div v-else class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <!-- 表头 -->
        <div class="grid grid-cols-12 gap-4 p-4 bg-gray-50/80 border-b border-gray-100 text-sm font-bold text-gray-600">
          <div class="col-span-1 flex items-center justify-center">
            <input type="checkbox" :checked="cartStore.allSelected" @change="cartStore.toggleSelectAll"
              class="w-4 h-4 text-emerald-600 border-gray-300 rounded cursor-pointer" />
          </div>
          <div class="col-span-5">商品信息</div>
          <div class="col-span-2 text-center">单价</div>
          <div class="col-span-2 text-center">数量</div>
          <div class="col-span-1 text-center">金额</div>
          <div class="col-span-1 text-center">操作</div>
        </div>

        <!-- 店铺行 -->
        <div class="p-4 border-b border-gray-100 flex items-center gap-2">
          <Store class="w-5 h-5 text-emerald-600" />
          <span class="font-bold text-gray-800">烟火邻里自营店</span>
          <span class="bg-red-100 text-red-600 text-[10px] px-1.5 py-0.5 rounded font-bold ml-2">免运费</span>
        </div>

        <!-- 商品行 -->
        <div class="divide-y divide-gray-100">
          <div v-for="item in cartStore.items" :key="item.productId"
            :class="['grid grid-cols-12 gap-4 p-4 items-center transition-colors', item.invalid ? 'opacity-60 bg-gray-50' : item.selected ? 'bg-emerald-50/20' : 'hover:bg-gray-50']">

            <div class="col-span-1 flex items-center justify-center">
              <input type="checkbox" :checked="item.selected" :disabled="item.invalid"
                @change="() => cartStore.toggleSelect(item.productId)"
                class="w-4 h-4 text-emerald-600 border-gray-300 rounded cursor-pointer disabled:cursor-not-allowed" />
            </div>

            <div class="col-span-5 flex gap-4">
              <RouterLink :to="`/product/${item.productId}`" class="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-100 shrink-0 bg-gray-50 block">
                <img :src="resolveImg(item.imageSnapshot)" :alt="item.titleSnapshot" class="w-full h-full object-cover" />
                <div v-if="item.invalid" class="absolute inset-0 bg-gray-800/40 flex items-center justify-center rounded-xl">
                  <span class="text-white text-[11px] font-bold bg-gray-700/80 px-2 py-1 rounded-lg">
                    {{ item.productStatus !== 1 ? '已下架' : item.productStock === 0 ? '已售罄' : '失效' }}
                  </span>
                </div>
              </RouterLink>
              <div class="flex flex-col justify-center">
                <RouterLink :to="`/product/${item.productId}`" class="text-sm font-bold text-gray-800 hover:text-emerald-600 transition-colors line-clamp-2 mb-2">{{ item.titleSnapshot }}</RouterLink>
                <div class="flex items-center gap-2 flex-wrap">
                  <div class="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">默认规格</div>
                  <span v-if="item.limitPerUser" class="text-xs text-orange-500 bg-orange-50 px-2 py-1 rounded font-medium">限购 {{ item.limitPerUser }} 件</span>
                  <span v-if="item.invalid" class="text-xs text-red-500 bg-red-50 px-2 py-1 rounded font-medium">
                    {{ item.productStatus !== 1 ? '商品已下架' : item.productStock === 0 ? '库存不足' : '商品失效' }}
                  </span>
                </div>
              </div>
            </div>

            <div class="col-span-2 text-center">
              <span class="text-sm font-bold text-gray-800">¥{{ Number(item.priceSnapshot).toFixed(2) }}</span>
            </div>

            <div class="col-span-2 flex justify-center items-center">
              <div :class="['flex items-center border rounded-lg overflow-hidden', item.invalid ? 'border-gray-100 opacity-50' : 'border-gray-200']">
                <button type="button" @click="() => handleDecrement(item)"
                  :disabled="item.quantity <= 1 || item.invalid || updatingIds.has(item.productId)"
                  class="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  <Minus class="w-3.5 h-3.5" />
                </button>
                <span class="w-10 text-center text-sm font-bold border-x border-gray-200 py-1">
                  <span v-if="updatingIds.has(item.productId)" class="inline-block w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></span>
                  <span v-else>{{ item.quantity }}</span>
                </span>
                <button type="button" @click="() => handleIncrement(item)"
                  :disabled="item.invalid || updatingIds.has(item.productId) || item.quantity >= (item.productStock ?? 99)"
                  class="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  <Plus class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div class="col-span-1 text-center">
              <span :class="['text-sm font-bold', item.invalid ? 'text-gray-400' : 'text-red-500']">
                ¥{{ (Number(item.priceSnapshot) * item.quantity).toFixed(2) }}
              </span>
            </div>

            <div class="col-span-1 flex justify-center">
              <button type="button" @click="() => handleRemove(item.productId)"
                class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 底部结算栏 -->
    <div v-if="cartStore.items.length > 0" class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div class="flex items-center gap-6">
          <label class="flex items-center cursor-pointer">
            <input type="checkbox" :checked="cartStore.allSelected" @change="cartStore.toggleSelectAll"
              class="w-4 h-4 text-emerald-600 border-gray-300 rounded mr-2" />
            <span class="text-sm font-bold text-gray-700">全选</span>
          </label>
          <button type="button" @click="handleRemoveSelected" :disabled="cartStore.selectedItems.length === 0"
            class="text-sm text-gray-500 hover:text-red-500 transition-colors font-medium disabled:opacity-40 disabled:cursor-not-allowed">
            删除选中
          </button>
        </div>
        <div class="flex items-center gap-6">
          <div class="text-sm text-gray-600 font-medium">已选 <span class="text-emerald-600 font-bold text-lg mx-1">{{ selectedQty }}</span> 件</div>
          <div class="flex items-baseline gap-1">
            <span class="text-sm text-gray-600 font-medium">合计:</span>
            <span class="text-2xl font-bold text-red-500"><span class="text-base mr-0.5">¥</span>{{ totalPrice.toFixed(2) }}</span>
          </div>
          <RouterLink :to="checkoutLink" :class="['px-10 py-3 rounded-full font-bold text-white text-lg transition-all shadow-lg', cartStore.selectedItems.length > 0 ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30' : 'bg-gray-300 cursor-not-allowed pointer-events-none']">去结算</RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { Trash2, Minus, Plus, Store, ShoppingCart, AlertTriangle, X, XCircle } from 'lucide-vue-next';
import Navbar from '@/components/Navbar.vue';
import { useCartStore } from '@/stores/cart';
import { API_BASE } from '@/lib/api';
import type { CartItem } from '@/stores/cart';

// 将后端返回的 /api/file/xxx 路径转为前端可访问的完整 URL
function resolveImg(url: string | null | undefined): string {
  if (!url || !url.trim()) return '';
  let u = url.trim();
  if (u.startsWith('/api/file/')) {
      u = u.replace(/^\/api\/file\//, '/file/');
  }
  if (u.startsWith('/file/')) {
    return API_BASE.replace(/\/$/, '') + u;
  }
  return u;
}

const cartStore = useCartStore();
const snapshotToast = ref<string | null>(null);
const errorToast = ref<string | null>(null);
const updatingIds = ref<Set<number>>(new Set());

function showError(msg: string) {
  errorToast.value = msg;
  setTimeout(() => { errorToast.value = null; }, 4000);
}

onMounted(async () => {
  if (!cartStore.initialLoaded) {
    try {
      await cartStore.loadCart();
    } catch (e: unknown) {
      showError(e instanceof Error ? e.message : "购物车加载失败");
    }
  }
});

const selectedQty = computed(() =>
  cartStore.selectedItems.reduce((sum, item) => sum + item.quantity, 0),
);

const totalPrice = computed(() =>
  cartStore.selectedItems.reduce((sum, item) => sum + Number(item.priceSnapshot) * item.quantity, 0),
);

const checkoutLink = computed(() => {
  const ids = cartStore.selectedItems.map((item) => item.productId).join(',');
  return ids ? `/checkout?productIds=${encodeURIComponent(ids)}` : '/checkout';
});

async function handleDecrement(item: CartItem) {
  if (item.quantity <= 1 || updatingIds.value.has(item.productId)) return;
  updatingIds.value = new Set([...updatingIds.value, item.productId]);
  try {
    await cartStore.updateQuantity(item.productId, item.quantity - 1);
  } catch (e: unknown) {
    showError(e instanceof Error ? e.message : "修改数量失败");
  } finally {
    const s = new Set(updatingIds.value); s.delete(item.productId); updatingIds.value = s;
  }
}

async function handleIncrement(item: CartItem) {
  if (updatingIds.value.has(item.productId)) return;
  updatingIds.value = new Set([...updatingIds.value, item.productId]);
  try {
    await cartStore.updateQuantity(item.productId, item.quantity + 1);
  } catch (e: unknown) {
    showError(e instanceof Error ? e.message : "修改数量失败");
  } finally {
    const s = new Set(updatingIds.value); s.delete(item.productId); updatingIds.value = s;
  }
}

async function handleRemove(productId: number) {
  try {
    await cartStore.removeItem(productId);
  } catch (e: unknown) {
    showError(e instanceof Error ? e.message : "删除失败");
  }
}

async function handleRemoveSelected() {
  try {
    await cartStore.removeSelected();
  } catch (e: unknown) {
    showError(e instanceof Error ? e.message : "删除失败");
  }
}
</script>
