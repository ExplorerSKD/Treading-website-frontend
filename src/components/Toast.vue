<template>
  <teleport to="body">
    <div class="toast-container fixed top-5 right-5 flex flex-col items-end gap-2"
      :style="{ zIndex: Math.max(zIndexValue + 1, currZindex + 1) }">
      <template v-if="toastsArray.length > 0">
        <div v-for="(item, index) in toastsArray" :key="item.id"
          class="relative text-gray-100 toast w-fit max-w-[90vw] sm:max-w-md transform transition-transform ease-out duration-300 flex items-center justify-start gap-6 px-4 py-3 min-w-[200px] border-l-4 rounded-r shadow-lg"
          :class="{
            'border-[#ed5f4b] bg-[#ad2c1b]': item.severity === 'error',
            'border-[#ffbb01] bg-[#b18a1d]': item.severity === 'warn',
            'border-[#22a94f] bg-[#189341]': item.severity === 'success',
            'border-[#0483e1] bg-[#165a8e]': item.severity === 'info'
          }">
          <button @click="hideToast(item.id)"
            class="absolute top-2 right-2 pi pi-times hover:opacity-75 transition-opacity"></button>

          <div class="text-gray-200 pr-6">
            <h4 class="text-[16px] font-bold mb-1">
              {{ item.summary }}
            </h4>
            <p class="text-[14px]">
              {{ item.detail }}
            </p>
          </div>
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
.glow {
  box-shadow: 0 0 15px;
}

.toast {
  animation: slideInBottom 0.2s ease-in-out, slideOutBottom 0.2s ease-in-out 1s forwards;
}

@keyframes slideInBottom {
  0% {
    opacity: 0;
    transform: translateX(100%);
  }

  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideOutBottom {
  0% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
}
</style>
