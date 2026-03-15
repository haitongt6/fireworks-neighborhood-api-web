<template>
  <div v-if="loading" class="min-h-screen bg-gray-50 flex items-center justify-center">
    <p class="text-gray-500">加载中...</p>
  </div>
  <div v-else-if="!product" class="min-h-screen bg-gray-50 flex items-center justify-center">
    <p class="text-gray-500">商品不存在</p>
  </div>
  <div v-else class="min-h-screen bg-gray-50 pb-12">
    <Navbar />
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <nav class="flex items-center text-sm text-gray-500 mb-6 font-medium">
        <RouterLink to="/" class="hover:text-emerald-600 flex items-center transition-colors">
          <Home class="w-4 h-4 mr-1.5" /> 首页
        </RouterLink>
        <ChevronRight class="w-4 h-4 mx-2 text-gray-300" />
        <span class="hover:text-emerald-600 cursor-pointer transition-colors">{{ product.category }}</span>
        <ChevronRight class="w-4 h-4 mx-2 text-gray-300" />
        <span class="text-gray-800">{{ product.name }}</span>
      </nav>

      <div class="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row border border-gray-100">
        <div class="w-full md:w-2/5 p-6 lg:p-8">
          <!-- 主图/主图视频：主图视频若存在则排第一张前面 -->
          <div class="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
            <video
              v-if="activeMedia?.type === 'video'"
              :src="activeMedia.url"
              controls
              playsinline
              class="w-full h-full object-contain bg-black"
            />
            <img
              v-else-if="activeMedia?.type === 'image'"
              :src="activeMedia.url"
              :alt="product.name"
              class="w-full h-full object-cover"
            />
            <img
              v-else
              :src="product.image"
              :alt="product.name"
              class="w-full h-full object-cover"
            />
          </div>
          <!-- 缩略图：主图视频(若有) + 主图 -->
          <div class="flex gap-3 mt-4 flex-wrap">
            <div
              v-for="(m, idx) in mediaItems"
              :key="idx"
              :class="[
                'relative w-16 h-16 rounded-xl overflow-hidden border-2 cursor-pointer transition-all',
                idx === activeMediaIdx ? 'border-emerald-500 opacity-100' : 'border-transparent hover:border-emerald-200 opacity-70 hover:opacity-100',
              ]"
              @click="activeMediaIdx = idx"
            >
              <video
                v-if="m.type === 'video'"
                :src="m.url"
                class="w-full h-full object-cover"
                muted
              />
              <img v-else :src="m.url" :alt="product.name" class="w-full h-full object-cover" />
              <div
                v-if="m.type === 'video'"
                class="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl pointer-events-none"
              >
                <Play class="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div class="w-full md:w-3/5 p-6 lg:p-10 flex flex-col">
          <h1 class="text-2xl lg:text-3xl font-bold text-gray-900 mb-3 leading-tight">{{ product.name }}</h1>
          <p class="text-emerald-600 text-sm mb-6 font-medium bg-emerald-50 inline-block self-start px-3 py-1 rounded-full">产地直采 · 坏果包赔 · 极速退款</p>

          <div class="bg-gradient-to-r from-emerald-50 to-teal-50/30 rounded-2xl p-6 lg:p-8 mb-8 border border-emerald-100/50">
            <div class="flex items-baseline gap-2 mb-3">
              <span class="text-gray-600 text-sm font-medium">特卖价</span>
              <span class="text-4xl font-bold text-red-500 tracking-tight"><span class="text-xl mr-1">¥</span>{{ product.price }}</span>
              <span class="text-sm text-gray-400 line-through ml-3 font-medium">日常价 ¥{{ product.originalPrice }}</span>
            </div>
            <div class="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600 mt-5 font-medium">
              <div class="flex items-center"><Truck class="w-4 h-4 text-emerald-500 mr-1.5" /> 48小时发货</div>
              <div class="flex items-center"><ShieldCheck class="w-4 h-4 text-emerald-500 mr-1.5" /> 假一赔十</div>
              <div class="flex items-center"><CheckCircle2 class="w-4 h-4 text-emerald-500 mr-1.5" /> 极速退款</div>
              <div class="text-gray-400 ml-auto">已拼 {{ product.sales > 10000 ? (product.sales / 10000).toFixed(1) + '万' : product.sales }} 件</div>
            </div>
          </div>

          <div class="flex items-center gap-6 mb-10">
            <span class="text-gray-600 text-sm font-medium w-10">数量</span>
            <div class="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white">
              <button type="button" class="p-3 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors" @click="decrementQty">
                <Minus class="w-4 h-4" />
              </button>
              <input :value="quantity" type="text" readonly class="w-14 text-center text-base font-bold border-x border-gray-200 py-2 focus:outline-none" />
              <button type="button" class="p-3 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors" @click="incrementQty">
                <Plus class="w-4 h-4" />
              </button>
            </div>
            <span class="text-gray-400 text-sm font-medium">库存充足</span>
          </div>

          <div class="mt-auto flex gap-4">
            <button
              type="button"
              class="flex-1 bg-emerald-50 text-emerald-600 border-2 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all text-lg"
              @click="addToCart"
            >
              <ShoppingCart class="w-5 h-5" /> 加入购物车
            </button>
            <button
              type="button"
              class="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/30 text-lg"
              @click="buyNow"
            >
              立即购买
            </button>
          </div>
        </div>
      </div>

      <div class="mt-6 bg-white rounded-2xl shadow-sm p-6 lg:p-10 border border-gray-100">
        <div class="flex gap-10 border-b border-gray-100 mb-8">
          <button type="button" class="text-emerald-600 font-bold pb-4 border-b-4 border-emerald-500 text-lg">商品详情</button>
          <button type="button" class="text-gray-500 hover:text-gray-800 font-medium pb-4 text-lg transition-colors">用户评价 (999+)</button>
        </div>
        <div class="prose max-w-none text-gray-600 text-base leading-loose">
          <template v-if="product.detailPics?.length">
            <img
              v-for="(pic, idx) in product.detailPics"
              :key="idx"
              :src="pic"
              :alt="`${product.name} 详情图${idx + 1}`"
              class="w-full rounded-xl my-2"
            />
          </template>
          <template v-else>
            <p>暂无商品详情图片。</p>
          </template>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import { ChevronRight, Home, ShoppingCart, Minus, Plus, CheckCircle2, ShieldCheck, Truck, Play } from 'lucide-vue-next';
import Navbar from '@/components/Navbar.vue';
import type { ProductDetailView } from '@/lib/product';
import { fetchProductDetail } from '@/lib/api';
import { apiDetailToProductDetailView } from '@/lib/product';
import { useCartStore } from '@/stores/cart';

const route = useRoute();
const cartStore = useCartStore();
const quantity = ref(1);
const product = ref<ProductDetailView | null>(null);
const loading = ref(true);
const activeMediaIdx = ref(0);

const mediaItems = computed(() => {
  if (!product.value) return [];
  const items: { type: 'video' | 'image'; url: string }[] = [];
  if (product.value.mainVideo) {
    items.push({ type: 'video', url: product.value.mainVideo });
  }
  product.value.mainImages.forEach((url) => items.push({ type: 'image', url }));
  return items;
});

const activeMedia = computed(() => mediaItems.value[activeMediaIdx.value] ?? null);

async function loadProduct() {
  const id = route.params.id as string;
  if (!id) {
    product.value = null;
    loading.value = false;
    return;
  }
  loading.value = true;
  activeMediaIdx.value = 0;
  try {
    const detail = await fetchProductDetail(id);
    product.value = detail ? apiDetailToProductDetailView(detail) : null;
  } finally {
    loading.value = false;
  }
}

onMounted(loadProduct);
watch(() => route.params.id, loadProduct);

function decrementQty() {
  quantity.value = Math.max(1, quantity.value - 1);
}

function incrementQty() {
  quantity.value += 1;
}

function addToCart() {
  if (product.value) {
    cartStore.addItem(product.value, quantity.value);
  }
}

function buyNow() {
  if (product.value) {
    cartStore.addItem(product.value, quantity.value);
    // 实际项目中会跳转结算页
  }
}
</script>
