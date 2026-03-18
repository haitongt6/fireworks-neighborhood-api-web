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
          <template v-if="authStore.isLoggedIn">
            <div class="flex flex-col items-center text-gray-600">
              <User class="w-5 h-5 mb-0.5" />
              <span class="text-xs font-medium max-w-[80px] truncate">{{ authStore.member?.nickname || '用户' }}</span>
            </div>
            <button
              @click="handleLogout"
              class="flex flex-col items-center text-gray-600 hover:text-red-500 transition-colors"
            >
              <LogOut class="w-5 h-5 mb-0.5" />
              <span class="text-xs font-medium">退出</span>
            </button>
          </template>
          <template v-else>
            <RouterLink to="/login" class="flex flex-col items-center text-gray-600 hover:text-emerald-600 transition-colors">
              <User class="w-5 h-5 mb-0.5" />
              <span class="text-xs font-medium">登录/注册</span>
            </RouterLink>
          </template>

          <!-- 购物车按钮：未登录时弹确认框 -->
          <button
            type="button"
            @click="handleCartClick"
            class="flex flex-col items-center text-gray-600 hover:text-emerald-600 cursor-pointer relative transition-colors"
          >
            <div class="absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
              {{ cartCount }}
            </div>
            <ShoppingCart class="w-5 h-5 mb-0.5" />
            <span class="text-xs font-medium">购物车</span>
          </button>
        </div>
      </div>
    </div>
  </header>

  <!-- 未登录确认弹框 -->
  <LoginConfirmDialog
    :visible="showCartLoginDialog"
    title="请先登录"
    message="登录后才能查看购物车"
    hint="登录后可加入购物车、查看订单及享受专属优惠"
    @confirm="onCartLoginConfirm"
    @cancel="showCartLoginDialog = false"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { ShoppingCart, Search, User, MapPin, LogOut } from 'lucide-vue-next';
import { useCartStore } from '@/stores/cart';
import { useAuthStore } from '@/stores/auth';
import LoginConfirmDialog from '@/components/LoginConfirmDialog.vue';

const cartStore = useCartStore();
const authStore = useAuthStore();
const router = useRouter();

const cartCount = computed(() => cartStore.totalQuantity);
const showCartLoginDialog = ref(false);

function handleCartClick() {
  if (!authStore.isLoggedIn) {
    showCartLoginDialog.value = true;
    return;
  }
  router.push('/cart');
}

function onCartLoginConfirm() {
  showCartLoginDialog.value = false;
  router.push({ name: 'Login', query: { redirect: '/cart' } });
}

onMounted(async () => {
  if (authStore.isLoggedIn && !cartStore.initialLoaded) {
    try { await cartStore.loadCart(); } catch {}
  }
});

async function handleLogout() {
  await authStore.logout();
  router.push('/');
}
</script>
