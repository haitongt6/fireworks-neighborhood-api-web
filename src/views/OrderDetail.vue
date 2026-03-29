<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <Navbar />
    <main class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex items-center mb-6">
        <RouterLink to="/orders" class="flex items-center text-gray-500 hover:text-emerald-600 transition-colors font-medium mr-4">
          <ArrowLeft class="w-5 h-5 mr-1" /> 返回订单列表
        </RouterLink>
        <h1 class="text-2xl font-bold text-gray-900 border-l-2 border-gray-300 pl-4">订单详情</h1>
      </div>

      <!-- 加载 -->
      <div v-if="loading" class="flex flex-col items-center py-24">
        <div class="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      </div>

      <div v-else-if="order" class="space-y-4">
        <!-- 状态卡 -->
        <section class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center justify-between">
          <div>
            <p class="text-xs text-gray-400 mb-1">订单号：{{ order.orderNo }}</p>
            <span :class="['text-base font-bold px-3 py-1 rounded-full', statusClass(order.orderStatus)]">
              {{ statusLabel(order.orderStatus) }}
            </span>
            <p v-if="order.orderStatus === 0 && order.expireTime" class="text-xs text-orange-500 mt-2 flex items-center gap-1">
              <Clock class="w-3 h-3" /> 剩余支付：<CountDown :expire-time="order.expireTime" />
            </p>
          </div>
          <div class="text-right">
            <p class="text-2xl font-bold text-red-500">¥{{ Number(order.payAmount).toFixed(2) }}</p>
            <p class="text-xs text-gray-400 mt-1">实付金额</p>
          </div>
        </section>

        <!-- 商品明细 -->
        <section class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div class="flex items-center gap-2 px-5 py-3 border-b border-gray-100 bg-gray-50/50">
            <Store class="w-4 h-4 text-emerald-600" />
            <span class="font-bold text-gray-800 text-sm">烟火邻里自营店</span>
          </div>
          <div class="divide-y divide-gray-100 p-5">
            <div v-for="item in order.items" :key="item.productId" class="py-4 first:pt-0 last:pb-0 flex gap-4">
              <div class="w-16 h-16 rounded-xl overflow-hidden border border-gray-100 shrink-0 bg-gray-50">
                <img :src="resolveImg(item.productImage)" :alt="item.productTitle" class="w-full h-full object-cover" />
              </div>
              <div class="flex-1 flex flex-col justify-between">
                <p class="text-sm font-bold text-gray-800 line-clamp-2">{{ item.productTitle }}</p>
                <div class="flex justify-between items-center">
                  <span class="text-xs text-gray-400">x{{ item.quantity }}</span>
                  <span class="text-sm font-bold text-gray-800">¥{{ Number(item.totalAmount).toFixed(2) }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="border-t border-gray-100 px-5 py-3 flex justify-between items-center">
            <span class="text-sm text-gray-500">共 {{ order.itemCount }} 件商品</span>
            <span class="text-sm font-bold text-gray-800">合计：¥{{ Number(order.totalAmount).toFixed(2) }}</span>
          </div>
        </section>

        <!-- 收货信息 -->
        <section class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 class="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <MapPin class="w-4 h-4 text-emerald-500" /> 收货信息
          </h3>
          <div class="text-sm text-gray-600 space-y-1.5">
            <div class="flex gap-2"><span class="text-gray-400 w-16 shrink-0">收货人</span><span class="font-medium">{{ order.receiverName }}</span></div>
            <div class="flex gap-2"><span class="text-gray-400 w-16 shrink-0">手机号</span><span>{{ order.receiverPhone }}</span></div>
            <div class="flex gap-2"><span class="text-gray-400 w-16 shrink-0">地址</span><span>{{ order.receiverProvince }} {{ order.receiverCity }} {{ order.receiverDistrict }} {{ order.receiverDetailAddress }}</span></div>
            <div v-if="order.remark" class="flex gap-2"><span class="text-gray-400 w-16 shrink-0">备注</span><span>{{ order.remark }}</span></div>
          </div>
        </section>

        <!-- 订单信息 -->
        <section class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 class="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <FileText class="w-4 h-4 text-emerald-500" /> 订单信息
          </h3>
          <div class="text-sm text-gray-600 space-y-1.5">
            <div class="flex gap-2"><span class="text-gray-400 w-20 shrink-0">订单号</span><span class="font-mono text-xs break-all">{{ order.orderNo }}</span></div>
            <div class="flex gap-2"><span class="text-gray-400 w-20 shrink-0">下单时间</span><span>{{ formatTime(order.createTime) }}</span></div>
            <div v-if="order.payTime" class="flex gap-2"><span class="text-gray-400 w-20 shrink-0">支付时间</span><span>{{ formatTime(order.payTime) }}</span></div>
            <div v-if="order.cancelTime" class="flex gap-2"><span class="text-gray-400 w-20 shrink-0">取消时间</span><span>{{ formatTime(order.cancelTime) }}</span></div>
            <div v-if="order.cancelReason" class="flex gap-2"><span class="text-gray-400 w-20 shrink-0">取消原因</span><span>{{ order.cancelReason }}</span></div>
          </div>
        </section>

        <!-- 操作按钮 -->
        <div class="flex justify-end gap-3">
          <button
            v-if="order.orderStatus === 0"
            @click="handleCancel"
            class="px-6 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:border-red-300 hover:text-red-500 text-sm font-bold transition-colors"
          >取消订单</button>
          <button
            v-if="order.orderStatus === 0"
            @click="gotoPay"
            class="px-8 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold transition-colors shadow-sm"
          >去支付</button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineComponent, h } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { ArrowLeft, MapPin, Store, FileText, Clock } from 'lucide-vue-next';
import Navbar from '@/components/Navbar.vue';
import { fetchOrderDetail, cancelOrder } from '@/lib/api';
import { API_BASE } from '@/lib/api';
import type { OrderDetail } from '@/lib/api';

const route = useRoute();
const router = useRouter();
const loading = ref(true);
const order = ref<OrderDetail | null>(null);

function resolveImg(url: string | null | undefined): string {
  if (!url) return '';
  let u = url.trim();
  if (u.startsWith('/api/file/')) u = u.replace(/^\/api\/file\//, '/file/');
  if (u.startsWith('/file/')) return API_BASE.replace(/\/$/, '') + u;
  return u;
}

onMounted(async () => {
  const orderNo = route.params.orderNo as string;
  try {
    order.value = await fetchOrderDetail(orderNo);
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
});

function statusLabel(s: number) {
  return ({ 0: '待支付', 1: '已支付', 2: '已取消', 3: '已关闭', 4: '已完成' } as Record<number,string>)[s] ?? '未知';
}
function statusClass(s: number) {
  return ({ 0: 'bg-orange-100 text-orange-600', 1: 'bg-emerald-100 text-emerald-700', 2: 'bg-gray-100 text-gray-500', 3: 'bg-gray-100 text-gray-500', 4: 'bg-blue-100 text-blue-600' } as Record<number,string>)[s] ?? 'bg-gray-100 text-gray-500';
}
function formatTime(t: string | null) {
  return t ? t.replace('T', ' ').substring(0, 16) : '';
}

async function handleCancel() {
  if (!order.value || !window.confirm('确定要取消该订单吗？')) return;
  try {
    await cancelOrder(order.value.orderNo);
    order.value = await fetchOrderDetail(order.value.orderNo);
  } catch (e: unknown) {
    alert(e instanceof Error ? e.message : '取消失败');
  }
}

function gotoPay() {
  if (!order.value) return;
  router.push({ name: 'OrderPay', query: { orderNo: order.value.orderNo, amount: order.value.payAmount } });
}

const CountDown = defineComponent({
  props: { expireTime: { type: String, required: true } },
  setup(props) {
    const remain = ref('');
    function calc() {
      const diff = new Date(props.expireTime).getTime() - Date.now();
      if (diff <= 0) { remain.value = '已过期'; return; }
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      remain.value = `${m}分${String(s).padStart(2, '0')}秒`;
    }
    calc();
    setInterval(calc, 1000);
    return () => h('span', { class: 'font-bold' }, remain.value);
  },
});
</script>
