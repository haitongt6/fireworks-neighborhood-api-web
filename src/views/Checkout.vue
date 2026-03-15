<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <Navbar />
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex items-center mb-6">
        <RouterLink to="/cart" class="flex items-center text-gray-500 hover:text-emerald-600 transition-colors font-medium mr-4">
          <ArrowLeft class="w-5 h-5 mr-1" /> 返回购物车
        </RouterLink>
        <h1 class="text-2xl font-bold text-gray-900 border-l-2 border-gray-300 pl-4">确认订单</h1>
      </div>

      <div class="flex flex-col lg:flex-row gap-6">
        <div class="flex-1 space-y-6">
          <section class="bg-white rounded-2xl shadow-sm p-6 lg:p-8 border border-gray-100 relative overflow-hidden">
            <div class="absolute top-0 left-0 right-0 h-1 bg-[repeating-linear-gradient(45deg,#ff6b6b,#ff6b6b_10px,transparent_10px,transparent_20px,#4ecdc4_20px,#4ecdc4_30px,transparent_30px,transparent_40px)]"></div>
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-bold text-gray-900 flex items-center">
                <MapPin class="w-5 h-5 mr-2 text-emerald-500" /> 收货地址
              </h2>
              <button type="button" class="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors">
                修改地址
              </button>
            </div>
            <div class="flex items-start justify-between group cursor-pointer p-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200">
              <div>
                <div class="flex items-baseline gap-4 mb-2">
                  <span class="text-lg font-bold text-gray-900">张三</span>
                  <span class="text-gray-600 font-medium">138****5678</span>
                  <span class="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded font-bold">默认</span>
                </div>
                <p class="text-gray-600 text-sm leading-relaxed">
                  北京市 朝阳区 望京街道 望京SOHO T3 A座 1501室
                </p>
              </div>
              <ChevronRight class="w-5 h-5 text-gray-400 group-hover:text-emerald-500 transition-colors self-center" />
            </div>
          </section>

          <section class="bg-white rounded-2xl shadow-sm p-6 lg:p-8 border border-gray-100">
            <h2 class="text-lg font-bold text-gray-900 mb-6">支付方式</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                @click="paymentMethod = 'wechat'"
                :class="[
                  'relative p-5 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4',
                  paymentMethod === 'wechat'
                    ? 'border-[#07C160] bg-[#07C160]/5 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 bg-white',
                ]"
              >
                <div class="w-12 h-12 bg-[#07C160] rounded-full flex items-center justify-center shrink-0">
                  <MessageCircle class="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 class="font-bold text-gray-900 text-base">微信支付</h3>
                  <p class="text-xs text-gray-500 mt-0.5">推荐微信用户使用</p>
                </div>
                <CheckCircle2 v-if="paymentMethod === 'wechat'" class="absolute top-1/2 -translate-y-1/2 right-4 w-6 h-6 text-[#07C160]" />
              </div>
              <div
                @click="paymentMethod = 'alipay'"
                :class="[
                  'relative p-5 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4',
                  paymentMethod === 'alipay'
                    ? 'border-[#1677FF] bg-[#1677FF]/5 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 bg-white',
                ]"
              >
                <div class="w-12 h-12 bg-[#1677FF] rounded-full flex items-center justify-center shrink-0">
                  <Wallet class="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 class="font-bold text-gray-900 text-base">支付宝</h3>
                  <p class="text-xs text-gray-500 mt-0.5">支持花呗、余额宝</p>
                </div>
                <CheckCircle2 v-if="paymentMethod === 'alipay'" class="absolute top-1/2 -translate-y-1/2 right-4 w-6 h-6 text-[#1677FF]" />
              </div>
            </div>
          </section>

          <section class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div class="flex items-center gap-2">
                <Store class="w-5 h-5 text-emerald-600" />
                <span class="font-bold text-gray-800">烟火邻里自营店</span>
              </div>
              <span class="text-sm text-gray-500 font-medium">预计明天 16:00 前送达</span>
            </div>
            <div class="divide-y divide-gray-100 p-6">
              <div v-for="item in checkoutItems" :key="item.id" class="py-4 first:pt-0 last:pb-0 flex gap-4">
                <div class="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-100 shrink-0 bg-gray-50">
                  <img :src="item.image" :alt="item.name" class="w-full h-full object-cover" />
                </div>
                <div class="flex-1 flex flex-col justify-between">
                  <div class="flex justify-between gap-4">
                    <h3 class="text-sm font-bold text-gray-800 line-clamp-2 leading-snug">
                      {{ item.name }}
                    </h3>
                    <div class="text-right shrink-0">
                      <div class="text-sm font-bold text-gray-900">¥{{ item.price.toFixed(2) }}</div>
                      <div class="text-xs text-gray-400 mt-1">x{{ item.quantity }}</div>
                    </div>
                  </div>
                  <div class="text-xs text-gray-400 bg-gray-100 inline-block px-2 py-1 rounded self-start">
                    包装规格: 默认
                  </div>
                </div>
              </div>
            </div>
            <div class="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <span class="text-sm text-gray-600 font-medium">订单备注</span>
              <input
                v-model="remark"
                type="text"
                placeholder="选填，请先和商家协商一致"
                class="text-sm bg-transparent border-none text-right focus:outline-none w-2/3 placeholder-gray-400"
              />
            </div>
          </section>
        </div>

        <div class="w-full lg:w-96 shrink-0">
          <div class="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 sticky top-24">
            <h2 class="text-lg font-bold text-gray-900 mb-6">订单详情</h2>
            <div class="space-y-4 text-sm mb-6">
              <div class="flex justify-between text-gray-600">
                <span>商品总价</span>
                <span class="font-medium">¥{{ totalAmount.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between text-gray-600">
                <span>运费</span>
                <span class="font-medium text-emerald-600">免运费</span>
              </div>
              <div class="flex justify-between text-gray-600">
                <span>活动优惠</span>
                <span class="font-medium text-red-500">- ¥0.00</span>
              </div>
            </div>
            <div class="border-t border-gray-100 pt-4 mb-8">
              <div class="flex justify-between items-baseline">
                <span class="text-base font-bold text-gray-900">实付款</span>
                <span class="text-3xl font-bold text-red-500 tracking-tight">
                  <span class="text-lg mr-1">¥</span>{{ finalAmount.toFixed(2) }}
                </span>
              </div>
              <div class="text-right text-xs text-gray-500 mt-2">
                包含运费及包装费
              </div>
            </div>
            <button
              type="button"
              @click="handleSubmit"
              :disabled="isSubmitting"
              :class="[
                'w-full py-4 rounded-xl font-bold text-white text-lg transition-all shadow-lg flex items-center justify-center',
                isSubmitting
                  ? 'bg-emerald-400 cursor-not-allowed shadow-none'
                  : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30',
              ]"
            >
              <template v-if="isSubmitting">
                <span class="flex items-center gap-2">
                  <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                  处理中...
                </span>
              </template>
              <template v-else>
                提交订单
              </template>
            </button>
            <div class="mt-4 text-center text-xs text-gray-400 flex items-center justify-center gap-1">
              <CheckCircle2 class="w-3.5 h-3.5" /> 平台保障 · 交易安全
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useCartStore } from '@/stores/cart';
import { MapPin, ChevronRight, MessageCircle, Wallet, CheckCircle2, Store, ArrowLeft } from 'lucide-vue-next';
import Navbar from '@/components/Navbar.vue';

const cartStore = useCartStore();
const paymentMethod = ref<'wechat' | 'alipay'>('wechat');
const isSubmitting = ref(false);
const remark = ref('');

const checkoutItems = computed(() => cartStore.selectedItems);

const totalAmount = computed(() =>
  checkoutItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
);
const shippingFee = 0;
const finalAmount = computed(() => totalAmount.value + shippingFee);

function handleSubmit() {
  isSubmitting.value = true;
  setTimeout(() => {
    alert('订单提交成功！即将跳转支付页面...');
    isSubmitting.value = false;
  }, 1500);
}
</script>
