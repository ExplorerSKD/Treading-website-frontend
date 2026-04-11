import { makeRequest } from "@/request/requests";
import { defineStore, storeToRefs } from "pinia"
import { ref } from "vue"
import { useTickerStore } from "./ticker";

export const useProfileStore = defineStore('profile', () => {

    const tickerStore = useTickerStore();
    const profile = ref({});
    const endpoint = 'profile';

    const getProfile = async () => {
        try {
            const res = await makeRequest(endpoint, 'GET');
            if (res.data) {
                profile.value = res.data;
                tickerStore.startWebSocket(localStorage.getItem('token').slice(7))
            }
        } catch (error) {
            console.log('error in profileStore', error);
        }

    }

    const changePassword = async (data) => {
        try {
            const res = await makeRequest('changePassword', 'POST', data);
            if (res.status) {
                return res.status;
            }
        } catch (error) {
            console.log('error in profile store', error);
        }
    }

    getProfile()

    return {
        profile,
        getProfile,
        changePassword
    }
})