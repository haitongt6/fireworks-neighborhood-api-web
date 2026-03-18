<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
    <RouterLink to="/" class="absolute top-8 left-8 flex items-center text-gray-500 hover:text-emerald-600 transition-colors font-medium">
      <ArrowLeft class="w-5 h-5 mr-2" /> 返回首页
    </RouterLink>

    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="flex justify-center mb-6">
        <div class="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
          <span class="text-white font-bold text-2xl">烟</span>
        </div>
      </div>
      <h2 class="text-center text-3xl font-extrabold text-gray-900 tracking-tight">
        欢迎来到烟火邻里
      </h2>
      <p class="mt-3 text-center text-sm text-gray-500 font-medium">
        新鲜实惠，每天为您精选源头好货
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-10 px-4 shadow-xl shadow-gray-200/50 sm:rounded-3xl sm:px-10 border border-gray-100">
        <form class="space-y-6" @submit.prevent="handleLogin">
          <div>
            <label for="phone" class="block text-sm font-bold text-gray-700 mb-2">
              手机号码
            </label>
            <div class="mt-1">
              <input
                id="phone"
                v-model="phone"
                name="phone"
                type="tel"
                autocomplete="tel"
                required
                maxlength="11"
                placeholder="请输入手机号码"
                class="appearance-none block w-full px-4 py-3.5 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent sm:text-sm transition-all bg-gray-50 focus:bg-white font-medium"
              />
            </div>
          </div>

          <div>
            <label for="verifyCode" class="block text-sm font-bold text-gray-700 mb-2">
              验证码
            </label>
            <div class="mt-1 relative">
              <input
                id="verifyCode"
                v-model="verifyCode"
                name="verifyCode"
                type="text"
                inputmode="numeric"
                autocomplete="one-time-code"
                required
                maxlength="6"
                placeholder="请输入6位验证码"
                class="appearance-none block w-full px-4 py-3.5 pr-32 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent sm:text-sm transition-all bg-gray-50 focus:bg-white font-medium tracking-widest"
              />
              <button
                type="button"
                :disabled="countdown > 0 || sendingCode"
                @click="handleSendCode"
                :class="[
                  'absolute right-2 top-1/2 -translate-y-1/2 text-sm font-bold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap',
                  countdown > 0 || sendingCode
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-emerald-50 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 cursor-pointer'
                ]"
              >
                {{ sendingCode ? '发送中...' : countdown > 0 ? `重新获取(${countdown}s)` : '获取验证码' }}
              </button>
            </div>
          </div>

          <p v-if="errorMsg" class="text-sm text-red-500 font-medium -mt-2">{{ errorMsg }}</p>

          <div class="pt-2">
            <button
              type="submit"
              :disabled="loading"
              :class="[
                'w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-base font-bold text-white transition-all',
                loading
                  ? 'bg-emerald-400 cursor-not-allowed shadow-emerald-400/30'
                  : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500'
              ]"
            >
              {{ loading ? '登录中...' : '登录 / 注册' }}
            </button>
          </div>
        </form>

        <div class="mt-8">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-200" />
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-4 bg-white text-gray-400 font-medium">
                其他登录方式
              </span>
            </div>
          </div>

          <div class="mt-6 grid grid-cols-2 gap-4">
            <button class="w-full inline-flex justify-center items-center py-2.5 px-4 border border-gray-200 rounded-xl shadow-sm bg-white text-sm font-bold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all">
              微信登录
            </button>
            <button class="w-full inline-flex justify-center items-center py-2.5 px-4 border border-gray-200 rounded-xl shadow-sm bg-white text-sm font-bold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all">
              支付宝登录
            </button>
          </div>
        </div>
      </div>

      <div class="mt-8 flex items-center justify-center text-xs text-gray-500 font-medium">
        <ShieldCheck class="w-4 h-4 mr-1 text-emerald-500" />
        <span>登录即代表您同意 <a href="#" class="text-emerald-600 hover:underline">用户协议</a> 和 <a href="#" class="text-emerald-600 hover:underline">隐私政策</a></span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { RouterLink } from 'vue-router';
import { ArrowLeft, ShieldCheck } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';
import { sendVerifyCode } from '@/lib/api';

const phone = ref('');
const verifyCode = ref('');
const loading = ref(false);
const sendingCode = ref(false);
const countdown = ref(0);
const errorMsg = ref('');

const router = useRouter();
const authStore = useAuthStore();

let timer: ReturnType<typeof setInterval> | null = null;

function startCountdown() {
  countdown.value = 60;
  timer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(timer!);
      timer = null;
    }
  }, 1000);
}

async function handleSendCode() {
  if (countdown.value > 0 || sendingCode.value) return;
  if (!/^1[3-9]\d{9}$/.test(phone.value)) {
    errorMsg.value = '请输入正确的手机号';
    return;
  }
  errorMsg.value = '';
  sendingCode.value = true;
  try {
    await sendVerifyCode(phone.value);
    startCountdown();
  } catch (e: unknown) {
    errorMsg.value = e instanceof Error ? e.message : '验证码发送失败';
  } finally {
    sendingCode.value = false;
  }
}

async function handleLogin() {
  if (loading.value) return;
  errorMsg.value = '';
  if (!/^1[3-9]\d{9}$/.test(phone.value)) {
    errorMsg.value = '请输入正确的手机号';
    return;
  }
  if (!/^\d{6}$/.test(verifyCode.value)) {
    errorMsg.value = '请输入6位数字验证码';
    return;
  }
  loading.value = true;
  try {
    await authStore.login(phone.value, verifyCode.value);
    const redirect = (router.currentRoute.value.query.redirect as string) || '/';
    router.push(redirect);
  } catch (e: unknown) {
    errorMsg.value = e instanceof Error ? e.message : '登录失败';
  } finally {
    loading.value = false;
  }
}

onBeforeUnmount(() => {
  if (timer) clearInterval(timer);
});
</script>
