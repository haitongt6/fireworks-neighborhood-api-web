<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <Navbar />

    <!-- Toast -->
    <Transition enter-active-class="transition-all duration-300 ease-out" enter-from-class="opacity-0 -translate-y-3" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition-all duration-200 ease-in" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-3">
      <div v-if="errorMsg" class="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-red-50 border border-red-200 text-red-700 rounded-2xl shadow-lg px-6 py-4 max-w-md w-full mx-4 flex items-center gap-3">
        <XCircle class="w-5 h-5 shrink-0 text-red-500" />
        <p class="text-sm font-medium flex-1">{{ errorMsg }}</p>
        <button @click="errorMsg = null"><X class="w-4 h-4" /></button>
      </div>
    </Transition>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex items-center mb-6">
        <RouterLink to="/cart" class="flex items-center text-gray-500 hover:text-emerald-600 transition-colors font-medium mr-4">
          <ArrowLeft class="w-5 h-5 mr-1" /> 返回购物车
        </RouterLink>
        <h1 class="text-2xl font-bold text-gray-900 border-l-2 border-gray-300 pl-4">确认订单</h1>
      </div>

      <!-- 加载中 -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-32">
        <div class="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p class="text-gray-400 text-sm">加载订单信息中...</p>
      </div>

      <!-- 确认页：购物车空 / 所选不在购物车（业务码 4001、4002） -->
      <div v-else-if="confirmLoadError" class="bg-white rounded-2xl p-16 flex flex-col items-center border border-gray-100 max-w-xl mx-auto">
        <AlertCircle class="w-16 h-16 text-amber-500 mb-4" />
        <p class="text-gray-800 text-center font-medium text-base leading-relaxed mb-8 px-2">{{ confirmLoadError }}</p>
        <div class="flex flex-wrap items-center justify-center gap-4">
          <RouterLink to="/cart" class="bg-emerald-500 text-white px-8 py-3 rounded-full font-bold hover:bg-emerald-600 transition-colors">返回购物车</RouterLink>
          <RouterLink to="/" class="border border-gray-200 text-gray-700 px-8 py-3 rounded-full font-bold hover:bg-gray-50 transition-colors">去逛逛</RouterLink>
        </div>
      </div>

      <!-- 确认页：其它错误（系统异常、网络等），走全局 Toast + 本页重试 -->
      <div v-else-if="confirmOtherError" class="bg-white rounded-2xl p-16 flex flex-col items-center border border-gray-100 max-w-xl mx-auto">
        <XCircle class="w-16 h-16 text-red-400 mb-4" />
        <p class="text-gray-800 text-center font-medium text-base leading-relaxed mb-8 px-2">{{ confirmOtherError }}</p>
        <div class="flex flex-wrap items-center justify-center gap-4">
          <button type="button" class="bg-emerald-500 text-white px-8 py-3 rounded-full font-bold hover:bg-emerald-600 transition-colors" @click="reloadConfirm">重新加载</button>
          <RouterLink to="/" class="border border-gray-200 text-gray-700 px-8 py-3 rounded-full font-bold hover:bg-gray-50 transition-colors">回首页</RouterLink>
        </div>
      </div>

      <!-- 无数据兜底（理论上确认接口成功即返回 VO） -->
      <div v-else-if="!confirm" class="bg-white rounded-2xl p-16 flex flex-col items-center border border-gray-100">
        <ShoppingCart class="w-16 h-16 text-gray-200 mb-4" />
        <p class="text-gray-500 mb-6">没有可结算的商品</p>
        <RouterLink to="/" class="bg-emerald-500 text-white px-8 py-3 rounded-full font-bold">去逛逛</RouterLink>
      </div>

      <div v-else class="flex flex-col lg:flex-row gap-6">
        <div class="flex-1 space-y-6">
          <!-- 确认页异常提示（库存/限购/下架/价格变动） -->
          <section v-if="confirm.issues && confirm.issues.length > 0" class="rounded-2xl border overflow-hidden shadow-sm">
            <div
              v-for="(issue, idx) in confirm.issues"
              :key="`${issue.issueType}-${issue.productId}-${idx}`"
              :class="[
                'px-4 py-3 text-sm flex gap-3 items-start border-b last:border-b-0',
                issue.issueType === 'PRICE_CHANGED'
                  ? 'bg-amber-50 border-amber-100 text-amber-900'
                  : 'bg-red-50 border-red-100 text-red-800',
              ]"
            >
              <component
                :is="issue.issueType === 'PRICE_CHANGED' ? AlertCircle : XCircle"
                class="w-5 h-5 shrink-0 mt-0.5"
                :class="issue.issueType === 'PRICE_CHANGED' ? 'text-amber-600' : 'text-red-500'"
              />
              <p class="flex-1 leading-relaxed">{{ issue.message }}</p>
            </div>
            <div
              v-if="hasBlockingIssues"
              class="px-4 py-3 bg-white text-xs text-gray-600 flex flex-wrap items-center gap-2"
            >
              <span>以上商品无法按当前数量结算，</span>
              <RouterLink to="/cart" class="text-emerald-600 font-semibold hover:underline">返回购物车</RouterLink>
              <span>修改数量或移除后再试。</span>
            </div>
          </section>

          <!-- 收货地址 -->
          <section class="bg-white rounded-2xl shadow-sm p-6 lg:p-8 border border-gray-100 relative overflow-hidden">
            <div class="absolute top-0 left-0 right-0 h-1 bg-[repeating-linear-gradient(45deg,#ff6b6b,#ff6b6b_10px,transparent_10px,transparent_20px,#4ecdc4_20px,#4ecdc4_30px,transparent_30px,transparent_40px)]"></div>
            <h2 class="text-lg font-bold text-gray-900 flex items-center mb-4">
              <MapPin class="w-5 h-5 mr-2 text-emerald-500" /> 收货地址
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="text-xs text-gray-500 mb-1 block">收货人</label>
                <input v-model="addr.name" type="text" placeholder="请输入收货人姓名" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400 transition-colors" />
              </div>
              <div>
                <label class="text-xs text-gray-500 mb-1 block">手机号</label>
                <input v-model="addr.phone" type="text" placeholder="请输入手机号" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400 transition-colors" />
              </div>
              <div>
                <label class="text-xs text-gray-500 mb-1 block">省</label>
                <input v-model="addr.province" type="text" placeholder="如：广东省" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400 transition-colors" />
              </div>
              <div>
                <label class="text-xs text-gray-500 mb-1 block">市</label>
                <input v-model="addr.city" type="text" placeholder="如：深圳市" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400 transition-colors" />
              </div>
              <div>
                <label class="text-xs text-gray-500 mb-1 block">区</label>
                <input v-model="addr.district" type="text" placeholder="如：南山区" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400 transition-colors" />
              </div>
              <div>
                <label class="text-xs text-gray-500 mb-1 block">详细地址</label>
                <input v-model="addr.detail" type="text" placeholder="街道、楼栋、门牌号" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400 transition-colors" />
              </div>
            </div>
          </section>

          <!-- 商品列表 -->
          <section class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="p-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
              <Store class="w-5 h-5 text-emerald-600" />
              <span class="font-bold text-gray-800">烟火邻里自营店</span>
              <span class="text-sm text-gray-500 ml-auto">共 {{ confirm.itemCount }} 件</span>
            </div>
            <div class="divide-y divide-gray-100 p-6">
              <div v-for="item in confirm.items" :key="item.productId" class="py-4 first:pt-0 last:pb-0 flex gap-4">
                <div class="w-20 h-20 rounded-xl overflow-hidden border border-gray-100 shrink-0 bg-gray-50">
                  <img :src="resolveImg(item.productImage)" :alt="item.productTitle" class="w-full h-full object-cover" />
                </div>
                <div class="flex-1 flex flex-col justify-between">
                  <div class="flex justify-between gap-4">
                    <h3 class="text-sm font-bold text-gray-800 line-clamp-2">{{ item.productTitle }}</h3>
                    <div class="text-right shrink-0">
                      <div class="text-sm font-bold text-gray-900">
                        <template v-if="item.priceChanged && item.previousPrice != null">
                          <span class="text-xs text-gray-400 line-through font-normal mr-1">¥{{ Number(item.previousPrice).toFixed(2) }}</span>
                        </template>
                        ¥{{ Number(item.productPrice).toFixed(2) }}
                      </div>
                      <div v-if="item.priceChanged" class="text-xs text-amber-600 font-medium mt-0.5">价格已更新</div>
                      <div class="text-xs text-gray-400 mt-1">x{{ item.quantity }}</div>
                    </div>
                  </div>
                  <div class="text-xs text-emerald-600 font-medium">小计：¥{{ Number(item.totalAmount).toFixed(2) }}</div>
                </div>
              </div>
            </div>
            <div class="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <span class="text-sm text-gray-600 font-medium">订单备注</span>
              <input v-model="remark" type="text" placeholder="选填，请先和商家协商一致" class="text-sm bg-transparent border-none text-right focus:outline-none w-2/3 placeholder-gray-400" />
            </div>
          </section>
        </div>

        <!-- 右侧结算 -->
        <div class="w-full lg:w-96 shrink-0">
          <div class="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 sticky top-24">
            <h2 class="text-lg font-bold text-gray-900 mb-6">订单详情</h2>
            <div class="space-y-4 text-sm mb-6">
              <div class="flex justify-between text-gray-600">
                <span>商品总价</span>
                <span class="font-medium">¥{{ Number(confirm.totalAmount).toFixed(2) }}</span>
              </div>
              <div class="flex justify-between text-gray-600">
                <span>运费</span>
                <span class="font-medium text-emerald-600">免运费</span>
              </div>
            </div>
            <div class="border-t border-gray-100 pt-4 mb-8">
              <div class="flex justify-between items-baseline">
                <span class="text-base font-bold text-gray-900">实付款</span>
                <span class="text-3xl font-bold text-red-500 tracking-tight">
                  <span class="text-lg mr-1">¥</span>{{ Number(confirm.totalAmount).toFixed(2) }}
                </span>
              </div>
            </div>
            <button type="button" @click="handleSubmit" :disabled="isSubmitting || !canSubmitOrder"
              :class="['w-full py-4 rounded-xl font-bold text-white text-lg transition-all shadow-lg flex items-center justify-center', (isSubmitting || !canSubmitOrder) ? 'bg-emerald-400 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30']">
              <template v-if="isSubmitting">
                <svg class="animate-spin h-5 w-5 text-white mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                处理中...
              </template>
              <template v-else>提交订单</template>
            </button>
            <div class="mt-4 text-center text-xs text-gray-400 flex items-center justify-center gap-1">
              <ShieldCheck class="w-3.5 h-3.5" /> 平台保障 · 交易安全
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { RouterLink, useRouter, useRoute } from 'vue-router';
import { MapPin, Store, ArrowLeft, ShoppingCart, ShieldCheck, X, XCircle, AlertCircle } from 'lucide-vue-next';
import Navbar from '@/components/Navbar.vue';
import { useCartStore } from '@/stores/cart';
import {
  ApiError,
  fetchOrderConfirm,
  ORDER_CONFIRM_CART_EMPTY,
  ORDER_CONFIRM_SELECTION_NOT_IN_CART,
  submitOrder,
} from '@/lib/api';
import type { OrderConfirmVO, OrderConfirmIssueVO } from '@/lib/api';
import { API_BASE } from '@/lib/api';

const cartStore = useCartStore();
const router = useRouter();
const route = useRoute();

const loading = ref(true);
const confirm = ref<OrderConfirmVO | null>(null);
/** 业务码 4001/4002：购物车场景，展示返回购物车 */
const confirmLoadError = ref<string | null>(null);
/** 其它加载失败：与全局 Toast 一致，提供重试 */
const confirmOtherError = ref<string | null>(null);
const isSubmitting = ref(false);
const errorMsg = ref<string | null>(null);
const remark = ref('');

const addr = ref({
  name: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detail: '',
});

/** 除价格变动外的问题（库存/限购/下架），需用户回购物车处理 */
const hasBlockingIssues = computed(() => {
  const list = confirm.value?.issues;
  if (!list?.length) {
    return false;
  }
  return list.some((i: OrderConfirmIssueVO) => i.issueType !== 'PRICE_CHANGED');
});

const canSubmitOrder = computed(() => (confirm.value?.items?.length ?? 0) > 0);

function resolveImg(url: string | null | undefined): string {
  if (!url || !url.trim()) return '';
  let u = url.trim();
  if (u.startsWith('/api/file/')) u = u.replace(/^\/api\/file\//, '/file/');
  if (u.startsWith('/file/')) return API_BASE.replace(/\/$/, '') + u;
  return u;
}

function showError(msg: string) {
  errorMsg.value = msg;
  setTimeout(() => { errorMsg.value = null; }, 4000);
}

function parseRouteProductIds(): number[] | undefined {
  const idsParam = String(route.query.productIds || '').trim();
  if (!idsParam) {
    return undefined;
  }
  return idsParam.split(',').map((s) => Number(s)).filter((n) => Number.isFinite(n) && n > 0);
}

async function reloadConfirm() {
  loading.value = true;
  confirmLoadError.value = null;
  confirmOtherError.value = null;
  confirm.value = null;
  try {
    confirm.value = await fetchOrderConfirm(parseRouteProductIds());
  } catch (e: unknown) {
    if (
      e instanceof ApiError &&
      (e.code === ORDER_CONFIRM_CART_EMPTY || e.code === ORDER_CONFIRM_SELECTION_NOT_IN_CART)
    ) {
      confirmLoadError.value = e.message;
    } else {
      const msg = e instanceof Error ? e.message : '获取订单信息失败';
      confirmOtherError.value = msg;
      showError(msg);
    }
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  reloadConfirm();
});

async function handleSubmit() {
  if (!confirm.value) return;
  if (!addr.value.name.trim()) { showError('请填写收货人姓名'); return; }
  if (!addr.value.phone.trim()) { showError('请填写手机号'); return; }
  if (!addr.value.province.trim()) { showError('请填写省份'); return; }
  if (!addr.value.city.trim()) { showError('请填写城市'); return; }
  if (!addr.value.district.trim()) { showError('请填写区/县'); return; }
  if (!addr.value.detail.trim()) { showError('请填写详细地址'); return; }

  isSubmitting.value = true;
  try {
    const result = await submitOrder({
      submitToken: confirm.value.submitToken,
      sourceType: confirm.value.sourceType,
      items: confirm.value.items.map(i => ({ productId: i.productId, quantity: i.quantity })),
      receiverName: addr.value.name,
      receiverPhone: addr.value.phone,
      receiverProvince: addr.value.province,
      receiverCity: addr.value.city,
      receiverDistrict: addr.value.district,
      receiverDetailAddress: addr.value.detail,
      remark: remark.value || undefined,
    });
    // 刷新购物车
    try { await cartStore.loadCart(); } catch {}
    // 跳转支付页
    router.push({ name: 'OrderPay', query: { orderNo: result.orderNo, payOrderNo: result.payOrderNo, amount: result.payAmount } });
  } catch (e: unknown) {
    showError(e instanceof Error ? e.message : '提交订单失败');
  } finally {
    isSubmitting.value = false;
  }
}
</script>
