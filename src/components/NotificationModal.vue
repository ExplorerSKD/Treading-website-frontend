<template>
    <Modal v-model="showNotificationModal" @close="close">
        <div class="rounded-xl w-full mx-auto text-custom-text">

            <!-- HEADER -->
            <div class="border-b border-custom-border px-4 py-3 flex justify-between items-center">
                <div>
                    <p class="text-base font-semibold">
                        Notifications
                    </p>
                    <p class="text-xs text-custom-grey">
                        {{ unreadCount }} unread
                    </p>
                </div>

                <button v-if="unreadCount" @click="markAllRead"
                    class="text-xs font-semibold text-blue-500 hover:text-blue-400">
                    Mark all as read
                </button>
            </div>

            <!-- BODY -->
            <div class="max-h-[70vh] overflow-y-auto divide-y divide-custom-border">

                <!-- EMPTY -->
                <div v-if="!notifications.length" class="px-4 py-10 text-center text-sm text-custom-grey">
                    No notifications 🎉
                </div>

                <!-- LIST -->
                <div v-for="n in notifications" :key="n.id" class="px-4 py-3 flex gap-3 cursor-pointer transition
                           hover:bg-custom-border/40" :class="!n.is_read ? 'bg-custom-border/20' : ''"
                    @click="markSingleRead(n)">

                    <!-- READ INDICATOR -->
                    <span class="mt-1 h-2 w-2 rounded-full shrink-0"
                        :class="n.is_read ? 'bg-transparent' : 'bg-blue-500'" />

                    <!-- CONTENT -->
                    <div class="flex-1">
                        <div class="flex justify-between items-start">
                            <p class="text-sm font-semibold"
                                :class="n.is_read ? 'text-custom-grey' : 'text-custom-text'">
                                {{ n.title }}
                            </p>

                            <span class="text-[10px] text-custom-grey">
                                {{ formatTime(n.created_at) }}
                            </span>
                        </div>

                        <p class="text-xs mt-0.5 leading-relaxed"
                            :class="n.is_read ? 'text-custom-grey' : 'text-custom-text'">
                            {{ n.message }}
                        </p>
                    </div>
                </div>
            </div>

            <!-- FOOTER -->
            <div class="border-t border-custom-border px-4 py-3">
                <button @click="close" class="w-full py-2 rounded-lg font-semibold
                           bg-custom-primary hover:bg-custom-primary/90
                           text-white">
                    Close
                </button>
            </div>

        </div>
    </Modal>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import Modal from '@/components/Modal.vue'
import { useNotificationStore } from '@/stores/notifications'

/* ---------------- STORE ---------------- */
const notificationStore = useNotificationStore()
const { notifications, showNotificationModal } = storeToRefs(notificationStore)

/* ---------------- COMPUTED ---------------- */
const unreadCount = computed(() =>
    notifications.value.filter(n => !n.is_read).length
)

/* ---------------- ACTIONS ---------------- */
const close = () => {
    showNotificationModal.value = false
}

const markSingleRead = async (n) => {
    if (n.is_read) return

    await notificationStore.markRead(n.id)
    n.is_read = true // optimistic UI
}

const markAllRead = async () => {
    await notificationStore.markRead()
    notifications.value.forEach(n => n.is_read = true)
}

/* ---------------- HELPERS ---------------- */
const formatTime = (ts) => {
    const d = new Date(ts)
    return d.toLocaleString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: 'short'
    })
}
</script>
