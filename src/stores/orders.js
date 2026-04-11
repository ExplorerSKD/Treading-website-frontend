import { makeRequest } from "@/request/requests"
import { defineStore } from "pinia"
import { ref, watch } from "vue"

export const useOrderStore = defineStore('orders', () => {

    const endpoint = 'orders'

    // state
    const orders = ref([]);
    const openOrders = ref([]);
    const currentPage = ref(1)
    const totalPages = ref(1)
    const totalBuyTrades = ref(0)
    const totalSellTrades = ref(0)
    const loading = ref(false);
    const editData = ref(null)

    // query params (single source of truth)
    const params = ref({
        type: 'OPEN',
        search: '',
        page: 1,
    })

    // actions
    const getOrders = async () => {

        loading.value = true
        try {
            // build clean query params
            const cleanParams = Object.fromEntries(
                Object.entries(params.value).filter(([_, value]) => {
                    if (value === null || value === undefined) return false
                    if (typeof value === 'string' && value.trim() === '') return false
                    return true
                })
            )

            const res = await makeRequest(
                endpoint,
                'GET',
                {},
                {},
                cleanParams
            )

            if (res?.data) {
                orders.value = res.data.orders || []
                currentPage.value = res.data.page || 1
                totalPages.value = res.data.total_page || 1
                totalBuyTrades.value = res.data.total_buy_trades || 0
                totalSellTrades.value = res.data.total_sell_trades || 0
            }
            getOpenOrders()

        } catch (error) {
            console.log('error in order store', error)
        } finally {
            loading.value = false
        }
    }

    const getOpenOrders = async () => {
        try {

            const res = await makeRequest(
                endpoint,
                'GET',
                {},
                {},
                { type: 'OPEN', limit: 100 }

            )

            if (res?.data) {
                openOrders.value = res.data.orders || []
            }
        } catch (error) {
            console.log('error in order store', error)
        }
    }

    const placeOrders = async (form, id = null) => {
        try {
            if (id) {
                const res = await makeRequest(endpoint, 'PUT', form, {}, {}, '', id)
                if (res.data) return res.data

            }
            const res = await makeRequest(endpoint, 'POST', form)
            if (res.data) {
                return res.data
            }
        } catch (error) {
            console.log('error in orderstore', error);
        }
    }

    const deleteOrder = async (id) => {
        try {
            const res = await makeRequest(endpoint, 'DELETE', {}, {}, {}, '', id)
            if (res.data) return res.data
        } catch (err) {
            console.log('error in orderstore', err);
        }
    }


    getOrders()
    return {
        // state
        orders,
        currentPage,
        totalPages,
        totalBuyTrades,
        totalSellTrades,
        loading,
        params,
        editData,
        openOrders,
        // actions
        getOrders,
        deleteOrder,

        placeOrders
    }
})
