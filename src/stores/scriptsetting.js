import { makeRequest } from "@/request/requests";
import { defineStore, storeToRefs } from "pinia"
import { ref } from "vue"

export const useScriptSettingStore = defineStore('script-settings', () => {

    const scriptSettings = ref([]);
    const endpoint = 'scriptSettings';

    const getScriptSettings = async () => {
        try {
            const res = await makeRequest(endpoint, 'GET');
            if (res.data && res.data.length > 0) {
                scriptSettings.value = res.data;
            }
        } catch (error) {
            console.log('error in profileStore', error);
        }

    }

    getScriptSettings()

    return {
        scriptSettings,
        getScriptSettings,
    }
})