<template>
  <div class="min-h-screen bg-gray-50 pb-12">
    <Navbar />
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex gap-6">
      <!-- Sidebar Categories -->
      <aside class="w-48 shrink-0 hidden lg:block">
        <div class="bg-white rounded-xl shadow-sm overflow-hidden sticky top-24 border border-gray-100">
          <div class="p-4 bg-emerald-50/50 border-b border-emerald-100/50 flex items-center gap-2">
            <div class="w-1 h-4 bg-emerald-500 rounded-full"></div>
            <h2 class="font-bold text-emerald-800">商品分类</h2>
          </div>
          <ul class="py-2">
            <li v-for="(cat, idx) in categories" :key="cat.id ?? idx">
              <button
                :class="[
                  'w-full text-left px-5 py-3 text-sm hover:bg-emerald-50 transition-colors',
                  idx === selectedCatIdx
                    ? 'text-emerald-600 font-bold border-l-4 border-emerald-500 bg-emerald-50/30'
                    : 'text-gray-600 border-l-4 border-transparent font-medium',
                ]"
                @click="selectedCatIdx = idx"
              >
                {{ cat.name }}
              </button>
            </li>
          </ul>
        </div>
      </aside>

      <!-- Product Area -->
      <div class="flex-1">
        <!-- Banner -->
        <div class="bg-gradient-to-r from-emerald-500 to-teal-400 rounded-2xl h-44 mb-6 flex items-center px-10 shadow-md text-white relative overflow-hidden">
          <div class="relative z-10">
            <div class="flex items-center gap-2 mb-2">
              <span class="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                <Flame class="w-3 h-3" /> 限时抢购
              </span>
            </div>
            <h1 class="text-3xl font-bold mb-2 tracking-tight">今日特卖 鲜活到家</h1>
            <p class="text-emerald-50 font-medium opacity-90">每日精选源头好货，品质保证，坏果包赔</p>
          </div>
          <div class="absolute -right-10 -top-20 w-64 h-64 bg-white opacity-10 rounded-full blur-2xl"></div>
          <div class="absolute right-40 -bottom-20 w-40 h-40 bg-white opacity-10 rounded-full blur-xl"></div>
        </div>

        <!-- Grid -->
        <p v-if="loading" class="text-gray-500 py-8 text-center">加载中...</p>
        <p v-else-if="error" class="text-red-500 py-8 text-center">{{ error }}</p>
        <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <RouterLink
            v-for="product in products"
            :key="product.id"
            :to="`/product/${product.id}`"
            class="bg-white rounded-2xl p-3 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group block border border-gray-100"
          >
            <div class="relative aspect-square rounded-xl overflow-hidden mb-3 bg-gray-50">
              <img
                :src="product.image"
                :alt="product.name"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div
                v-if="product.sales > 10000"
                class="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm"
              >
                热销爆款
              </div>
            </div>
            <h3 class="text-sm text-gray-800 font-medium line-clamp-2 mb-1.5 group-hover:text-emerald-600 transition-colors leading-snug h-10">
              {{ product.name }}
            </h3>
            <div class="text-xs text-gray-400 mb-3 bg-gray-50 inline-block px-2 py-0.5 rounded text-[11px]">
              已拼 {{ product.sales > 10000 ? (product.sales / 10000).toFixed(1) + '万' : product.sales }}件
            </div>
            <div class="flex items-center justify-between mt-auto">
              <div class="flex items-baseline gap-1">
                <span class="text-xs text-red-500 font-bold">¥</span>
                <span class="text-xl text-red-500 font-bold tracking-tight">{{ product.price }}</span>
                <span class="text-xs text-gray-400 line-through ml-1 font-medium">¥{{ product.originalPrice }}</span>
              </div>
              <button
                class="bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-full shadow-sm shadow-emerald-200 transition-colors"
                @click.prevent="addToCart(product)"
              >
                <Plus class="w-4 h-4" :stroke-width="3" />
              </button>
            </div>
          </RouterLink>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { RouterLink } from 'vue-router';
import { Plus, Flame } from 'lucide-vue-next';
import Navbar from '@/components/Navbar.vue';
import type { Product } from '@/lib/data';
import { fetchCategoryList, fetchProductList } from '@/lib/api';
import { apiProductToProduct } from '@/lib/product';
import { useCartStore } from '@/stores/cart';

const cartStore = useCartStore();
const loading = ref(true);
const error = ref('');
const categories = ref<{ id?: number; name: string }[]>([]);
const products = ref<Product[]>([]);
const selectedCatIdx = ref(0);

async function loadProducts() {
  const cat = categories.value[selectedCatIdx.value];
  const categoryId = cat?.id;
  try {
    loading.value = true;
    error.value = '';
    const prodRes = await fetchProductList({
      pageNum: 1,
      pageSize: 20,
      categoryId: categoryId ?? undefined,
    });
    products.value = prodRes.list.map(apiProductToProduct);
  } catch (e) {
    error.value = e instanceof Error ? e.message : '加载失败';
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  try {
    loading.value = true;
    error.value = '';
    const catRes = await fetchCategoryList();
    categories.value = [{ name: '全部' }, ...catRes];
    await loadProducts();
  } catch (e) {
    error.value = e instanceof Error ? e.message : '加载失败';
    loading.value = false;
  }
});

watch(selectedCatIdx, () => {
  if (categories.value.length > 0) {
    loadProducts();
  }
});

function addToCart(product: Product) {
  cartStore.addItem(product);
}
</script>
