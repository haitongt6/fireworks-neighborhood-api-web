<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="visible"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4"
        @click.self="onCancel"
      >
        <!-- 背景遮罩 -->
        <div class="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"></div>

        <!-- 弹框主体 -->
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 scale-90 translate-y-4"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-90 translate-y-4"
        >
          <div
            v-if="visible"
            class="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
          >
            <!-- 顶部装饰 -->
            <div class="bg-gradient-to-br from-emerald-400 to-teal-500 px-8 pt-8 pb-10 text-center">
              <div class="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 class="text-white text-xl font-bold mb-1">{{ title }}</h2>
              <p class="text-white/80 text-sm leading-relaxed">{{ message }}</p>
            </div>

            <!-- 内容区 -->
            <div class="px-8 py-6">
              <div class="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-6">
                <svg class="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="text-sm text-amber-700 leading-relaxed">{{ hint }}</p>
              </div>

              <div class="flex flex-col gap-3">
                <button
                  type="button"
                  @click="onConfirm"
                  class="w-full bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-emerald-500/30 text-base"
                >
                  {{ confirmText }}
                </button>
                <button
                  type="button"
                  @click="onCancel"
                  class="w-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-600 font-semibold py-3.5 rounded-2xl transition-all text-base"
                >
                  {{ cancelText }}
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  visible: boolean;
  title?: string;
  message?: string;
  hint?: string;
  confirmText?: string;
  cancelText?: string;
}>(), {
  title: '请先登录',
  message: '登录后享受完整购物体验',
  hint: '登录后可加入购物车、查看订单、享受专属优惠',
  confirmText: '立即登录',
  cancelText: '稍后再说',
});

const emit = defineEmits<{
  confirm: [];
  cancel: [];
}>();

function onConfirm() {
  emit('confirm');
}

function onCancel() {
  emit('cancel');
}
</script>
