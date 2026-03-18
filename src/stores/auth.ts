import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  loginByPhone,
  getMemberInfo,
  logout as apiLogout,
} from '@/lib/api';
import type { MemberInfo } from '@/lib/api';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'));
  const member = ref<MemberInfo | null>(null);

  const isLoggedIn = computed(() => !!token.value);

  async function login(phone: string, verifyCode: string) {
    const result = await loginByPhone(phone, verifyCode);
    token.value = result.token;
    member.value = result.member;
    localStorage.setItem('token', result.token);
  }

  async function fetchInfo() {
    if (!token.value) return;
    try {
      member.value = await getMemberInfo();
    } catch {
      clearAuth();
    }
  }

  async function logout() {
    try {
      await apiLogout();
    } finally {
      clearAuth();
    }
  }

  function clearAuth() {
    token.value = null;
    member.value = null;
    localStorage.removeItem('token');
  }

  return { token, member, isLoggedIn, login, fetchInfo, logout, clearAuth };
});
