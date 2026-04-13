<template>
    <div class="flex items-center justify-between w-full mb-6">
        <div class="md:hidden flex items-center gap-2">
            <img src="/logo.png" class="w-8 h-8 rounded-lg" alt="">
            <span class="text-base font-semibold text-custom-text">Hello, {{ profile.full_name || 'User' }}</span>
        </div>
        <div class="hidden md:block">
            <h2 class="text-2xl font-bold text-custom-primary">Hello, {{ profile.full_name || 'User' }}</h2>
        </div>
        <div class="flex items-center gap-4">
            <button @click="showNotificationModal = true"
                class="rounded-full p-2.5 px-3 bg-[#F5F5F5] hover:bg-gray-200 transition-colors">
                <img v-if="isUnread" class="w-5" src="/notification-unread.svg" alt="notifications" />
                <img v-else class="w-5" src="/notification.svg" alt="notifications" />
            </button>
        </div>
    </div>
    <NotificationModal />
</template>

<script setup>
import { useNotificationStore } from '@/stores/notifications';
import { useProfileStore } from '@/stores/profile';
import { storeToRefs } from 'pinia';
import NotificationModal from './NotificationModal.vue';


const notificationStore = useNotificationStore();
const { showNotificationModal, isUnread } = storeToRefs(notificationStore)

const profileStore = useProfileStore();
const { profile } = storeToRefs(profileStore)

const props = defineProps({
    title: {
        type: String,
        default: ''
    }
})
</script>

<style lang="scss" scoped></style>