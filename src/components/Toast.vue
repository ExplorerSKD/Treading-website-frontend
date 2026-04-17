<template>
  <teleport to="body">
    <div class="toast-container fixed bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 w-[calc(100%-32px)] max-w-[400px]"
      :style="{ zIndex: Math.max(zIndexValue + 1, currZindex + 1) }">
      <template v-if="toastsArray.length > 0">
        <div v-for="(item, index) in toastsArray" :key="item.id"
          class="relative capsule-toast animate-capsule flex items-center gap-1.5 px-4 py-2 w-full shadow-md transition-all duration-300"
          :class="{
            'bg-[#065F46]': item.severity === 'success',
            'bg-[#C62E2E]': item.severity === 'error',
            'bg-[#B18A1D]': item.severity === 'warn',
            'bg-[#165A8E]': item.severity === 'info'
          }"
          @click="hideToast(item.id)">
          
          <!-- Icon -->
          <div class="flex-shrink-0 flex items-center justify-center">
             <svg v-if="item.severity === 'success'" class="w-3 h-3 text-white" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                 <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path>
             </svg>
             <svg v-else-if="item.severity === 'error'" class="w-3 h-3 text-white" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                 <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
             </svg>
             <svg v-else class="w-3 h-3 text-white" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                 <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
             </svg>
          </div>

          <!-- Message -->
          <span class="text-white text-[12px] font-medium tracking-wide break-words">
            {{ item.detail || item.summary }}
          </span>
        </div>
      </template>
    </div>
  </teleport>
</template>

<script setup>
import { storeToRefs } from "pinia";
import { ref, computed, watch, watchEffect } from "vue";
import success from '/svg/tick.svg'
import cross from '/svg/cross.svg'
import pending from '/svg/pending.svg'
import info from '/svg/info.svg'
import { useToastStore } from "@/stores/utils/toast";


const toastStore = useToastStore();
let { toasts, showToastData } = storeToRefs(toastStore);

const currZindex = ref(0)
const toastsArray = computed(() => {
  return toastStore.toasts || []
})

const hideToast = (id) => {
  toasts.value = toasts.value.filter((toast) => toast.id !== id)
}

function getHighestZIndex() {
  const elements = [...document.querySelectorAll('body *')]
  const zIndexes = elements.map(el => parseFloat(window.getComputedStyle(el).zIndex))
    .filter(zIndex => !isNaN(zIndex))
  currZindex.value = Math.max(0, ...zIndexes)
  return Math.max(0, ...zIndexes)
}

const zIndexValue = computed(() => {
  if (toasts.value && toasts.value.length > 0) {
    return getHighestZIndex() + 1
  } else {
    return 1
  }
})

const getIcon = (type) => {
  switch (type) {
    case 'success':
      return success
    case 'error':
      return cross
    case 'warning':
      return pending
    default:
      return info
  }
}


</script>

<style scoped>
.capsule-toast {
    border-radius: 50px;
}

@keyframes slideUpFade {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-capsule {
    animation: slideUpFade 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
