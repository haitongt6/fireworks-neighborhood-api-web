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
        <form class="space-y-6" @submit.prevent>
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
                placeholder="请输入手机号码"
                class="appearance-none block w-full px-4 py-3.5 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent sm:text-sm transition-all bg-gray-50 focus:bg-white font-medium"
              />
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm font-bold text-gray-700 mb-2">
              密码 / 验证码
            </label>
            <div class="mt-1 relative">
              <input
                id="password"
                v-model="password"
                name="password"
                type="password"
                autocomplete="current-password"
                required
                placeholder="请输入密码或验证码"
                class="appearance-none block w-full px-4 py-3.5 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent sm:text-sm transition-all bg-gray-50 focus:bg-white font-medium"
              />
              <button
                type="button"
                class="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-emerald-600 hover:text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                获取验证码
              </button>
            </div>
          </div>

          <div class="flex items-center justify-between pt-2">
            <div class="flex items-center">
              <input
                id="remember-me"
                v-model="rememberMe"
                name="remember-me"
                type="checkbox"
                class="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded cursor-pointer"
              />
              <label for="remember-me" class="ml-2 block text-sm text-gray-700 font-medium cursor-pointer">
                自动登录
              </label>
            </div>

            <div class="text-sm">
              <a href="#" class="font-medium text-gray-500 hover:text-emerald-600 transition-colors">
                忘记密码？
              </a>
            </div>
          </div>

          <div class="pt-2">
            <button
              type="submit"
              class="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-emerald-500/30 text-base font-bold text-white bg-emerald-500 hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all"
            >
              登录 / 注册
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
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import { ArrowLeft, ShieldCheck } from 'lucide-vue-next';

const phone = ref('');
const password = ref('');
const rememberMe = ref(false);
</script>
