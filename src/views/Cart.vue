<template>
  <div class="min-h-screen bg-gray-50 pb-32">
    <Navbar />
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex items-end justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900">购物车</h1>
        <span class="text-sm text-gray-500 font-medium">共 {{ cartStore.items.length }} 件商品</span>
      </div>

      <div v-if="cartStore.items.length === 0" class="bg-white rounded-2xl shadow-sm p-16 flex flex-col items-center justify-center border border-gray-100">
        <div class="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center mb-6">
          <ShoppingCart class="w-12 h-12 text-gray-300" />
        </div>
        <p class="text-gray-500 text-lg mb-6 font-medium">购物车竟然是空的</p>
        <RouterLink to="/" class="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-full font-bold transition-colors shadow-lg shadow-emerald-500/30">
          去逛逛
        </RouterLink>
      </div>

      <div v-else class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="grid grid-cols-12 gap-4 p-4 bg-gray-50/80 border-b border-gray-100 text-sm font-bold text-gray-600">
          <div class="col-span-1 flex items-center justify-center">
            <input
              type="checkbox"
              :checked="cartStore.allSelected"
              @change="cartStore.toggleSelectAll"
              class="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded cursor-pointer"
            />
          </div>
          <div class="col-span-5">商品信息</div>
          <div class="col-span-2 text-center">单价</div>
          <div class="col-span-2 text-center">数量</div>
          <div class="col-span-1 text-center">金额</div>
          <div class="col-span-1 text-center">操作</div>
        </div>

        <div class="p-4 border-b border-gray-100 flex items-center gap-2">
          <Store class="w-5 h-5 text-emerald-600" />
          <span class="font-bold text-gray-800">烟火邻里自营店</span>
          <span class="bg-red-100 text-red-600 text-[10px] px-1.5 py-0.5 rounded font-bold ml-2">免运费</span>
        </div>

        <div class="divide-y divide-gray-100">
          <div
            v-for="item in cartStore.items"
            :key="item.cartId"
            :class="[
              'grid grid-cols-12 gap-4 p-4 items-center transition-colors',
              item.selected ? 'bg-emerald-50/20' : 'hover:bg-gray-50',
            ]"
          >
            <div class="col-span-1 flex items-center justify-center">
              <input
                type="checkbox"
                :checked="item.selected"
                @change="() => cartStore.toggleSelect(item.cartId)"
                class="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded cursor-pointer"
              />
            </div>

            <div class="col-span-5 flex gap-4">
              <RouterLink :to="`/product/${item.id}`" class="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-100 shrink-0 bg-gray-50 block">
                <img :src="item.image" :alt="item.name" class="w-full h-full object-cover" />
              </RouterLink>
              <div class="flex flex-col justify-center">
                <RouterLink :to="`/product/${item.id}`" class="text-sm font-bold text-gray-800 hover:text-emerald-600 transition-colors line-clamp-2 mb-2">
                  {{ item.name }}
                </RouterLink>
                <div class="text-xs text-gray-400 bg-gray-100 inline-block px-2 py-1 rounded self-start">
                  包装规格: 默认
                </div>
              </div>
            </div>

            <div class="col-span-2 text-center flex flex-col items-center justify-center">
              <span class="text-sm font-bold text-gray-800">¥{{ item.price.toFixed(2) }}</span>
              <span class="text-xs text-gray-400 line-through mt-1">¥{{ item.originalPrice.toFixed(2) }}</span>
            </div>

            <div class="col-span-2 flex justify-center items-center">
              <div class="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
                <button
                  type="button"
                  @click="cartStore.updateQuantity(item.cartId, -1)"
                  class="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-50"
                  :disabled="item.quantity <= 1"
                >
                  <Minus class="w-3.5 h-3.5" />
                </button>
                <input
                  type="text"
                  :value="item.quantity"
                  readonly
                  class="w-10 text-center text-sm font-bold border-x border-gray-200 py-1 focus:outline-none"
                />
                <button
                  type="button"
                  @click="cartStore.updateQuantity(item.cartId, 1)"
                  class="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                >
                  <Plus class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div class="col-span-1 text-center">
              <span class="text-sm font-bold text-red-500">
                ¥{{ (item.price * item.quantity).toFixed(2) }}
              </span>
            </div>

            <div class="col-span-1 flex justify-center">
              <button
                type="button"
                @click="cartStore.removeItem(item.cartId)"
                class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="删除"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Sticky Checkout Bar -->
    <div v-if="cartStore.items.length > 0" class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div class="flex items-center gap-6">
          <label class="flex items-center cursor-pointer">
            <input
              type="checkbox"
              :checked="cartStore.allSelected"
              @change="cartStore.toggleSelectAll"
              class="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded mr-2"
            />
            <span class="text-sm font-bold text-gray-700">全选</span>
          </label>
          <button
            type="button"
            @click="cartStore.removeSelected"
            class="text-sm text-gray-500 hover:text-red-500 transition-colors font-medium"
            :disabled="cartStore.selectedItems.length === 0"
          >
            删除选中商品
          </button>
        </div>

        <div class="flex items-center gap-6">
          <div class="text-sm text-gray-600 font-medium">
            已选商品 <span class="text-emerald-600 font-bold text-lg mx-1">{{ selectedQty }}</span> 件
          </div>
          <div class="flex items-baseline gap-2">
            <span class="text-sm text-gray-600 font-medium">合计(不含运费):</span>
            <span class="text-2xl font-bold text-red-500 tracking-tight">
              <span class="text-base mr-1">¥</span>
              {{ totalPrice.toFixed(2) }}
            </span>
          </div>
          <RouterLink
            to="/checkout"
            :class="[
              'px-10 py-3 rounded-full font-bold text-white text-lg transition-all shadow-lg text-center',
              cartStore.selectedItems.length > 0
                ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30'
                : 'bg-gray-300 cursor-not-allowed shadow-none pointer-events-none',
            ]"
          >
            去结算
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { Trash2, Minus, Plus, Store, ShoppingCart } from 'lucide-vue-next';
import Navbar from '@/components/Navbar.vue';
import { useCartStore } from '@/stores/cart';

const cartStore = useCartStore();

const selectedQty = computed(() =>
  cartStore.selectedItems.reduce((sum, item) => sum + item.quantity, 0)
);

const totalPrice = computed(() =>
  cartStore.selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
);
</script>
