<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <Navbar />
    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">我的订单</h1>

      <!-- 状态 Tab -->
      <div class="flex gap-1 bg-white rounded-2xl p-1 shadow-sm border border-gray-100 mb-6">
        <button
          v-for="tab in tabs"
          :key="String(tab.value)"
          @click="activeTab = tab.value; pageNum = 1; loadOrders()"
          :class="[
            'flex-1 py-2.5 text-sm font-bold rounded-xl transition-all',
            activeTab === tab.value ? 'bg-emerald-500 text-white shadow' : 'text-gray-500 hover:text-emerald-600'
          ]"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- 加载中 -->
      <div v-if="loading" class="flex flex-col items-center py-24">
        <div class="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p class="text-gray-400 text-sm">加载订单中...</p>
      </div>

      <!-- 空状态 -->
      <div v-else-if="orders.length === 0" class="bg-white rounded-2xl p-16 flex flex-col items-center border border-gray-100">
        <PackageOpen class="w-16 h-16 text-gray-200 mb-4" />
        <p class="text-gray-400 text-sm">暂无相关订单</p>
        <RouterLink to="/" class="mt-6 bg-emerald-500 text-white px-8 py-3 rounded-full text-sm font-bold">去逛逛</RouterLink>
      </div>

      <!-- 订单列表 -->
      <div v-else class="space-y-4">
        <div
          v-for="order in orders"
          :key="order.orderNo"
          class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
        >
          <!-- 订单头 -->
          <div class="flex items-center justify-between px-5 py-3 bg-gray-50/70 border-b border-gray-100">
            <span class="text-xs text-gray-500 font-medium">订单号：{{ order.orderNo }}</span>
            <span :class="['text-xs font-bold px-2.5 py-1 rounded-full', statusClass(order.orderStatus)]">
              {{ statusLabel(order.orderStatus) }}
            </span>
          </div>

          <!-- 订单信息 -->
          <div class="px-5 py-4 flex items-center justify-between">
            <div class="text-sm text-gray-600">
              <p class="font-medium text-gray-900 mb-1">共 {{ order.itemCount }} 件商品</p>
              <p class="text-xs text-gray-400">{{ formatTime(order.createTime) }}</p>
              <p v-if="order.orderStatus === 0 && order.expireTime" class="text-xs text-orange-500 mt-1 flex items-center gap-1">
                <Clock class="w-3 h-3" /> 剩余支付：<CountDown :expire-time="order.expireTime" @expired="loadOrders" />
              </p>
            </div>
            <div class="text-right">
              <p class="text-xl font-bold text-red-500">¥{{ Number(order.payAmount).toFixed(2) }}</p>
              <p class="text-xs text-gray-400 mt-0.5">实付金额</p>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="flex justify-end gap-2 px-5 pb-4">
            <button
              v-if="order.orderStatus === 0"
              @click="handleCancel(order.orderNo)"
              class="px-4 py-2 text-sm border border-gray-200 text-gray-600 rounded-xl hover:border-red-300 hover:text-red-500 transition-colors font-medium"
            >
              取消订单
            </button>
            <button
              v-if="order.orderStatus === 0"
              @click="gotoPay(order)"
              class="px-5 py-2 text-sm bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-colors shadow-sm"
            >
              去支付
            </button>
            <RouterLink
              :to="{ name: 'OrderDetail', params: { orderNo: order.orderNo } }"
              class="px-4 py-2 text-sm border border-gray-200 text-gray-600 rounded-xl hover:border-emerald-300 hover:text-emerald-600 transition-colors font-medium"
            >
              查看详情
            </RouterLink>
          </div>
        </div>

        <!-- 分页 -->
        <div v-if="total > pageSize" class="flex justify-center gap-2 mt-6">
          <button
            v-for="p in totalPages"
            :key="p"
            @click="pageNum = p; loadOrders()"
            :class="[
              'w-9 h-9 rounded-xl text-sm font-bold transition-all',
              pageNum === p ? 'bg-emerald-500 text-white shadow' : 'bg-white border border-gray-200 text-gray-600 hover:border-emerald-300'
            ]"
          >{{ p }}</button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineComponent, h } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { PackageOpen, Clock } from 'lucide-vue-next';
import Navbar from '@/components/Navbar.vue';
import { fetchOrderList, cancelOrder } from '@/lib/api';
import type { OrderListItem } from '@/lib/api';

const router = useRouter();

const tabs = [
  { label: '全部', value: undefined as number | undefined },
  { label: '待支付', value: 0 },
  { label: '已支付', value: 1 },
  { label: '已取消', value: 2 },
  { label: '已关闭', value: 3 },
];
const activeTab = ref<number | undefined>(undefined);
const loading = ref(false);
const orders = ref<OrderListItem[]>([]);
const total = ref(0);
const pageNum = ref(1);
const pageSize = 10;
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)));

async function loadOrders() {
  loading.value = true;
  try {
    const res = await fetchOrderList({ orderStatus: activeTab.value, pageNum: pageNum.value, pageSize });
    orders.value = res.list ?? [];
    total.value = res.total ?? 0;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
}

onMounted(loadOrders);

function statusLabel(s: number) {
  return ({ 0: '待支付', 1: '已支付', 2: '已取消', 3: '已关闭', 4: '已完成' } as Record<number,string>)[s] ?? '未知';
}
function statusClass(s: number) {
  return ({ 0: 'bg-orange-100 text-orange-600', 1: 'bg-emerald-100 text-emerald-700', 2: 'bg-gray-100 text-gray-500', 3: 'bg-gray-100 text-gray-500', 4: 'bg-blue-100 text-blue-600' } as Record<number,string>)[s] ?? 'bg-gray-100 text-gray-500';
}
function formatTime(t: string) {
  return t ? t.replace('T', ' ').substring(0, 16) : '';
}

async function handleCancel(orderNo: string) {
  if (!window.confirm('确定要取消该订单吗？')) return;
  try {
    await cancelOrder(orderNo);
    await loadOrders();
  } catch (e: unknown) {
    alert(e instanceof Error ? e.message : '取消失败');
  }
}

function gotoPay(order: OrderListItem) {
  router.push({ name: 'OrderPay', query: { orderNo: order.orderNo, amount: order.payAmount } });
}

// 内联倒计时组件
const CountDown = defineComponent({
  props: { expireTime: { type: String, required: true } },
  emits: ['expired'],
  setup(props, { emit }) {
    const remain = ref('');
    let timer: ReturnType<typeof setInterval>;
    function calc() {
      const diff = new Date(props.expireTime).getTime() - Date.now();
      if (diff <= 0) { remain.value = '已过期'; clearInterval(timer); emit('expired'); return; }
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      remain.value = `${m}分${String(s).padStart(2, '0')}秒`;
    }
    calc();
    timer = setInterval(calc, 1000);
    return () => h('span', { class: 'font-bold' }, remain.value);
  },
});
</script>
