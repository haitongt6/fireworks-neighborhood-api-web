<template>
  <header class="bg-white border-b sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center gap-8">
          <RouterLink to="/" class="text-2xl font-bold text-emerald-600 tracking-tight flex items-baseline">
            烟火邻里 <span class="text-xs font-normal text-white bg-emerald-500 px-1.5 py-0.5 rounded ml-2 relative -top-1">C端</span>
          </RouterLink>
          <div class="hidden md:flex items-center text-sm text-gray-600 hover:text-emerald-600 cursor-pointer">
            <MapPin class="w-4 h-4 mr-1" />
            <span>北京市朝阳区</span>
          </div>
        </div>

        <div class="flex-1 max-w-2xl px-8">
          <div class="relative group">
            <input
              type="text"
              placeholder="搜索商品，如：新鲜苹果"
              class="w-full bg-gray-100 border-2 border-transparent focus:bg-white focus:border-emerald-500 rounded-full py-2 pl-5 pr-12 text-sm transition-all outline-none"
            />
            <button class="absolute right-1 top-1 bottom-1 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full transition-colors flex items-center justify-center">
              <Search class="w-4 h-4" />
            </button>
          </div>
        </div>

        <div class="flex items-center gap-6">
          <RouterLink to="/login" class="flex flex-col items-center text-gray-600 hover:text-emerald-600 transition-colors">
            <User class="w-5 h-5 mb-0.5" />
            <span class="text-xs font-medium">登录/注册</span>
          </RouterLink>
          <RouterLink to="/cart" class="flex flex-col items-center text-gray-600 hover:text-emerald-600 cursor-pointer relative transition-colors">
            <div class="absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
              {{ cartCount }}
            </div>
            <ShoppingCart class="w-5 h-5 mb-0.5" />
            <span class="text-xs font-medium">购物车</span>
          </RouterLink>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { ShoppingCart, Search, User, MapPin } from 'lucide-vue-next';
import { useCartStore } from '@/stores/cart';

const cartStore = useCartStore();
const cartCount = computed(() => cartStore.totalQuantity);
</script>
