<template>
  <div class="app-header-bar">
    <div class="header-bar-top">
      <div class="header-bar-left">
        <span v-if="title" class="header-bar-title">{{ title }}</span>
        <!-- Slot for page-specific elements next to title -->
        <slot name="title-right"></slot>
      </div>
      <div class="header-bar-right">
        <slot name="actions"></slot>
        <div class="header-wallet-pill" @click="handleWalletClick">
          <i class="fas fa-wallet"></i><span class="header-wallet-text">Wallet</span>
        </div>
        <div class="header-nav-icon" @click="toggleTheme">
          <i :class="isDark ? 'fas fa-sun' : 'fas fa-moon'"></i>
        </div>
        <div class="header-nav-icon" @click="showNotificationModal = true">
          <i class="fas fa-bell"></i>
        </div>
      </div>
    </div>
    <NotificationModal />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useNotificationStore } from '@/stores/notifications'
import { useToastStore } from '@/stores/utils/toast'
import NotificationModal from '@/components/NotificationModal.vue'

defineProps({
  title: {
    type: String,
    default: ''
  }
})

const router = useRouter()
const notificationStore = useNotificationStore()
const toastStore = useToastStore()
const { showNotificationModal } = storeToRefs(notificationStore)

const isDark = ref(
  localStorage.getItem('app-theme') === 'dark' ||
  localStorage.getItem('marginApexTheme') === 'dark'
)

const applyTheme = (dark) => {
  document.body.classList.toggle('dark', dark)
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
  localStorage.setItem('marginApexTheme', dark ? 'dark' : 'light')
  localStorage.setItem('app-theme', dark ? 'dark' : 'light')
}

const toggleTheme = () => {
  isDark.value = !isDark.value
  applyTheme(isDark.value)
  toastStore.addToast('Theme', isDark.value ? 'Dark Mode Enabled' : 'Light Mode Enabled', 'info', 2000)
}

const handleWalletClick = () => {
  router.push({ name: 'wallet' })
}
</script>

<style scoped>
.app-header-bar {
  padding: 14px 16px;
  border-bottom: 1px solid #E8ECF0;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  z-index: 50;
  background: #FFFFFF;
}

.header-bar-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-bar-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-bar-title {
  font-weight: 700;
  font-size: 1.2rem;
  color: #1A1E2B;
}

.header-bar-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-nav-icon {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #F3F4F6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4B5563;
  cursor: pointer;
  border: 1px solid transparent;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.header-wallet-pill {
  background: #065F46;
  color: white;
  padding: 6px 14px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 700;
  font-size: 0.8rem;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(6, 95, 70, 0.2);
}

.header-wallet-text {
  display: none;
}

@media (min-width: 640px) {
  .header-wallet-text {
    display: inline;
    margin-left: 4px;
  }
}
</style>

<style>
/* Dark Mode for AppHeader */
[data-theme="dark"] .app-header-bar { background: #1a1f2d; border-bottom-color: #2D3748; }
[data-theme="dark"] .header-bar-title { color: #E8EAED; }
[data-theme="dark"] .header-nav-icon { background: #F3F4F6; color: #4B5563; }
[data-theme="dark"] .header-wallet-pill { background: #10B981; color: #111827; }
</style>
