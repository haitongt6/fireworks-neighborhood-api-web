<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <Navbar />
    <main class="max-w-lg mx-auto px-4 py-12">
      <!-- 支付成功 -->
      <div v-if="paid" class="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 flex flex-col items-center">
        <div class="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
          <CircleCheck class="w-10 h-10 text-emerald-500" />
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">支付成功！</h2>
        <p class="text-gray-500 text-sm mb-8">订单号：{{ orderNo }}</p>
        <div class="flex gap-3 w-full">
          <RouterLink to="/orders" class="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl text-center font-bold hover:border-emerald-300 hover:text-emerald-600 transition-colors">
            查看订单
          </RouterLink>
          <RouterLink to="/" class="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-center font-bold transition-colors shadow-sm">
            继续购物
          </RouterLink>
        </div>
      </div>

      <!-- 支付中 -->
      <div v-else class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <!-- 彩带头 -->
        <div class="h-2 bg-[repeating-linear-gradient(45deg,#ff6b6b,#ff6b6b_10px,transparent_10px,transparent_20px,#4ecdc4_20px,#4ecdc4_30px,transparent_30px,transparent_40px)]"></div>

        <div class="p-8">
          <!-- 金额展示 -->
          <div class="text-center mb-8">
            <p class="text-sm text-gray-500 mb-2">需支付金额</p>
            <p class="text-5xl font-bold text-gray-900 tracking-tight">
              <span class="text-2xl mr-1 text-gray-600">¥</span>{{ Number(amount).toFixed(2) }}
            </p>
            <p class="text-xs text-gray-400 mt-2">订单号：{{ orderNo }}</p>
          </div>

          <!-- 支付方式 -->
          <div class="space-y-3 mb-8">
            <div
              v-for="method in payMethods"
              :key="method.id"
              @click="selectedMethod = method.id"
              :class="[
                'flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all',
                selectedMethod === method.id ? 'border-emerald-500 bg-emerald-50/50 shadow-sm' : 'border-gray-100 hover:border-gray-200'
              ]"
            >
              <div :class="['w-12 h-12 rounded-full flex items-center justify-center shrink-0', method.bgClass]">
                <component :is="method.icon" class="w-6 h-6 text-white" />
              </div>
              <div class="flex-1">
                <p class="font-bold text-gray-900">{{ method.name }}</p>
                <p class="text-xs text-gray-400 mt-0.5">{{ method.desc }}</p>
              </div>
              <div :class="['w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all', selectedMethod === method.id ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300']">
                <div v-if="selectedMethod === method.id" class="w-2 h-2 rounded-full bg-white"></div>
              </div>
            </div>
          </div>

          <!-- 错误提示 -->
          <div v-if="errorMsg" class="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
            <XCircle class="w-4 h-4 shrink-0" /> {{ errorMsg }}
          </div>

          <!-- 支付按钮 -->
          <button
            type="button"
            @click="handlePay"
            :disabled="isPaying"
            :class="[
              'w-full py-4 rounded-2xl font-bold text-white text-lg transition-all flex items-center justify-center gap-2',
              isPaying ? 'bg-emerald-400 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/30'
            ]"
          >
            <template v-if="isPaying">
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              支付中...
            </template>
            <template v-else>
              <ShieldCheck class="w-5 h-5" /> 确认支付 ¥{{ Number(amount).toFixed(2) }}
            </template>
          </button>

          <div class="mt-4 text-center">
            <RouterLink to="/orders" class="text-sm text-gray-400 hover:text-gray-600 transition-colors">暂不支付，稍后再说</RouterLink>
          </div>

          <div class="mt-6 pt-6 border-t border-gray-100 text-center text-xs text-gray-400 flex items-center justify-center gap-1">
            <ShieldCheck class="w-3.5 h-3.5" /> 当前为模拟支付环境，不会产生真实扣款
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { ShieldCheck, XCircle, CircleCheck, MessageCircle, Wallet, Zap } from 'lucide-vue-next';
import Navbar from '@/components/Navbar.vue';
import { mockPay } from '@/lib/api';

const route = useRoute();
const orderNo = route.query.orderNo as string;
const amount = route.query.amount as string;

const paid = ref(false);
const isPaying = ref(false);
const errorMsg = ref<string | null>(null);
const selectedMethod = ref('mock');

const payMethods = [
  { id: 'mock', name: '模拟支付', desc: '测试专用，秒到账，不扣真实余额', bgClass: 'bg-violet-500', icon: Zap },
  { id: 'wechat', name: '微信支付', desc: '推荐微信用户使用（演示模式）', bgClass: 'bg-[#07C160]', icon: MessageCircle },
  { id: 'alipay', name: '支付宝', desc: '支持花呗、余额宝（演示模式）', bgClass: 'bg-[#1677FF]', icon: Wallet },
];

async function handlePay() {
  if (isPaying.value) return;
  errorMsg.value = null;
  isPaying.value = true;
  try {
    // 所有方式均走模拟支付接口（requestNo 用时间戳保证幂等）
    const requestNo = `REQ${Date.now()}`;
    await mockPay(orderNo, requestNo);
    paid.value = true;
  } catch (e: unknown) {
    errorMsg.value = e instanceof Error ? e.message : '支付失败，请重试';
  } finally {
    isPaying.value = false;
  }
}
</script>
