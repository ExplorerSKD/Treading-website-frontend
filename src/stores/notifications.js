import { makeRequest } from "@/request/requests"
import { defineStore } from "pinia"
import { ref } from "vue"

export const useNotificationStore = defineStore('notification', () => {

    const endpoint = 'notifications'
    const notifications = ref([]);
    const showNotificationModal = ref(false);
    const isUnread = ref(false);

    const getNotifications = async () => {
        try {
            const res = await makeRequest(endpoint, 'GET')
            if (res.status) {
                notifications.value = res.data;
                isUnread.value = res.data.some(notification => !notification.is_read);
            }

        } catch (error) {
            console.log('error in notification store', error);
        }
    }


    const markRead = async (id = null) => {
        try {

            if (id) {
                const res = await makeRequest(endpoint, 'POST', {}, {}, {}, id, 'read')
            } else {
                const res = await makeRequest(endpoint, 'POST', {}, {}, {}, 'read-all')
            }
            getNotifications()
        } catch (error) {
            console.log('error in notification store', error);
        }
    }
    getNotifications()
    return {
        markRead,
        getNotifications,
        notifications,
        showNotificationModal,
        isUnread
    }
})